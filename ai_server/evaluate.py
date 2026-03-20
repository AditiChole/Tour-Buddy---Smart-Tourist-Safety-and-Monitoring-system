from __future__ import annotations

import argparse
import json
from pathlib import Path
import tempfile

import numpy as np
import pandas as pd
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.model_selection import train_test_split

from prediction_service import RiskModelBundle
from train_model import train as train_bundle


def _ensure_columns(df: pd.DataFrame, cols: list[str]) -> None:
    missing = [c for c in cols if c not in df.columns]
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
    """
    Parse latitude/longitude values that may be messy strings.
    Example: "21.16.4424" -> 21.164424
    """
    if value is None:
        return float("nan")
    if isinstance(value, (int, float, np.integer, np.floating)):
        return float(value)

    s = str(value).strip()
    if not s:
        return float("nan")

    # Fast path: normal float.
    try:
        return float(s)
    except ValueError:
        pass

    sign = -1.0 if s.startswith("-") else 1.0
    digits = "".join(ch for ch in s if ch.isdigit())
    if len(digits) < 3:
        return float("nan")

    # Heuristic: India-style coords (e.g., 21.x, 79.x) -> insert decimal after 2 digits.
    whole = digits[:2]
    frac = digits[2:]
    try:
        return sign * float(f"{whole}.{frac}")
    except ValueError:
        return float("nan")


def _risk_level_from_score(score: float) -> str:
    score = float(score)
    if score >= 0.66:
        return "Unsafe"
    if score >= 0.33:
        return "Medium"
    return "Safe"


def _binary_level(level: str) -> str:
    # For the demo map we only show Safe/Unsafe; treat Medium as Unsafe.
    return "Safe" if str(level) == "Safe" else "Unsafe"


def _haversine_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    # Returns distance in meters.
    r = 6371000.0
    p1 = np.radians(lat1)
    p2 = np.radians(lat2)
    dp = np.radians(lat2 - lat1)
    dl = np.radians(lon2 - lon1)
    a = np.sin(dp / 2.0) ** 2 + np.cos(p1) * np.cos(p2) * np.sin(dl / 2.0) ** 2
    c = 2.0 * np.arctan2(np.sqrt(a), np.sqrt(1.0 - a))
    return float(r * c)


def _export_zones_json(
    *,
    out_path: Path,
    df_points: pd.DataFrame,
    cluster_col: str = "zone_cluster",
    default_point_radius_m: float = 150.0,
    mode: str = "auto",  # "auto" | "point" | "cluster"
) -> None:
    # Build "geofence circles" either:
    # - per point (uses risk_level per row; best for a few real locations)
    # - per DBSCAN cluster (merges nearby points into one zone)
    zones: list[dict] = []
    mode = str(mode).lower().strip()

    def export_point_zones() -> None:
        for idx, r in enumerate(df_points.itertuples(index=False), start=1):
            lat = float(getattr(r, "latitude"))
            lon = float(getattr(r, "longitude"))
            if not np.isfinite(lat) or not np.isfinite(lon):
                continue

            label = str(getattr(r, "risk_level", "Medium"))
            if label not in ("Safe", "Medium", "Unsafe"):
                label = "Medium"
            label = _binary_level(label)

            radius_m = float(max(60.0, min(400.0, default_point_radius_m)))
            zones.append(
                {
                    "cluster_id": idx,
                    "center_lat": lat,
                    "center_lon": lon,
                    "radius_m": radius_m,
                    "zone_label": label,
                    "points": 1,
                }
            )

        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(json.dumps(zones, indent=2), encoding="utf-8")

    if mode == "point":
        export_point_zones()
        return

    if cluster_col not in df_points.columns or mode == "cluster" and df_points.empty:
        if mode == "cluster":
            out_path.write_text("[]", encoding="utf-8")
            return
        export_point_zones()
        return

    # Avoid iterating groupby keys (often flagged by static analyzers).
    cluster_series = pd.to_numeric(df_points[cluster_col], errors="coerce").dropna().astype(int)
    cluster_ids = sorted({int(x) for x in cluster_series.unique().tolist() if int(x) != -1})

    # Auto mode: for small real datasets, point-zones are clearer than clustering.
    if mode == "auto" and len(df_points) <= 25:
        export_point_zones()
        return

    if mode == "auto" and not cluster_ids:
        export_point_zones()
        return

    for cluster_id_int in cluster_ids:
        g = df_points.loc[cluster_series.index[cluster_series == cluster_id_int]]

        center_lat = float(g["latitude"].mean())
        center_lon = float(g["longitude"].mean())

        # Radius = max distance from center to any point in cluster + padding.
        max_d = 0.0
        for r in g.itertuples(index=False):
            d = _haversine_m(center_lat, center_lon, float(getattr(r, "latitude")), float(getattr(r, "longitude")))
            if d > max_d:
                max_d = d
        radius_m = float(max_d + 35.0)  # small padding so circle is visible
        # Keep circles readable on the map.
        radius_m = float(max(60.0, min(650.0, radius_m)))

        # Decide label: majority vote of risk_level if present, else by average risk_score.
        if "risk_level" in g.columns:
            label = str(g["risk_level"].astype(str).value_counts().idxmax())
            if label not in ("Safe", "Medium", "Unsafe"):
                label = "Medium"
            label = _binary_level(label)
        else:
            avg_score = float(g["risk_score"].mean()) if "risk_score" in g.columns else 0.5
            label = _binary_level(_risk_level_from_score(avg_score))

        zones.append(
            {
                "cluster_id": cluster_id_int,
                "center_lat": center_lat,
                "center_lon": center_lon,
                "radius_m": radius_m,
                "zone_label": label,
                "points": int(g.shape[0]),
            }
        )

    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(zones, indent=2), encoding="utf-8")


