import { useEffect, useState } from "react";
import { createEmployee, updateEmployee } from "../../services/employeeService";

export default function EmployeeForm({ editEmployee, onClose, onSave }) {
  const [formData, setFormData] = useState({
    EMP_NAME: "",
    EMAIL: "",
    PHONE: "",
    DESIGNATION: "",
    STATUS: "A",
    PHOTO_URL: null,
  });
  const [preview, setPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editEmployee) {
      setFormData({
        EMP_NAME: editEmployee.EMP_NAME || "",
        EMAIL: editEmployee.EMAIL || "",
        PHONE: editEmployee.PHONE || "",
        DESIGNATION: editEmployee.DESIGNATION || "",
        STATUS: editEmployee.STATUS || "A",
        PHOTO_URL: null,
      });
      setPreview(editEmployee.PHOTO_URL || null);
    }
  }, [editEmployee]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, PHOTO_URL: file }));
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const form = new FormData();
      form.append("EMP_NAME", formData.EMP_NAME);
      form.append("EMAIL", formData.EMAIL);
      form.append("PHONE", formData.PHONE);
      form.append("DESIGNATION", formData.DESIGNATION);
      form.append("STATUS", formData.STATUS);
      if (formData.PHOTO_URL) form.append("PHOTO_URL", formData.PHOTO_URL);

      if (editEmployee && editEmployee.EMP_ID) {
        await updateEmployee(editEmployee.EMP_ID, form);
      } else {
        await createEmployee(form);
      }

      onSave();
    } catch (error) {
      console.error("Error saving employee:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 overflow-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 animate-fade-in overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-6 border-b pb-2">
          <h2 className="text-2xl font-bold text-gray-800">
            {editEmployee ? "Edit Employee" : "Add Employee"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 text-2xl font-bold"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-semibold text-gray-700">Employee Name</label>
            <input
              type="text"
              name="EMP_NAME"
              value={formData.EMP_NAME}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold text-gray-700">Email</label>
            <input
              type="email"
              name="EMAIL"
              value={formData.EMAIL}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold text-gray-700">Phone</label>
            <input
              type="text"
              name="PHONE"
              value={formData.PHONE}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold text-gray-700">Designation</label>
            <input
              type="text"
              name="DESIGNATION"
              value={formData.DESIGNATION}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold text-gray-700">Status</label>
            <select
              name="STATUS"
              value={formData.STATUS}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="A">Active</option>
              <option value="I">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 font-semibold text-gray-700">Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full border rounded px-3 py-2"
            />
            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="mt-3 w-32 h-32 object-cover rounded border"
              />
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-400 hover:bg-gray-500 text-white px-5 py-2 rounded shadow"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded shadow flex items-center"
            >
              {isSubmitting ? (
                <span className="animate-pulse">Saving...</span>
              ) : editEmployee ? (
                "Update"
              ) : (
                "Create"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
