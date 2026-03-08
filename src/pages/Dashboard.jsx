import students from "../data/studentsData";
import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";

export default function Dashboard() {
  const [attendanceThreshold, setAttendanceThreshold] = useState(75);
  const [marksThreshold, setMarksThreshold] = useState(50);
  const [riskStudents, setRiskStudents] = useState(0);
  const [userEmail, setUserEmail] = useState("");

  // --- LOGIN CHECK ---
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const email = localStorage.getItem("userEmail");
    if (!isLoggedIn) {
      window.location.href = "/login"; // Redirect only if not logged in
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

  // --- CALCULATE RISK ---
  useEffect(() => {
    let highRisk = 0;
    students.forEach((student) => {
      const subjects = Object.values(student.subjects);
      const avgAttendance =
        subjects.reduce((sum, s) => sum + s.attendance, 0) / subjects.length;
      const avgMarks =
        subjects.reduce((sum, s) => sum + s.marks, 0) / subjects.length;
      if (avgAttendance < attendanceThreshold || avgMarks < marksThreshold) {
        highRisk++;
      }
    });
    setRiskStudents(highRisk);
  }, [attendanceThreshold, marksThreshold]);

  // --- LOGOUT ---
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="flex justify-between items-center bg-white shadow px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Student Risk Dashboard
          </h2>

          <div className="flex items-center gap-4">
            {/* Dynamic Teacher Info */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-bold">
                {userEmail ? userEmail.charAt(0).toUpperCase() : "A"}
              </div>
              <span className="text-gray-700 font-medium">
                {userEmail || "Admin"}
              </span>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-lg shadow-md transition duration-200"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-6 space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-lg shadow">
              <p className="text-gray-500 text-sm">Total Students</p>
              <h2 className="text-2xl font-bold">{students.length}</h2>
            </div>

            <div className="bg-white p-5 rounded-lg shadow">
              <p className="text-gray-500 text-sm">High Risk Students</p>
              <h2 className="text-2xl font-bold text-red-500">{riskStudents}</h2>
            </div>

            <div className="bg-white p-5 rounded-lg shadow">
              <p className="text-gray-500 text-sm">Attendance Threshold</p>
              <h2 className="text-2xl font-bold text-blue-600">{attendanceThreshold}%</h2>
            </div>
          </div>

          {/* Student Overview Table */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Student Overview</h2>
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-gray-600">
                  <th className="py-2">Name</th>
                  <th>Subjects</th>
                  <th>Avg Attendance</th>
                  <th>Avg Marks</th>
                  <th>Risk</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  const subjects = Object.values(student.subjects);
                  const avgAttendance =
                    subjects.reduce((sum, s) => sum + s.attendance, 0) / subjects.length;
                  const avgMarks =
                    subjects.reduce((sum, s) => sum + s.marks, 0) / subjects.length;
                  const risk = avgAttendance < attendanceThreshold || avgMarks < marksThreshold;

                  return (
                    <tr key={student.id} className="border-b">
                      <td className="py-3 font-medium">{student.name}</td>
                      <td>{Object.keys(student.subjects).join(", ")}</td>
                      <td>{avgAttendance.toFixed(1)}%</td>
                      <td>{avgMarks.toFixed(1)}</td>
                      <td>
                        {risk ? (
                          <span className="bg-red-500 text-white px-2 py-1 rounded text-sm">
                            High
                          </span>
                        ) : (
                          <span className="bg-green-500 text-white px-2 py-1 rounded text-sm">
                            Low
                          </span>
                        )}
                      </td>
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