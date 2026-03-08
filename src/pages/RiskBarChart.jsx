import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const data = [
  { name: "Attendance", value: 60 },
  { name: "Marks", value: 45 },
  { name: "Assignments", value: 50 }
];

export default function RiskBarChart() {
  return (
    <div className="bg-white p-6 rounded-xl shadow h-80">
      <h2 className="font-bold mb-4">
        Risk Feature Importance
      </h2>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#6366f1" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}