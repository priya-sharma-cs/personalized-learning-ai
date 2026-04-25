from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
import uvicorn
import os
from dotenv import load_dotenv
load_dotenv()
from groq import Groq

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Load model ──────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
model = joblib.load(os.path.join(BASE_DIR, "model", "student_model.pkl"))

# ── Groq API config ──────────────────────────────────────────────────────────
groq_client = Groq(api_key=os.getenv("API_GROK_KEY"))
GROQ_MODEL  = "llama-3.1-8b-instant"  # ✅ same model your teammate uses

# ── Risk label map ────────────────────────────────────────────────────────────
RISK_LABELS = {
    0: "Low Risk",
    1: "Medium Risk",
    2: "High Risk",
}

# ── Schemas ───────────────────────────────────────────────────────────────────
class StudentData(BaseModel):
    data: dict

class ExplainRequest(BaseModel):
    student_name: str
    data: dict
    risk_class: int
    risk_level: str


# ── Routes ────────────────────────────────────────────────────────────────────
@app.get("/")
def home():
    return {"message": "EduRisk backend is running ✓"}


@app.post("/predict")
def predict(student: StudentData):
    features = {
        "studytime": student.data.get("studytime", 2),
        "failures":  student.data.get("failures",  0),
        "absences":  student.data.get("absences",  6),
        "G1":        student.data.get("G1",        10),
        "G2":        student.data.get("G2",        11),
    }
    df = pd.DataFrame([features])
    pred = model.predict(df)[0]
    risk_class = int(pred)
    risk_level = RISK_LABELS.get(risk_class, "Unknown")

    proba = model.predict_proba(df)[0]
    probability = float(proba[risk_class])

    return {
        "risk_class":  risk_class,
        "risk_level":  risk_level,
        "probability": probability,
    }


@app.post("/explain")
def explain(req: ExplainRequest):
    if not os.getenv("API_GROK_KEY"):
        return {
            "explanation": (
                f"{req.student_name} is classified as {req.risk_level}. "
                "To enable AI explanations, set the API_GROK_KEY environment variable."
            )
        }

    prompt = (
        f"You are an academic advisor AI. A student named {req.student_name} "
        f"has been classified as '{req.risk_level}' (risk class {req.risk_class} on a 0–2 scale).\n\n"
        f"Their academic data:\n"
        f"- Study time per week: {req.data.get('studytime')} (1=<2h, 2=2–5h, 3=5–10h, 4=>10h)\n"
        f"- Past failures: {req.data.get('failures')}\n"
        f"- Absences: {req.data.get('absences')} days\n"
        f"- Mid-term grade G1: {req.data.get('G1')}/20\n"
        f"- Mid-term grade G2: {req.data.get('G2')}/20\n\n"
        f"In 2–3 concise sentences, explain WHY this student is at this risk level "
        f"and give ONE specific, actionable recommendation for their teacher."
    )

    try:
        response = groq_client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=200,
            temperature=0.4,
        )
        explanation = response.choices[0].message.content.strip()
    except Exception as e:
        explanation = (
            f"{req.student_name} is classified as {req.risk_level}. "
            f"(AI error: {str(e)})"
        )

    return {"explanation": explanation}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)