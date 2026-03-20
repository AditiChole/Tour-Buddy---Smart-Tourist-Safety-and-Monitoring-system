from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any

import joblib
import numpy as np


RISK_LEVELS = ("Safe", "Medium", "Unsafe")


def _clamp01(x: float) -> float:
    return max(0.0, min(1.0, float(x)))


def _risk_level_from_score(score: float) -> str:
    if score >= 0.66:
        return "Unsafe"
    if score >= 0.33:
        return "Medium"
    return "Safe"


@dataclass
class RiskPredictionResult:
    risk_score: float
    risk_level: str
    zone_cluster: int
    zone_risk: float
    anomaly_score: float
    is_anomaly: bool

    def to_dict(self) -> dict[str, Any]:
        return {
            "risk_score": float(self.risk_score),
            "risk_level": str(self.risk_level),
            "zone_cluster": int(self.zone_cluster),
            "zone_risk": float(self.zone_risk),
            "anomaly_score": float(self.anomaly_score),
            "is_anomaly": bool(self.is_anomaly),
        }


class RiskModelBundle:
    def __init__(self, bundle: dict[str, Any]):
        self.bundle = bundle

    @classmethod
    def load(cls, path: str | Path) -> "RiskModelBundle":
        return cls(joblib.load(str(path)))

    def predict_risk(
        self,
        *,
        latitude: float,
        longitude: float,
        crowd_density: int | float | None = None,
        lighting: int | float | None = None,
        incident_count: int | float | None = None,
        hour: int | None = None,
        anomaly_threshold: float = 0.65,
    ) -> RiskPredictionResult:
        crowd_density = 5.0 if crowd_density is None else float(crowd_density)
        lighting = 5.0 if lighting is None else float(lighting)
        incident_count = 0.0 if incident_count is None else float(incident_count)
        hour = 12 if hour is None else int(hour)

        coords = np.array([[float(latitude), float(longitude)]], dtype=float)

        zone_model = self.bundle["zone_model"]
        cluster = int(zone_model.predict_cluster(coords)[0])
        cluster_risk_map: dict[int, float] = self.bundle.get("cluster_risk_map", {})
        zone_risk = float(cluster_risk_map.get(cluster, 0.2 if cluster == -1 else 0.5))

        # Movement anomaly: in absence of real trajectories, we use the same features at runtime.
        anomaly_model = self.bundle["anomaly_model"]
        movement_features = np.array(
            [[float(latitude), float(longitude), float(hour), float(crowd_density), float(lighting), float(incident_count)]],
            dtype=float,
        )
        anomaly_score = float(anomaly_model.anomaly_score(movement_features)[0])
        is_anomaly = bool(anomaly_score >= float(anomaly_threshold))

        # Supervised model (if trained with labels) gives a probability-like score.
        clf = self.bundle.get("risk_classifier")
        feature_columns: list[str] = self.bundle.get("feature_columns", [])

        model_score: float | None = None
        model_level: str | None = None
        if clf is not None and feature_columns:
            features = {
                "latitude": float(latitude),
                "longitude": float(longitude),
                "hour": float(hour),
                "crowd_density": float(crowd_density),
                "lighting": float(lighting),
                "incident_count": float(incident_count),
                "zone_cluster": float(cluster),
                "zone_risk": float(zone_risk),
                "anomaly_score": float(anomaly_score),
            }
            X = np.array([[float(features[c]) for c in feature_columns]], dtype=float)

            if hasattr(clf, "predict_proba"):
                proba = clf.predict_proba(X)[0]
                # Map to Unsafe probability if available.
                classes = list(getattr(clf, "classes_", []))
                if "Unsafe" in classes:
                    model_score = float(proba[classes.index("Unsafe")])
                else:
                    model_score = float(np.max(proba))
            else:
                pred = str(clf.predict(X)[0])
                model_level = pred if pred in RISK_LEVELS else None

        # Fallback scoring formula (works even without supervised training).
        inc_norm = _clamp01(incident_count / 10.0)
        lighting_risk = _clamp01(1.0 - (lighting / 10.0))
        crowd_risk = _clamp01(1.0 - (crowd_density / 10.0))
        night_risk = 0.1 if (hour >= 20 or hour <= 5) else 0.0

        heuristic_score = _clamp01(
            (0.55 * zone_risk)
            + (0.25 * inc_norm)
            + (0.10 * lighting_risk)
            + (0.05 * crowd_risk)
            + (0.05 * night_risk)
            + (0.10 * anomaly_score)
        )

        if model_score is not None:
            # Blend supervised signal with heuristic for stability.
            risk_score = _clamp01(0.65 * float(model_score) + 0.35 * float(heuristic_score))
        else:
            risk_score = heuristic_score

        if model_level is None:
            risk_level = _risk_level_from_score(risk_score)
        else:
            risk_level = model_level

        return RiskPredictionResult(
            risk_score=float(risk_score),
            risk_level=str(risk_level),
            zone_cluster=int(cluster),
            zone_risk=float(zone_risk),
            anomaly_score=float(anomaly_score),
            is_anomaly=bool(is_anomaly),
        )

