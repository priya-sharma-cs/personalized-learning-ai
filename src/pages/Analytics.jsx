import students from "../data/studentsData";
import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

export default function Analytics() {
  const [subject, setSubject] = useState("All Subjects");
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

  // --- CALCULATE STUDENT RISK BASED ON SUBJECT ---
  let low = 0,
    medium = 0,
    high = 0;

  students.forEach((student) => {
    const subjects =
      subject === "All Subjects" ? Object.values(student.subjects) : [student.subjects[subject]];

    // ignore undefined subjects if teacher selects a subject some students don't have
    const validSubjects = subjects.filter(Boolean);

    if (validSubjects.length === 0) return;

    const avgAttendance =
      validSubjects.reduce((sum, s) => sum + s.attendance, 0) / validSubjects.length;
    const avgMarks = validSubjects.reduce((sum, s) => sum + s.marks, 0) / validSubjects.length;

    if (avgAttendance >= attendanceThreshold && avgMarks >= marksThreshold) low++;
    else if (avgAttendance >= attendanceThreshold - 10 || avgMarks >= marksThreshold - 10) medium++;
    else high++;
  });

  const riskData = [
    { name: "Low Risk", value: low },
    { name: "Medium Risk", value: medium },
    { name: "High Risk", value: high }
  ];

  const COLORS = ["#22c55e", "#f59e0b", "#ef4444"];

  // --- ATTENDANCE TREND DATA (STATIC SAMPLE) ---
  const attendanceData = [
    { week: "Week 1", attendance: 72 },
    { week: "Week 2", attendance: 75 },
    { week: "Week 3", attendance: 71 },
    { week: "Week 4", attendance: 78 }
  ];

  // --- SUBJECT PERFORMANCE ---
  const subjectPerformance = [];
  const subjectTotals = {};

  students.forEach((student) => {
    Object.entries(student.subjects).forEach(([subjectName, data]) => {
      if (subject !== "All Subjects" && subjectName !== subject) return;
      if (!subjectTotals[subjectName]) subjectTotals[subjectName] = { total: 0, count: 0 };
      subjectTotals[subjectName].total += data.marks;
      subjectTotals[subjectName].count += 1;
    });
  });

  Object.keys(subjectTotals).forEach((subjectName) => {
    subjectPerformance.push({
      subject: subjectName,
      avg: subjectTotals[subjectName].total / subjectTotals[subjectName].count
    });
  });

  // --- LOGOUT HANDLER ---
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        {/* TOP BAR */}
        <div className="flex justify-between items-center bg-white shadow px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h1>

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
        <div className="p-6 flex flex-col gap-5 h-full overflow-auto">
          {/* SUBJECT FILTER */}
          <div className="flex justify-end mb-4">
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="border rounded-md px-3 py-1 text-sm"
            >
              <option>All Subjects</option>
              {Object.keys(students[0].subjects).map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* KPI CARDS */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-500 text-sm">Total Students</p>
              <h2 className="text-2xl font-bold">{students.length}</h2>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-500 text-sm">Attendance Threshold</p>
              <h2 className="text-2xl font-bold text-blue-600">{attendanceThreshold}%</h2>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-500 text-sm">High Risk Students</p>
              <h2 className="text-2xl font-bold text-red-500">{high}</h2>
            </div>
          </div>

          {/* ATTENDANCE TREND */}
          <div className="bg-white p-4 rounded-lg shadow flex-1">
            <h2 className="text-sm font-semibold mb-2 text-gray-600">Attendance Trend</h2>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="attendance" stroke="#3b82f6" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* LOWER CHARTS */}
          <div className="grid grid-cols-2 gap-4 flex-1">
            {/* RISK PIE CHART */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-sm font-semibold mb-2 text-gray-600">Risk Distribution</h2>
              <ResponsiveContainer width="100%" height={170}>
                <PieChart>
                  <Pie data={riskData} dataKey="value" outerRadius={70} label>
                    {riskData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* SUBJECT PERFORMANCE */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-sm font-semibold mb-2 text-gray-600">Subject Performance</h2>
              <ResponsiveContainer width="100%" height={170}>
                <BarChart data={subjectPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="avg" fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}