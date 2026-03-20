# TourBuddy AI/ML Prediction Service

This folder contains the AI module for the TourBuddy project:

- Unsafe zone prediction using DBSCAN clustering
- Abnormal movement detection using Isolation Forest
- Risk score + risk level prediction for backend alerts (FastAPI API)

## Quick start (Windows / PowerShell)

Install dependencies:

```powershell
cd "D:\STUDY MATERIAL\Tourbuddy\ai_server"
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

Generate demo dataset:

```powershell
python .\scripts\generate_dummy_data.py
```

Train and save model:

```powershell
python .\train_model.py --data .\dataset\sample_data.csv
```

Run API:

```powershell
uvicorn main:app --reload --port 8000
```

Evaluate (zones + accuracy + export heatmap points):

```powershell
.\.venv\Scripts\python.exe .\evaluate.py --data .\dataset\sample_data.csv
```

Open Swagger UI:

- http://localhost:8000/docs
