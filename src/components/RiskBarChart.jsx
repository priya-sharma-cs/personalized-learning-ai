import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

function RiskBarChart() {

  const data = [
    { risk: "High", students: 15 },
    { risk: "Medium", students: 40 },
    { risk: "Low", students: 65 }
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis dataKey="risk" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="students" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default RiskBarChart;