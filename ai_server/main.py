from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from prediction_service import RiskModelBundle


HERE = Path(__file__).resolve().parent
DEFAULT_MODEL_PATH = HERE / "model" / "risk_model.pkl"


class PredictRiskRequest(BaseModel):
    latitude: float = Field(..., description="Current latitude")
    longitude: float = Field(..., description="Current longitude")
    crowd_density: float | None = Field(None, ge=0, le=10, description="0..10, optional")
    lighting: float | None = Field(None, ge=0, le=10, description="0..10, optional")
    incident_count: float | None = Field(None, ge=0, description="Optional incidents near location")
    hour: int | None = Field(None, ge=0, le=23, description="0..23, optional local hour")


class PredictRiskResponse(BaseModel):
    risk_score: float
    risk_level: str
    zone_cluster: int
    zone_risk: float
    anomaly_score: float
    is_anomaly: bool


app = FastAPI(title="TourBuddy AI Risk Prediction Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _load_bundle() -> RiskModelBundle:
    if not DEFAULT_MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Model file not found at {DEFAULT_MODEL_PATH}. Run: python train_model.py --data dataset/sample_data.csv"
        )
    return RiskModelBundle.load(DEFAULT_MODEL_PATH)


@app.get("/")
def home():
    return {"message": "AI Risk Prediction Service Running", "model_path": str(DEFAULT_MODEL_PATH)}


@app.post("/predict-risk", response_model=PredictRiskResponse)
def predict_risk(req: PredictRiskRequest):
    try:
        bundle = _load_bundle()
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e))

    result = bundle.predict_risk(
        latitude=req.latitude,
        longitude=req.longitude,
        crowd_density=req.crowd_density,
        lighting=req.lighting,
        incident_count=req.incident_count,
        hour=req.hour,
    )
    return PredictRiskResponse(**result.to_dict())
