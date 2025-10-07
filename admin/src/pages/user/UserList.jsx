import { useEffect, useState } from "react";
import { getUsers, deleteUser } from "../../services/userService";
import UserForm from "./UserForm";
import { FaEdit, FaTrash, FaUser } from "react-icons/fa";

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [editUser, setEditUser] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      if (res.data.success) {
        const mappedUsers = res.data.data.users.map((u) => ({
          USER_ID: u[0],
          USERNAME: u[1],
          IS_ACTIVE: u[2],
          ROLE_ID: u[3],
          EMP_NAME: u[4],
          EMP_ID: u[5],
          ROLE_NAME: u[6],
        }));
        setUsers(mappedUsers);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEdit = (user) => {
    setEditUser(user);
  };

  const handleDelete = async (user_id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      await deleteUser(user_id);
      fetchUsers();
    }
  };

  const handleSave = () => {
    setEditUser(null);
    fetchUsers();
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* User Form */}
        <div className="w-full lg:w-1/3 bg-white rounded-xl shadow-lg p-6 animate-fade-in">
          <UserForm editUser={editUser} onSave={handleSave} />
        </div>

        {/* User List */}
        <div className="w-full lg:w-2/3 bg-white rounded-xl shadow-lg p-4 animate-fade-in">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <FaUser /> User List
          </h2>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">ID</th>
                  <th className="px-4 py-2 text-left">Username</th>
                  <th className="px-4 py-2 text-left">Employee</th>
                  <th className="px-4 py-2 text-left">Role</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {users.length > 0 ? (
                  users.map((u) => (
                    <tr
                      key={u.USER_ID}
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="px-4 py-2">{u.USER_ID}</td>
                      <td className="px-4 py-2 font-medium">{u.USERNAME}</td>
                      <td className="px-4 py-2">{u.EMP_NAME}</td>
                      <td className="px-4 py-2">{u.ROLE_NAME}</td>
                      <td className="px-4 py-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            u.IS_ACTIVE === "Y"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {u.IS_ACTIVE === "Y" ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-2 flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(u)}
                          className="bg-yellow-500 text-white p-2 rounded-lg hover:bg-yellow-600 transition"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(u.USER_ID)}
                          className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center p-4">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