def _print_zone_summary(bundle: dict, df: pd.DataFrame) -> None:
    zone_model = bundle["zone_model"]
    labels = zone_model.dbscan.labels_
    n = int(len(labels))
    noise = int(np.sum(labels == -1))
    clusters = sorted(set(int(x) for x in labels if int(x) != -1))

    print("Zone summary")
    print(f"- rows: {n}")
    print(f"- clusters: {len(clusters)} (excluding noise)")
    print(f"- noise points: {noise} ({(noise / max(n, 1)) * 100:.1f}%)")

    cluster_risk_map: dict[int, float] = bundle.get("cluster_risk_map", {})
    if cluster_risk_map:
        top = sorted(cluster_risk_map.items(), key=lambda kv: kv[1], reverse=True)[:5]
        print("- top risky clusters (cluster_id -> zone_risk):")
        for cid, risk in top:
            print(f"  {cid} -> {risk:.3f}")

    if "risk_level" in df.columns:
        df2 = df.copy()
        df2["zone_cluster"] = labels.astype(int)
        ct = pd.crosstab(df2["zone_cluster"], df2["risk_level"])
        print("- cluster vs risk_level (counts):")
        print(ct.to_string())


def _predict_levels_via_api_bundle(model_path: Path, df: pd.DataFrame) -> tuple[list[str], list[float]]:
    rm = RiskModelBundle.load(model_path)
    preds: list[str] = []
    scores: list[float] = []
    for r in df.itertuples(index=False):
        result = rm.predict_risk(
            latitude=float(getattr(r, "latitude")),
            longitude=float(getattr(r, "longitude")),
            crowd_density=float(getattr(r, "crowd_density", 5.0)),
            lighting=float(getattr(r, "lighting", 5.0)),
            incident_count=float(getattr(r, "incident_count", 0.0)),
            hour=int(getattr(r, "hour", 12)),
        )
        preds.append(result.risk_level)
        scores.append(float(result.risk_score))
    return preds, scores


