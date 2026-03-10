import DashboardCard from "../components/DashboardCard";
import RiskBarChart from "../components/RiskBarChart";
import StudentDetail from "../components/StudentDetail";

export default function StudentPage() {
  return (
    <div className="p-10 bg-gray-100 min-h-screen">

      <h1 className="text-3xl font-bold mb-6">
        Student Risk Analysis
      </h1>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <DashboardCard title="Attendance" value="65%" />
        <DashboardCard title="Marks" value="45" />
        <DashboardCard title="Risk Level" value="High" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <RiskBarChart />
        <StudentDetail />
      </div>

    </div>
  );
}