import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

export default function RiskAlerts() {
  const [attendanceThreshold, setAttendanceThreshold] = useState(75);
  const [marksThreshold, setMarksThreshold] = useState(50);
  const [userEmail, setUserEmail] = useState("");

  const students = [
    {
      id: 1,
      name: "John Doe",
      subjects: {
        Math: { attendance: 85, marks: 70 },
        Physics: { attendance: 60, marks: 45 },
        Chemistry: { attendance: 90, marks: 80 }
      }
    },
    {
      id: 2,
      name: "Sarah Ali",
      subjects: {
        Math: { attendance: 88, marks: 72 },
        Physics: { attendance: 82, marks: 78 },
        Chemistry: { attendance: 80, marks: 70 }
      }
    },
    {
      id: 3,
      name: "Michael Lee",
      subjects: {
        Math: { attendance: 65, marks: 55 },
        Physics: { attendance: 70, marks: 48 },
        Chemistry: { attendance: 68, marks: 52 }
      }
    }
  ];

  const [alerts, setAlerts] = useState([]);

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

  // --- CALCULATE ALERTS ---
  useEffect(() => {
    const result = students.map((student) => {
      const riskySubjects = [];
      const issues = [];

      Object.entries(student.subjects).forEach(([subject, data]) => {
        if (data.attendance < attendanceThreshold) {
          riskySubjects.push(subject);
          issues.push("Low Attendance");
        }
        if (data.marks < marksThreshold) {
          riskySubjects.push(subject);
          issues.push("Low Marks");
        }
      });

      let suggestion = "Student performing well";

      if (issues.includes("Low Attendance") && issues.includes("Low Marks")) {
        suggestion = "Immediate academic counseling required";
      } else if (issues.includes("Low Marks")) {
        suggestion = "Provide subject tutoring";
      } else if (issues.includes("Low Attendance")) {
        suggestion = "Monitor attendance and notify advisor";
      }

      return {
        name: student.name,
        subjects: [...new Set(riskySubjects)],
        issues: [...new Set(issues)],
        suggestion
      };
    });

    const filtered = result.filter((s) => s.subjects.length > 0);
    setAlerts(filtered);
  }, [attendanceThreshold, marksThreshold]);

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
          <h1 className="text-2xl font-bold text-gray-800">Student Risk Alerts</h1>

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
          {alerts.length === 0 ? (
            <div className="bg-white p-8 rounded-xl shadow text-green-600">
              No risk alerts. All students are performing well.
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr className="text-left">
                    <th className="p-4">Student</th>
                    <th>Risk Subjects</th>
                    <th>Issues</th>
                    <th>Suggestion</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.map((alert, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-medium">{alert.name}</td>
                      <td>{alert.subjects.join(", ")}</td>
                      <td className="text-red-500">{alert.issues.join(", ")}</td>
                      <td className="text-gray-600">{alert.suggestion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}