def main() -> None:
    here = Path(__file__).resolve().parent
    parser = argparse.ArgumentParser(description="Evaluate TourBuddy AI module (zones + prediction).")
    parser.add_argument("--data", type=str, default=str(here / "dataset" / "sample_data.csv"))
    parser.add_argument("--model-out", type=str, default=str(here / "model" / "risk_model.pkl"))
    parser.add_argument("--test-size", type=float, default=0.25)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--dbscan-eps", type=float, default=0.8)
    parser.add_argument("--dbscan-min-samples", type=int, default=8)
    parser.add_argument("--export-heatmap", type=str, default=str(here / "dataset" / "heatmap_points.csv"))
    parser.add_argument("--export-zones", type=str, default=str(here / "dataset" / "zones.json"))
    parser.add_argument("--zone-radius-m", type=float, default=150.0)
    parser.add_argument("--zone-mode", type=str, default="auto", choices=["auto", "point", "cluster"])
    args = parser.parse_args()

    data_path = Path(args.data)
    model_path = Path(args.model_out)

    df = pd.read_csv(data_path)
    _ensure_columns(df, ["latitude", "longitude"])
    # Clean lat/lon aggressively in case they were entered as messy strings.
    df["latitude"] = df["latitude"].map(_parse_geo_loose)
    df["longitude"] = df["longitude"].map(_parse_geo_loose)
    df = df.dropna(subset=["latitude", "longitude"])

    df = _coerce_numeric(df, ["crowd_density", "lighting", "incident_count", "hour"], default=5.0)

    # Train (and save) the bundle; this also computes cluster_risk_map.
    bundle = train_bundle(
        data_path=data_path,
        out_path=model_path,
        dbscan_eps=float(args.dbscan_eps),
        dbscan_min_samples=int(args.dbscan_min_samples),
        seed=int(args.seed),
    )

    _print_zone_summary(bundle, df)

    # Export heatmap-style points using the same runtime predictor as the backend will call.
    preds_all, scores_all = _predict_levels_via_api_bundle(model_path, df)
    export_df = df[["latitude", "longitude"]].copy()
    export_df["risk_score"] = scores_all
    export_df["risk_level"] = [_binary_level(p) for p in preds_all]
    export_path = Path(args.export_heatmap)
    export_path.parent.mkdir(parents=True, exist_ok=True)
    export_df.to_csv(export_path, index=False)
    print(f"Exported heatmap points: {export_path}")

    # Export zone circles for the demo map.
    zone_df = export_df.copy()
    # Recompute clusters using the trained bundle's DBSCAN labels (aligned with input order).
    zone_df["zone_cluster"] = bundle["zone_model"].dbscan.labels_.astype(int)
    _export_zones_json(
        out_path=Path(args.export_zones),
        df_points=zone_df,
        cluster_col="zone_cluster",
        default_point_radius_m=float(args.zone_radius_m),
        mode=str(args.zone_mode),
    )
    print(f"Exported zone circles: {Path(args.export_zones)}")

    if "risk_level" not in df.columns:
        print("No ground-truth 'risk_level' column found; skipping accuracy metrics.")
        return

    # Accuracy: compare predicted level vs label on a holdout split.
    train_df, test_df = train_test_split(df, test_size=float(args.test_size), random_state=int(args.seed), stratify=df["risk_level"])
    # Re-train on train split for a cleaner evaluation; use a temp file so we don't pollute dataset/.
    with tempfile.NamedTemporaryFile(mode="w", suffix=".csv", delete=False, encoding="utf-8", newline="") as f:
        tmp_train_path = Path(f.name)
        train_df.to_csv(tmp_train_path, index=False)

    _ = train_bundle(
        data_path=tmp_train_path,
        out_path=model_path,
        dbscan_eps=float(args.dbscan_eps),
        dbscan_min_samples=int(args.dbscan_min_samples),
        seed=int(args.seed),
    )
    y_true = test_df["risk_level"].astype(str).tolist()
    y_pred, y_score = _predict_levels_via_api_bundle(model_path, test_df)

    print("Prediction metrics (holdout)")
    print(classification_report(y_true, y_pred, digits=3, zero_division=0))
    print("Confusion matrix (rows=true, cols=pred)")
    labels = ["Safe", "Medium", "Unsafe"]
    cm = confusion_matrix(y_true, y_pred, labels=labels)
    cm_df = pd.DataFrame(cm, index=[f"true_{l}" for l in labels], columns=[f"pred_{l}" for l in labels])
    print(cm_df.to_string())

    # Heuristic-only check (risk_score -> buckets) to see if score is reasonable.
    y_pred_from_score = [_risk_level_from_score(s) for s in y_score]
    print("Risk score bucket metrics (holdout)")
    print(classification_report(y_true, y_pred_from_score, digits=3, zero_division=0))


if __name__ == "__main__":
    main()
