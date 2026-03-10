import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import studentsData from "../data/studentsData";
import { predictStudentRisk } from "../services/api";

export default function StudentDetail() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [riskResult, setRiskResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const attendanceThreshold = parseInt(localStorage.getItem("attendanceThreshold") || "75");
  const marksThreshold = parseInt(localStorage.getItem("marksThreshold") || "50");

  useEffect(() => {
    // Read from localStorage first, fallback to studentsData
    const storedStudents = localStorage.getItem("studentList");
    const allStudents = storedStudents ? JSON.parse(storedStudents) : studentsData;
    const found = allStudents.find((s) => String(s.id) === String(id));
    setStudent(found || null);
  }, [id]);

  useEffect(() => {
    if (!student) return;

    async function fetchRisk() {
      setLoading(true);
      const modelData = student.modelData || buildDefaultModelData(student);
      try {
        const res = await predictStudentRisk(modelData);
        setRiskResult(res);
      } catch {
        setRiskResult({ risk_level: "Unknown", probability: null });
      }
      setLoading(false);
    }
    fetchRisk();
  }, [student]);

  function buildDefaultModelData(student) {
    const subjects = Object.values(student.subjects);
    const avgMarks = subjects.reduce((s, d) => s + d.marks, 0) / subjects.length;
    return {
      age: 17, Medu: 2, Fedu: 2, traveltime: 2, studytime: 2,
      failures: 0, famrel: 3, freetime: 3, goout: 3, Dalc: 1,
      Walc: 1, health: 3, absences: 6, G1: Math.round(avgMarks / 5),
      school_MS: 0, sex_M: 1, address_U: 1, famsize_LE3: 0,
      Pstatus_T: 1, Mjob_health: 0, Mjob_other: 1, Mjob_services: 0,
      Mjob_teacher: 0, Fjob_health: 0, Fjob_other: 1, Fjob_services: 0,
      Fjob_teacher: 0, reason_home: 0, reason_other: 0, reason_reputation: 1,
      guardian_mother: 1, guardian_other: 0, schoolsup_yes: 0, famsup_yes: 1,
      paid_yes: 0, activities_yes: 1, nursery_yes: 1, higher_yes: 1,
      internet_yes: 1, romantic_yes: 0,
    };
  }

  if (!student) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 bg-gray-100 p-6">
          <p className="text-red-500 font-bold">Student not found.</p>
        </div>
      </div>
    );
  }

  const subjects = Object.values(student.subjects);
  const avgAttendance = subjects.reduce((sum, s) => sum + s.attendance, 0) / subjects.length;
  const avgMarks = subjects.reduce((sum, s) => sum + s.marks, 0) / subjects.length;
  const attendanceLow = avgAttendance < attendanceThreshold;
  const marksLow = avgMarks < marksThreshold;
  const aiHigh = riskResult?.risk_level === "High Risk";
  const isHighRisk = aiHigh || attendanceLow || marksLow;

  const reasons = [];
  if (aiHigh) reasons.push("AI Detected Risk");
  if (attendanceLow) reasons.push("Low Attendance");
  if (marksLow) reasons.push("Low Marks");

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-auto">
        {/* TOP BAR */}
        <div className="flex items-center bg-white shadow px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-800">Student Detail</h1>
        </div>

        <div className="p-6 space-y-6">
          {/* STUDENT INFO CARD */}
          <div className="bg-white p-6 shadow rounded-xl">
            <h2 className="text-xl font-bold mb-1">{student.name}</h2>
            <p className="text-gray-400 text-sm mb-4">Student ID: {student.id}</p>

            {loading ? (
              <p className="text-gray-400">Loading AI prediction...</p>
            ) : (
              <div className="flex items-center gap-4 flex-wrap">
                <span className={`px-4 py-1 rounded-full text-white font-semibold ${isHighRisk ? "bg-red-500" : "bg-green-500"}`}>
                  {isHighRisk ? "High Risk" : "Low Risk"}
                </span>
                {riskResult?.probability != null && (
                  <span className="text-orange-500 font-medium">
                    AI Probability: {(riskResult.probability * 100).toFixed(1)}%
                  </span>
                )}
                {reasons.length > 0 && (
                  <span className="text-gray-500 text-sm">
                    Reasons: {reasons.join(", ")}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* SUBJECT BREAKDOWN */}
          <div className="bg-white p-6 shadow rounded-xl">
            <h2 className="text-lg font-semibold mb-4">Subject Breakdown</h2>
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-gray-600">
                  <th className="py-2">Subject</th>
                  <th>Attendance</th>
                  <th>Marks</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(student.subjects).map(([subjectName, data]) => {
                  const subAttLow = data.attendance < attendanceThreshold;
                  const subMarksLow = data.marks < marksThreshold;
                  const subRisk = subAttLow || subMarksLow;
                  return (
                    <tr key={subjectName} className="border-b">
                      <td className="py-3 font-medium">{subjectName}</td>
                      <td className={subAttLow ? "text-red-500 font-semibold" : ""}>
                        {data.attendance}%
                        {subAttLow && <span className="ml-1 text-xs">(below threshold)</span>}
                      </td>
                      <td className={subMarksLow ? "text-red-500 font-semibold" : ""}>
                        {data.marks}
                        {subMarksLow && <span className="ml-1 text-xs">(below threshold)</span>}
                      </td>
                      <td>
                        <span className={`px-2 py-1 rounded text-white text-sm ${subRisk ? "bg-red-500" : "bg-green-500"}`}>
                          {subRisk ? "At Risk" : "Good"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* AVERAGES */}
            <div className="mt-4 flex gap-6 text-sm text-gray-600">
              <span>Avg Attendance:
                <span className={`ml-1 font-semibold ${attendanceLow ? "text-red-500" : "text-green-600"}`}>
                  {avgAttendance.toFixed(1)}%
                </span>
              </span>
              <span>Avg Marks:
                <span className={`ml-1 font-semibold ${marksLow ? "text-red-500" : "text-green-600"}`}>
                  {avgMarks.toFixed(1)}
                </span>
              </span>
            </div>
          </div>

          {/* AI RECOMMENDATION */}
          {!loading && (
            <div className={`p-5 rounded-xl shadow border ${isHighRisk ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}>
              <h2 className="font-semibold text-gray-700 mb-1">AI Recommendation</h2>
              <p className={isHighRisk ? "text-red-600" : "text-green-600"}>
                {attendanceLow && marksLow
                  ? "⚠️ Immediate academic counseling required. Both attendance and marks are critically low."
                  : attendanceLow
                  ? "⚠️ Attendance is below threshold. Monitor closely and notify advisor."
                  : marksLow
                  ? "⚠️ Marks are below passing threshold. Provide subject-specific tutoring."
                  : aiHigh
                  ? "⚠️ AI has detected risk patterns. Review student performance history carefully."
                  : "✅ Student is performing well. Keep up regular monitoring."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}