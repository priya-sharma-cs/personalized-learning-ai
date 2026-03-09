from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
import uvicorn
import os

app = FastAPI()

# ✅ Allow React frontend to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
model = joblib.load(os.path.join(BASE_DIR, 'model', 'student_risk_model.pkl'))
model_columns = joblib.load(os.path.join(BASE_DIR, 'model', 'model_columns.pkl'))
threshold = joblib.load(os.path.join(BASE_DIR, 'model', 'threshold.pkl'))

class StudentData(BaseModel):
    data: dict

@app.post("/predict")
def predict(student: StudentData):
    df = pd.DataFrame([student.data])
    df = df.reindex(columns=model_columns, fill_value=0)
    probability = model.predict_proba(df)[0][1]
    risk_level = "High Risk" if probability >= threshold else "Low Risk"
    return {
        "risk_level": risk_level,
        "probability": float(probability)
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)