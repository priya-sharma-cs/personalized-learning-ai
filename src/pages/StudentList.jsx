import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

export default function Students() {

  const students = [
    { id:1, name:"Rahul Sharma", risk:"High" },
    { id:2, name:"Ananya Singh", risk:"Medium" },
    { id:3, name:"Amit Kumar", risk:"Low" },
  ];

  return (

    <div className="flex">

      <Sidebar />

      <div className="flex-1 bg-gray-100">

        <Navbar />

        <div className="p-6">

          <h1 className="text-xl font-bold mb-6">
            Students
          </h1>

          <table className="w-full bg-white shadow rounded">

            <thead className="bg-gray-200">
              <tr>
                <th className="p-3">ID</th>
                <th>Name</th>
                <th>Risk</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {students.map((s)=>(
                <tr key={s.id} className="text-center border-t">

                  <td className="p-3">{s.id}</td>
                  <td>{s.name}</td>
                  <td>{s.risk}</td>

                  <td>
                    <Link
                      className="text-blue-600"
                      to={`/student/${s.id}`}
                    >
                      View
                    </Link>
                  </td>

                </tr>
              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}