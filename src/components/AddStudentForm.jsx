import { useState } from "react";

function AddStudentForm({ onPredict }) {

  const [form, setForm] = useState({
    name: "",
    department: "",
    attendance: "",
    quiz: "",
    assignments: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onPredict(form);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg mt-6">

      <h2 className="text-xl font-bold mb-4">Add Student Data</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">

        <input
          name="name"
          placeholder="Student Name"
          className="border p-2 rounded"
          onChange={handleChange}
        />

        <input
          name="department"
          placeholder="Department"
          className="border p-2 rounded"
          onChange={handleChange}
        />

        <input
          name="attendance"
          placeholder="Attendance %"
          className="border p-2 rounded"
          onChange={handleChange}
        />

        <input
          name="quiz"
          placeholder="Average Quiz Score"
          className="border p-2 rounded"
          onChange={handleChange}
        />

        <input
          name="assignments"
          placeholder="Assignment Submission Rate"
          className="border p-2 rounded"
          onChange={handleChange}
        />

        <button
          className="col-span-2 bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Predict Risk
        </button>

      </form>
    </div>
  );
}

export default AddStudentForm;