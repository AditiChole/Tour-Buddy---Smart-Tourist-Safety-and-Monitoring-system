from __future__ import annotations

import argparse
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier

from dbscan_model import build_default_dbscan
from isolation_forest import build_default_isoforest


REQUIRED_COLUMNS = ["latitude", "longitude"]


def _ensure_columns(df: pd.DataFrame, required: list[str]) -> None:
    missing = [c for c in required if c not in df.columns]
    if missing:
        raise ValueError(f"Missing required columns: {missing}")


def _coerce_numeric(df: pd.DataFrame, cols: list[str], default: float) -> pd.DataFrame:
    out = df.copy()
    for c in cols:
        if c not in out.columns:
            out[c] = default
        out[c] = pd.to_numeric(out[c], errors="coerce").fillna(default)
    return out


def _parse_geo_loose(value: object) -> float:
    # Keep this in sync with evaluate.py so training doesn't turn bad coords into 0.0.
    if value is None:
        return float("nan")
    if isinstance(value, (int, float, np.integer, np.floating)):
        return float(value)
    s = str(value).strip()
    if not s:
        return float("nan")
    try:
        return float(s)
    except ValueError:
        pass
    sign = -1.0 if s.startswith("-") else 1.0
    digits = "".join(ch for ch in s if ch.isdigit())
    if len(digits) < 3:
        return float("nan")
    whole = digits[:2]
    frac = digits[2:]
    try:
        return sign * float(f"{whole}.{frac}")
    except ValueError:
        return float("nan")


def _build_cluster_risk_map(df: pd.DataFrame, cluster_col: str = "zone_cluster") -> dict[int, float]:
    # Compute a [0,1] risk per cluster based on incidents and lighting (if present).
    if cluster_col not in df.columns:
        return {}

    tmp = df.copy()
    if "incident_count" not in tmp.columns:
        tmp["incident_count"] = 0.0
    if "lighting" not in tmp.columns:
        tmp["lighting"] = 5.0

    cluster_map: dict[int, float] = {}
    cluster_series = pd.to_numeric(tmp[cluster_col], errors="coerce").dropna().astype(int)
    cluster_ids = sorted({int(x) for x in cluster_series.unique().tolist()})

    for cluster_id_int in cluster_ids:
        g = tmp.loc[cluster_series.index[cluster_series == cluster_id_int]]
        if g.empty:
            continue

        inc = float(g["incident_count"].mean())
        lig = float(g["lighting"].mean())
        inc_norm = max(0.0, min(1.0, inc / 10.0))
        lighting_risk = max(0.0, min(1.0, 1.0 - lig / 10.0))
        cluster_map[int(cluster_id_int)] = float(0.7 * inc_norm + 0.3 * lighting_risk)
    return cluster_map


def train(data_path: Path, out_path: Path, dbscan_eps: float, dbscan_min_samples: int, seed: int) -> dict[str, Any]:
    df = pd.read_csv(data_path)
    _ensure_columns(df, REQUIRED_COLUMNS)

    df["latitude"] = df["latitude"].map(_parse_geo_loose)
    df["longitude"] = df["longitude"].map(_parse_geo_loose)
    df = df.dropna(subset=["latitude", "longitude"])

    df = _coerce_numeric(df, ["crowd_density", "lighting", "incident_count", "hour"], default=5.0)

    coords = df[["latitude", "longitude"]].to_numpy(dtype=float)

    zone_model = build_default_dbscan(eps=dbscan_eps, min_samples=dbscan_min_samples).fit(coords)
    df["zone_cluster"] = zone_model.dbscan.labels_.astype(int)

    cluster_risk_map = _build_cluster_risk_map(df, cluster_col="zone_cluster")
    df["zone_risk"] = df["zone_cluster"].map(lambda c: cluster_risk_map.get(int(c), 0.2 if int(c) == -1 else 0.5)).astype(float)

    # Anomaly model: can be swapped to real movement features later.
    anomaly_features = ["latitude", "longitude", "hour", "crowd_density", "lighting", "incident_count"]
    anomaly_model = build_default_isoforest(feature_names=anomaly_features, contamination=0.06, seed=seed)
    anomaly_model.fit(df[anomaly_features].to_numpy(dtype=float))
    df["anomaly_score"] = anomaly_model.anomaly_score(df[anomaly_features].to_numpy(dtype=float))

    # Supervised classifier if labels exist.
    risk_classifier = None
    feature_columns = [
        "latitude",
        "longitude",
        "hour",
        "crowd_density",
        "lighting",
        "incident_count",
        "zone_cluster",
        "zone_risk",
        "anomaly_score",
    ]

    if "risk_level" in df.columns:
        y = df["risk_level"].astype(str)
        X = df[feature_columns].to_numpy(dtype=float)
        risk_classifier = RandomForestClassifier(
            n_estimators=350,
            random_state=seed,
            class_weight="balanced",
        )
        risk_classifier.fit(X, y)

    out_path.parent.mkdir(parents=True, exist_ok=True)
    bundle: dict[str, Any] = {
        "zone_model": zone_model,
        "anomaly_model": anomaly_model,
        "risk_classifier": risk_classifier,
        "feature_columns": feature_columns if risk_classifier is not None else [],
        "cluster_risk_map": cluster_risk_map,
        "train_info": {
            "rows": int(df.shape[0]),
            "dbscan_eps_scaled": float(dbscan_eps),
            "dbscan_min_samples": int(dbscan_min_samples),
            "has_labels": bool("risk_level" in df.columns),
            "seed": int(seed),
        },
    }
    joblib.dump(bundle, out_path)
    return bundle


def main() -> None:
    here = Path(__file__).resolve().parent
    parser = argparse.ArgumentParser(description="Train TourBuddy risk model (DBSCAN + IsolationForest + optional classifier).")
    parser.add_argument("--data", type=str, default=str(here / "dataset" / "sample_data.csv"))
    parser.add_argument("--out", type=str, default=str(here / "model" / "risk_model.pkl"))
    parser.add_argument("--dbscan-eps", type=float, default=0.8)
    parser.add_argument("--dbscan-min-samples", type=int, default=8)
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()

    bundle = train(
        data_path=Path(args.data),
        out_path=Path(args.out),
        dbscan_eps=float(args.dbscan_eps),
        dbscan_min_samples=int(args.dbscan_min_samples),
        seed=int(args.seed),
    )
    info = bundle.get("train_info", {})
    print(f"Saved model: {args.out}")
    print(f"Rows: {info.get('rows')} | Labels: {info.get('has_labels')} | DBSCAN eps(scaled): {info.get('dbscan_eps_scaled')}")


if __name__ == "__main__":
    main()
