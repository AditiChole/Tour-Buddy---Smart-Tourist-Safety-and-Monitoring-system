from __future__ import annotations

from dataclasses import dataclass

import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler


@dataclass
class MovementAnomalyModel:
    scaler: StandardScaler
    model: IsolationForest
    feature_names: list[str]

    def fit(self, X: np.ndarray) -> "MovementAnomalyModel":
        X = np.asarray(X, dtype=float)
        Xs = self.scaler.fit_transform(X)
        self.model.fit(Xs)
        return self

    def anomaly_score(self, X: np.ndarray) -> np.ndarray:
        # Map to [0,1] where 1 means "more anomalous".
        X = np.asarray(X, dtype=float)
        Xs = self.scaler.transform(X)
        raw = -self.model.score_samples(Xs)  # higher => more abnormal
        if raw.size == 0:
            return raw
        lo, hi = float(np.min(raw)), float(np.max(raw))
        if hi - lo < 1e-12:
            return np.zeros_like(raw)
        return (raw - lo) / (hi - lo)

    def predict_flag(self, X: np.ndarray, threshold: float = 0.65) -> np.ndarray:
        scores = self.anomaly_score(X)
        return (scores >= float(threshold)).astype(int)


def build_default_isoforest(feature_names: list[str], contamination: float = 0.06, seed: int = 42) -> MovementAnomalyModel:
    return MovementAnomalyModel(
        scaler=StandardScaler(),
        model=IsolationForest(
            n_estimators=250,
            contamination=float(contamination),
            random_state=int(seed),
        ),
        feature_names=list(feature_names),
    )

