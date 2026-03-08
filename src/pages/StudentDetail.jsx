import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function StudentDetail(){

  const {id} = useParams();

  return(

    <div className="flex">

      <Sidebar/>

      <div className="flex-1 bg-gray-100">

        <Navbar/>

        <div className="p-6">

          <h1 className="text-xl font-bold mb-6">
            Student Detail
          </h1>

          <div className="bg-white p-6 shadow rounded">

            <p><b>ID:</b> {id}</p>
            <p><b>Name:</b> Rahul Sharma</p>
            <p><b>Attendance:</b> 60%</p>
            <p><b>Marks:</b> 45</p>
            <p className="text-red-500 font-bold">
              Risk Level: High
            </p>

          </div>

        </div>

      </div>

    </div>

  )
}