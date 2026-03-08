import { FaUserCircle } from "react-icons/fa";

export default function Navbar() {
  return (
    <div className="bg-white shadow px-6 py-4 flex justify-between items-center">

      <h2 className="text-xl font-semibold">
        Student Risk Dashboard
      </h2>

      <div className="flex items-center gap-3">

        <FaUserCircle size={28} />

        <span className="font-medium">
          Admin
        </span>

      </div>

    </div>
  );
}