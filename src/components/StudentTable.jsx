import { useNavigate } from "react-router-dom";

function StudentTable({ students, filter, setFilter }) {

  const navigate = useNavigate();

  const filteredStudents = students.filter(
    (s) => !filter || s.risk === filter
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg mt-6 overflow-x-auto">

      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-semibold">Student List</h2>

        <select
          className="border rounded p-2"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">All</option>
          <option value="High">High Risk</option>
          <option value="Medium">Medium Risk</option>
          <option value="Low">Low Risk</option>
        </select>

      </div>

      <table className="min-w-full table-auto border-collapse">

        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Attendance</th>
            <th className="p-2 border">Marks</th>
            <th className="p-2 border">Risk</th>
            <th className="p-2 border">Action</th>
          </tr>
        </thead>

        <tbody>

          {filteredStudents.map((s) => (
            <tr key={s.id} className="hover:bg-gray-50">

              <td className="p-2 border">{s.name}</td>
              <td className="p-2 border">{s.attendance}%</td>
              <td className="p-2 border">{s.marks}</td>
              <td className="p-2 border font-bold">{s.risk}</td>

              <td className="p-2 border">
                <button
                  onClick={() => navigate(`/student/${s.id}`)}
                  className="text-blue-600 hover:underline"
                >
                  View
                </button>
              </td>

            </tr>
          ))}

        </tbody>
      </table>

    </div>
  );
}

export default StudentTable;