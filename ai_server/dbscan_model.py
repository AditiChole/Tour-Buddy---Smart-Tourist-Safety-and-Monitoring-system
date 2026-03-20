from __future__ import annotations

from dataclasses import dataclass

import numpy as np
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler


@dataclass
class DBSCANZoneModel:
    scaler: StandardScaler
    dbscan: DBSCAN

    def fit(self, coords: np.ndarray) -> "DBSCANZoneModel":
        coords = np.asarray(coords, dtype=float)
        scaled = self.scaler.fit_transform(coords)
        self.dbscan.fit(scaled)
        return self

    def predict_cluster(self, coords: np.ndarray) -> np.ndarray:
        # DBSCAN doesn't implement predict; we approximate by assigning each point to the nearest core point
        # within eps. If none found, label as noise (-1).
        coords = np.asarray(coords, dtype=float)
        try:
            scaled = self.scaler.transform(coords)
        except Exception as e:  # scaler not fitted or wrong shape
            raise ValueError("DBSCANZoneModel is not fitted. Call .fit(coords) before .predict_cluster(coords).") from e

        labels = np.full(shape=(scaled.shape[0],), fill_value=-1, dtype=int)

        # DBSCAN attributes are only present after fit.
        if not hasattr(self.dbscan, "components_") or not hasattr(self.dbscan, "labels_"):
            return labels

        core_indices = getattr(self.dbscan, "core_sample_indices_", None)
        if core_indices is None or len(core_indices) == 0:
            return labels

        core_points = getattr(self.dbscan, "components_", None)
        if core_points is None or len(core_points) == 0:
            return labels

        db_labels = getattr(self.dbscan, "labels_", None)
        if db_labels is None or len(db_labels) == 0:
            return labels

        core_labels = db_labels[core_indices]

        # Assign if any core point is within eps distance in scaled space.
        # This is O(n*m) but fine for demo-scale usage; can be optimized later.
        eps = float(getattr(self.dbscan, "eps", 0.0))
        for i, point in enumerate(scaled):
            dists = np.linalg.norm(core_points - point, axis=1)
            j = int(np.argmin(dists))
            if dists[j] <= eps:
                labels[i] = int(core_labels[j])
        return labels


def build_default_dbscan(eps: float = 0.8, min_samples: int = 8) -> DBSCANZoneModel:
    # eps is in *scaled* space (after StandardScaler).
    return DBSCANZoneModel(
        scaler=StandardScaler(),
        dbscan=DBSCAN(eps=float(eps), min_samples=int(min_samples)),
    )


if __name__ == "__main__":
    # Quick self-test: running this file directly should not crash.
    m = build_default_dbscan()
    pts = np.array([[21.145, 79.088], [21.1451, 79.0881], [21.150, 79.091]], dtype=float)
    m.fit(pts)
    print(m.predict_cluster(pts).tolist())
