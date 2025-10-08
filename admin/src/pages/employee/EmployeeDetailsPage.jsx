import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getEmployeeById } from "../../services/employeeService";

export default function EmployeeDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchEmployee = async () => {
    try {
      const res = await getEmployeeById(id);
      if (res.data.success) {
        const e = res.data.data.employee;
        setEmployee({
          EMP_ID: e[0],
          EMP_CODE: e[1],
          EMP_NAME: e[2],
          EMAIL: e[3],
          PHONE: e[4],
          DESIGNATION: e[5],
          STATUS: e[6],
          PHOTO_URL: e[7],
        });
      }
    } catch (err) {
      console.error("Error fetching employee:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="animate-pulse text-lg font-semibold text-blue-600">
          Loading Employee Details...
        </span>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="text-lg font-semibold text-red-500">
          Employee not found
        </span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto bg-gradient-to-br from-white to-gray-50 shadow-lg rounded-xl animate-fade-in">
      {/* Back Button */}
      <button
        className="mb-6 text-blue-600 hover:text-blue-800 flex items-center gap-2 font-semibold"
        onClick={() => navigate(-1)}
      >
        ← Back to Employee List
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
        {employee.PHOTO_URL ? (
          <img
            src={employee.PHOTO_URL}
            alt={employee.EMP_NAME}
            className="w-40 h-40 rounded-full object-cover shadow-lg border-4 border-blue-200 transition-transform hover:scale-105"
          />
        ) : (
          <div className="w-40 h-40 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
            No Photo
          </div>
        )}
        <div>
          <h2 className="text-3xl font-bold text-gray-800">
            {employee.EMP_NAME}
          </h2>
          <p className="text-gray-600 mt-2">{employee.DESIGNATION}</p>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DetailItem label="Code" value={employee.EMP_CODE} />
        <DetailItem label="Email" value={employee.EMAIL} />
        <DetailItem label="Phone" value={employee.PHONE} />
        <DetailItem label="Designation" value={employee.DESIGNATION} />
        <DetailItem
          label="Status"
          value={
            <span
              className={`px-2 py-1 rounded font-semibold ${
                employee.STATUS === "A"
                  ? "bg-green-200 text-green-800"
                  : "bg-red-200 text-red-800"
              }`}
            >
              {employee.STATUS === "A" ? "Active" : "Inactive"}
            </span>
          }
        />
      </div>
    </div>
  );
}

// Detail Item Component
function DetailItem({ label, value }) {
  return (
    <div className="bg-white shadow-sm p-4 rounded-lg border border-gray-100 transition hover:shadow-md">
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className="text-lg font-semibold text-gray-800">{value}</p>
    </div>
  );
}
