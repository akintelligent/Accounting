import { useEffect, useState } from "react";
import { createEmployee, updateEmployee } from "../../services/employeeService";
import { motion, AnimatePresence } from "framer-motion";

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
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-start justify-center overflow-auto pt-10 pb-10 bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100"
      >
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl p-8 overflow-y-auto max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-2">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-wide">
              {editEmployee ? "Edit Employee" : "Add Employee"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-900 text-3xl font-bold transition-transform transform hover:scale-110"
            >
              &times;
            </button>
          </div>

          {/* Form Grid like Journal Entry */}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: "Employee Name", name: "EMP_NAME", type: "text" },
              { label: "Email", name: "EMAIL", type: "email" },
              { label: "Phone", name: "PHONE", type: "text" },
              { label: "Designation", name: "DESIGNATION", type: "text" },
            ].map((field) => (
              <div key={field.name} className="relative">
                <input
                  type={field.type}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  required
                  className="peer w-full border border-gray-300 rounded-2xl px-4 pt-5 pb-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
                  placeholder=" "
                />
                <label className="absolute left-4 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-blue-500 peer-focus:text-sm">
                  {field.label}
                </label>
              </div>
            ))}

            {/* Status */}
            <div className="relative">
              <select
                name="STATUS"
                value={formData.STATUS}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-2xl px-4 pt-5 pb-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
              >
                <option value="A">Active</option>
                <option value="I">Inactive</option>
              </select>
              <label className="absolute left-4 top-2 text-gray-500 text-sm">Status</label>
            </div>

            {/* Photo Upload */}
            <div className="md:col-span-2">
              <label className="block mb-2 font-semibold text-gray-700">Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full border border-gray-300 rounded-2xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
              />
              {preview && (
                <div className="mt-3 relative w-32 h-32 group rounded-2xl overflow-hidden shadow-lg">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-110"
                  />
                  <span className="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 rounded-2xl flex items-center justify-center text-white font-semibold transition-opacity">
                    Preview
                  </span>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="md:col-span-2 flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-2xl shadow-md transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-2 rounded-2xl shadow-lg transition-all duration-200 flex items-center justify-center"
              >
                {isSubmitting ? (
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="inline-block"
                  >
                    ⏳ Saving...
                  </motion.span>
                ) : editEmployee ? (
                  "Update"
                ) : (
                  "Create"
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}


// import { useEffect, useState } from "react";
// import { createEmployee, updateEmployee } from "../../services/employeeService";
// import { motion, AnimatePresence } from "framer-motion";

// export default function EmployeeForm({ editEmployee, onClose, onSave }) {
//   const [formData, setFormData] = useState({
//     EMP_NAME: "",
//     EMAIL: "",
//     PHONE: "",
//     DESIGNATION: "",
//     STATUS: "A",
//     PHOTO_URL: null,
//   });
//   const [preview, setPreview] = useState(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   useEffect(() => {
//     if (editEmployee) {
//       setFormData({
//         EMP_NAME: editEmployee.EMP_NAME || "",
//         EMAIL: editEmployee.EMAIL || "",
//         PHONE: editEmployee.PHONE || "",
//         DESIGNATION: editEmployee.DESIGNATION || "",
//         STATUS: editEmployee.STATUS || "A",
//         PHOTO_URL: null,
//       });
//       setPreview(editEmployee.PHOTO_URL || null);
//     }
//   }, [editEmployee]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     setFormData((prev) => ({ ...prev, PHOTO_URL: file }));
//     if (file) setPreview(URL.createObjectURL(file));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsSubmitting(true);
//     try {
//       const form = new FormData();
//       form.append("EMP_NAME", formData.EMP_NAME);
//       form.append("EMAIL", formData.EMAIL);
//       form.append("PHONE", formData.PHONE);
//       form.append("DESIGNATION", formData.DESIGNATION);
//       form.append("STATUS", formData.STATUS);
//       if (formData.PHOTO_URL) form.append("PHOTO_URL", formData.PHOTO_URL);

//       if (editEmployee && editEmployee.EMP_ID) {
//         await updateEmployee(editEmployee.EMP_ID, form);
//       } else {
//         await createEmployee(form);
//       }

//       onSave();
//     } catch (error) {
//       console.error("Error saving employee:", error);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <AnimatePresence>
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         exit={{ opacity: 0 }}
//         className="fixed inset-0 z-50 flex items-center justify-center overflow-auto p-4"
//         style={{
//           background: `url('https://images.unsplash.com/photo-1593642532973-d31b6557fa68?auto=format&fit=crop&w=1470&q=80') center/cover no-repeat`,
//         }}
//       >
//         <motion.div
//           initial={{ scale: 0.9, opacity: 0 }}
//           animate={{ scale: 1, opacity: 1 }}
//           exit={{ scale: 0.9, opacity: 0 }}
//           transition={{ duration: 0.4 }}
//           className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl w-full max-w-lg p-8 overflow-y-auto max-h-[90vh] relative"
//         >
//           {/* Header */}
//           <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-2">
//             <h2 className="text-2xl md:text-3xl font-extrabold text-gray-800 tracking-wide">
//               {editEmployee ? "Edit Employee" : "Add Employee"}
//             </h2>
//             <button
//               onClick={onClose}
//               className="text-gray-600 hover:text-gray-900 text-3xl font-bold transition-transform transform hover:scale-110"
//             >
//               &times;
//             </button>
//           </div>

//           {/* Form */}
//           <form onSubmit={handleSubmit} className="space-y-6">
//             {[
//               { label: "Employee Name", name: "EMP_NAME", type: "text" },
//               { label: "Email", name: "EMAIL", type: "email" },
//               { label: "Phone", name: "PHONE", type: "text" },
//               { label: "Designation", name: "DESIGNATION", type: "text" },
//             ].map((field) => (
//               <div key={field.name} className="relative">
//                 <input
//                   type={field.type}
//                   name={field.name}
//                   value={formData[field.name]}
//                   onChange={handleChange}
//                   required
//                   className="peer w-full border border-gray-300 rounded-2xl px-4 pt-5 pb-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
//                   placeholder=" "
//                 />
//                 <label className="absolute left-4 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-blue-500 peer-focus:text-sm">
//                   {field.label}
//                 </label>
//               </div>
//             ))}

//             {/* Status */}
//             <div className="relative">
//               <select
//                 name="STATUS"
//                 value={formData.STATUS}
//                 onChange={handleChange}
//                 className="w-full border border-gray-300 rounded-2xl px-4 pt-5 pb-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
//               >
//                 <option value="A">Active</option>
//                 <option value="I">Inactive</option>
//               </select>
//               <label className="absolute left-4 top-2 text-gray-500 text-sm">Status</label>
//             </div>

//             {/* Photo Upload */}
//             <div>
//               <label className="block mb-2 font-semibold text-gray-700">Photo</label>
//               <input
//                 type="file"
//                 accept="image/*"
//                 onChange={handleFileChange}
//                 className="w-full border border-gray-300 rounded-2xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
//               />
//               {preview && (
//                 <div className="mt-3 relative w-32 h-32 group rounded-2xl overflow-hidden shadow-lg">
//                   <img
//                     src={preview}
//                     alt="Preview"
//                     className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-110"
//                   />
//                   <span className="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 rounded-2xl flex items-center justify-center text-white font-semibold transition-opacity">
//                     Preview
//                   </span>
//                 </div>
//               )}
//             </div>

//             {/* Buttons */}
//             <div className="flex justify-end space-x-4 mt-6">
//               <button
//                 type="button"
//                 onClick={onClose}
//                 className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-2xl shadow-md transition-all duration-200"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 disabled={isSubmitting}
//                 className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-2 rounded-2xl shadow-lg transition-all duration-200 flex items-center justify-center"
//               >
//                 {isSubmitting ? (
//                   <motion.span
//                     animate={{ rotate: 360 }}
//                     transition={{ repeat: Infinity, duration: 1 }}
//                     className="inline-block"
//                   >
//                     ⏳ Saving...
//                   </motion.span>
//                 ) : editEmployee ? (
//                   "Update"
//                 ) : (
//                   "Create"
//                 )}
//               </button>
//             </div>
//           </form>
//         </motion.div>
//       </motion.div>
//     </AnimatePresence>
//   );
// }
