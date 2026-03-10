export async function predictStudentRisk(studentData) {
  const res = await fetch("http://localhost:8000/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: studentData }),
  });
  if (!res.ok) throw new Error("Prediction failed");
  return res.json();
}