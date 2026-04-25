// src/services/api.js
// Connects React frontend to FastAPI backend at http://localhost:8000
// Vite proxy: /api/* → http://localhost:8000/*  (configured in vite.config.js)

const BASE = "/api";

/**
 * Predict student risk using XGBoost model via FastAPI backend.
 *
 * Backend expects exactly these 5 fields:
 *   { studytime, failures, absences, G1, G2 }
 *
 * Returns: { risk_class: 0|1|2, risk_level: "Low Risk"|"Medium Risk"|"High Risk" }
 *
 * For backward compatibility with the rest of the UI we also return:
 *   probability  — derived from risk_class (0→0.15, 1→0.55, 2→0.85)
 */
export async function predictStudentRisk(modelData) {
  // Build the exact payload your model expects
  const payload = {
    data: {
      studytime: Number(modelData.studytime ?? 2),
      failures:  Number(modelData.failures  ?? 0),
      absences:  Number(modelData.absences  ?? 6),
      G1:        Number(modelData.G1        ?? 10),
      G2:        Number(modelData.G2        ?? 11),
    },
  };

  const res = await fetch(`${BASE}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Backend error ${res.status}: ${text}`);
  }

  const json = await res.json();
  // json = { risk_class: 0|1|2, risk_level: "Low Risk"|"Medium Risk"|"High Risk" }

  // Map risk_class to a probability value so existing UI code (probability displays) keeps working
  const probabilityMap = { 0: 0.15, 1: 0.55, 2: 0.85 };
  const probability = probabilityMap[json.risk_class] ?? 0.5;

  return {
    risk_class: json.risk_class,           // 0 | 1 | 2
    risk_level: json.risk_level,           // "Low Risk" | "Medium Risk" | "High Risk"
    probability,                           // 0.15 | 0.55 | 0.85  (for UI progress bars etc.)
  };
}

/**
 * Get a Grok AI explanation for a student's risk prediction.
 * Calls the backend /explain endpoint which calls the Grok API.
 *
 * Returns: { explanation: string }
 */
export async function explainStudentRisk(studentName, modelData, riskResult) {
  const payload = {
    student_name: studentName,
    data: {
      studytime: Number(modelData.studytime ?? 2),
      failures:  Number(modelData.failures  ?? 0),
      absences:  Number(modelData.absences  ?? 6),
      G1:        Number(modelData.G1        ?? 10),
      G2:        Number(modelData.G2        ?? 11),
    },
    risk_class: riskResult.risk_class,
    risk_level: riskResult.risk_level,
  };

  const res = await fetch(`${BASE}/explain`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Explain error ${res.status}: ${text}`);
  }

  return await res.json(); // { explanation: string }
}
