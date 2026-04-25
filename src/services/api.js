// ✅ Timeout wrapper — aborts any request that takes longer than 15 seconds
//    Prevents the import from hanging forever if the local server is slow
async function fetchWithTimeout(url, options, timeoutMs = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch (err) {
    clearTimeout(timer);
    if (err.name === "AbortError") throw new Error("Request timed out — is the backend running?");
    throw err;
  }
}

export async function predictStudentRisk(studentData) {
  const res = await fetchWithTimeout("http://localhost:8000/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: studentData }),
  });
  if (!res.ok) throw new Error("Prediction failed");
  return res.json();
}

export async function explainStudentRisk(studentName, data, risk_class, risk_level) {
  const res = await fetchWithTimeout("http://localhost:8000/explain", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ student_name: studentName, data, risk_class, risk_level }),
  });
  if (!res.ok) throw new Error("Explanation failed");
  return res.json();
}
