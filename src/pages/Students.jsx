import { useState, useEffect } from "react";
import students from "../data/studentsData";
import Sidebar from "../components/Sidebar";

export default function Students() {
  const [search, setSearch] = useState("");
  const [attendanceThreshold, setAttendanceThreshold] = useState(75);
  const [marksThreshold, setMarksThreshold] = useState(50);
  const [userEmail, setUserEmail] = useState("");

  // --- LOGIN CHECK ---
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const email = localStorage.getItem("userEmail");
    if (!isLoggedIn) {
      window.location.href = "/login"; // redirect if not logged in
    } else {
      setUserEmail(email || "");
    }
  }, []);

  // --- LOAD SETTINGS ---
  useEffect(() => {
    const loadSettings = () => {
      const attendance = localStorage.getItem("attendanceThreshold");
      const marks = localStorage.getItem("marksThreshold");
      if (attendance) setAttendanceThreshold(parseInt(attendance));
      if (marks) setMarksThreshold(parseInt(marks));
    };
    loadSettings();
    window.addEventListener("settingsUpdated", loadSettings);
    return () => {
      window.removeEventListener("settingsUpdated", loadSettings);
    };
  }, []);

  // --- LOGOUT HANDLER ---
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  // --- CALCULATE RISK ---
  function calculateRisk(student) {
    const subjects = Object.entries(student.subjects);
    const riskySubjects = subjects.filter(
      ([_, data]) =>
        data.attendance < attendanceThreshold || data.marks < marksThreshold
    );

    if (riskySubjects.length > 0) {
      const names = riskySubjects.map(([name]) => name).join(", ");
      return {
        level: "High",
        reason: `Risk in ${names}`
      };
    }

    return { level: "Low", reason: "Good Performance" };
  }

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        {/* TOP BAR */}
        <div className="flex justify-between items-center bg-white shadow px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-800">Student Academic Overview</h1>

          <div className="flex items-center gap-4">
            {/* Teacher Info */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-bold">
                {userEmail ? userEmail.charAt(0).toUpperCase() : "A"}
              </div>
              <span className="text-gray-700 font-medium">{userEmail || "Admin"}</span>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-lg shadow-md transition duration-200"
            >
              Logout
            </button>
          </div>
        </div>

        {/* PAGE CONTENT */}
        <div className="p-8 space-y-6 overflow-auto">
          <input
            type="text"
            placeholder="Search student..."
            className="border p-3 rounded w-72"
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr className="text-left">
                  <th className="p-4">Student</th>
                  <th>Subjects</th>
                  <th>Risk Level</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s) => {
                  const risk = calculateRisk(s);
                  return (
                    <tr key={s.id} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-medium">{s.name}</td>
                      <td className="text-sm text-gray-600">
                        {Object.entries(s.subjects).map(([sub, data]) => (
                          <div key={sub}>
                            {sub} — Attendance: {data.attendance}% | Marks: {data.marks}
                          </div>
                        ))}
                      </td>
                      <td>
                        <span
                          className={`px-3 py-1 rounded text-white text-sm ${
                            risk.level === "High" ? "bg-red-500" : "bg-green-500"
                          }`}
                        >
                          {risk.level}
                        </span>
                      </td>
                      <td className="text-gray-600">{risk.reason}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}