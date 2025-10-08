import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getEmployees, deleteEmployee } from "../../services/employeeService";
import EmployeeForm from "./EmployeeForm";
import { motion, AnimatePresence } from "framer-motion";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [editEmployee, setEditEmployee] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const fetchEmployees = async () => {
    try {
      const res = await getEmployees();
      if (res.data.success) {
        const formatted = res.data.data.employees.map((e) => ({
          EMP_ID: e[0],
          EMP_CODE: e[1],
          EMP_NAME: e[2],
          EMAIL: e[3],
          PHONE: e[4],
          DESIGNATION: e[5],
          STATUS: e[6],
          PHOTO_URL: e[7],
        }));
        setEmployees(formatted);
      }
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleEdit = (employee) => {
    setEditEmployee(employee);
    setShowModal(true);
  };

  const handleDelete = async (emp_id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      await deleteEmployee(emp_id);
      fetchEmployees();
    }
  };

  const handleSave = () => {
    setShowModal(false);
    setEditEmployee(null);
    fetchEmployees();
  };

  const handleView = (emp_id) => {
    navigate(`/employees/${emp_id}`);
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Employee Directory</h2>
        <button
          onClick={() => setShowModal(true)}
          className="mt-4 md:mt-0 flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-2 rounded-lg shadow-lg transition-all duration-300"
        >
          + Add Employee
        </button>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full bg-white border rounded shadow-lg">
          <thead>
            <tr className="bg-gradient-to-r from-gray-200 to-gray-100 text-gray-700">
              <th className="border px-4 py-2">Code</th>
              <th className="border px-4 py-2">Name</th>
              <th className="border px-4 py-2">Email</th>
              <th className="border px-4 py-2">Phone</th>
              <th className="border px-4 py-2">Designation</th>
              <th className="border px-4 py-2">Status</th>
              <th className="border px-4 py-2">Photo</th>
              <th className="border px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <motion.tr
                key={emp.EMP_ID}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="hover:bg-gray-50 transition-all duration-200"
              >
                <td className="border px-4 py-2">{emp.EMP_CODE}</td>
                <td className="border px-4 py-2">{emp.EMP_NAME}</td>
                <td className="border px-4 py-2">{emp.EMAIL}</td>
                <td className="border px-4 py-2">{emp.PHONE}</td>
                <td className="border px-4 py-2">{emp.DESIGNATION}</td>
                <td className="border px-4 py-2">
                  <span
                    className={`px-2 py-1 rounded-full text-white text-xs ${
                      emp.STATUS === "A" ? "bg-green-500" : "bg-red-500"
                    }`}
                  >
                    {emp.STATUS === "A" ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="border px-4 py-2">
                  {emp.PHOTO_URL ? (
                    <img
                      src={emp.PHOTO_URL}
                      alt={emp.EMP_NAME}
                      className="w-12 h-12 object-cover rounded-full border"
                    />
                  ) : (
                    <span className="text-gray-400 text-sm">No Photo</span>
                  )}
                </td>
                <td className="border px-4 py-2 flex justify-center gap-2">
                  <button
                    onClick={() => handleView(emp.EMP_ID)}
                    className="flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
                  >
                    <FaEye />
                  </button>
                  <button
                    onClick={() => handleEdit(emp)}
                    className="flex items-center gap-1 bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(emp.EMP_ID)}
                    className="flex items-center gap-1 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                  >
                    <FaTrash />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden grid gap-4">
        <AnimatePresence>
          {employees.map((emp) => (
            <motion.div
              key={emp.EMP_ID}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-lg shadow-lg p-4 flex flex-col justify-between"
            >
              <div className="flex items-center gap-4 mb-4">
                {emp.PHOTO_URL ? (
                  <img
                    src={emp.PHOTO_URL}
                    alt={emp.EMP_NAME}
                    className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-400">
                    N/A
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold">{emp.EMP_NAME}</h3>
                  <p className="text-sm text-gray-500">{emp.DESIGNATION}</p>
                </div>
              </div>

              <div className="space-y-1 text-sm text-gray-600">
                <div><strong>Code:</strong> {emp.EMP_CODE}</div>
                <div><strong>Email:</strong> {emp.EMAIL}</div>
                <div><strong>Phone:</strong> {emp.PHONE}</div>
                <div>
                  <strong>Status:</strong>{" "}
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      emp.STATUS === "A" ? "bg-green-500 text-white" : "bg-red-500 text-white"
                    }`}
                  >
                    {emp.STATUS === "A" ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex justify-between gap-2 flex-wrap">
                <button
                  onClick={() => handleView(emp.EMP_ID)}
                  className="flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
                >
                  <FaEye />
                </button>
                <button
                  onClick={() => handleEdit(emp)}
                  className="flex items-center gap-1 bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition"
                >
                  <FaEdit /> 
                </button>
                <button
                  onClick={() => handleDelete(emp.EMP_ID)}
                  className="flex items-center gap-1 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                >
                  <FaTrash />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-white rounded-lg shadow-2xl w-full max-w-lg p-6 overflow-y-auto"
            >
              <EmployeeForm
                editEmployee={editEmployee}
                onClose={() => {
                  setShowModal(false);
                  setEditEmployee(null);
                }}
                onSave={handleSave}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
