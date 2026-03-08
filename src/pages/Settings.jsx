import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

export default function Settings() {
  const [attendance, setAttendance] = useState(60);
  const [marks, setMarks] = useState(50);
  const [saved, setSaved] = useState(false);
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
    const savedAttendance = localStorage.getItem("attendanceThreshold");
    const savedMarks = localStorage.getItem("marksThreshold");

    if (savedAttendance) setAttendance(parseInt(savedAttendance));
    if (savedMarks) setMarks(parseInt(savedMarks));
  }, []);

  // --- SAVE SETTINGS ---
  const saveSettings = () => {
    const attendanceValue = parseInt(attendance);
    const marksValue = parseInt(marks);

    localStorage.setItem("attendanceThreshold", attendanceValue);
    localStorage.setItem("marksThreshold", marksValue);

    // notify other pages
    window.dispatchEvent(new Event("settingsUpdated"));

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

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
          <h1 className="text-2xl font-bold text-gray-800">Risk Detection Settings</h1>

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

        {/* SETTINGS CONTENT */}
        <div className="p-8 max-w-5xl mx-auto space-y-8 overflow-auto">
          {/* Info Cards */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow">
              <h3 className="font-semibold mb-2">Attendance Threshold</h3>
              <p className="text-gray-600 text-sm">
                Students with attendance below this percentage will be flagged
                as potential academic risk.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <h3 className="font-semibold mb-2">Passing Marks</h3>
              <p className="text-gray-600 text-sm">
                Students scoring below this mark will be marked as needing
                academic support.
              </p>
            </div>
          </div>

          {/* Settings Panel */}
          <div className="bg-white p-8 rounded-xl shadow space-y-6">
            <div>
              <label className="block font-medium mb-2">Minimum Attendance (%)</label>
              <input
                type="number"
                value={attendance}
                onChange={(e) => setAttendance(e.target.value)}
                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-medium mb-2">Minimum Passing Marks</label>
              <input
                type="number"
                value={marks}
                onChange={(e) => setMarks(e.target.value)}
                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={saveSettings}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Save Settings
              </button>

              {saved && (
                <span className="text-green-600 font-medium">
                  Settings Saved ✔
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
