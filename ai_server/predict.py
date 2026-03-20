from __future__ import annotations

import argparse
from pathlib import Path

from prediction_service import RiskModelBundle


def main() -> None:
    here = Path(__file__).resolve().parent

    parser = argparse.ArgumentParser(description="Local CLI prediction using saved TourBuddy risk model.")
    parser.add_argument("--model", type=str, default=str(here / "model" / "risk_model.pkl"))
    parser.add_argument("--lat", type=float, required=True)
    parser.add_argument("--lon", type=float, required=True)
    parser.add_argument("--crowd", type=float, default=5)
    parser.add_argument("--lighting", type=float, default=5)
    parser.add_argument("--incidents", type=float, default=0)
    parser.add_argument("--hour", type=int, default=12)
    args = parser.parse_args()

    bundle = RiskModelBundle.load(args.model)
    result = bundle.predict_risk(
        latitude=args.lat,
        longitude=args.lon,
        crowd_density=args.crowd,
        lighting=args.lighting,
        incident_count=args.incidents,
        hour=args.hour,
    )
    print(result.to_dict())


if __name__ == "__main__":
    main()
