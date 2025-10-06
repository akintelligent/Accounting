import { useEffect, useState } from "react";
import { getUsers, deleteUser } from "../../services/userService";
import UserForm from "./UserForm";

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
    <div className="flex space-x-6">
      {/* Form Section */}
      <div className="w-1/3">
        <UserForm editUser={editUser} onSave={handleSave} />
      </div>

      {/* List Section */}
      <div className="w-2/3 overflow-auto">
        <table className="min-w-full bg-white border shadow-md">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-4 py-2">ID</th>
              <th className="border px-4 py-2">Username</th>
              <th className="border px-4 py-2">Employee</th>
              <th className="border px-4 py-2">Role</th>
              <th className="border px-4 py-2">Status</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((u) => (
                <tr key={u.USER_ID} className="hover:bg-gray-100">
                  <td className="border px-4 py-2">{u.USER_ID}</td>
                  <td className="border px-4 py-2">{u.USERNAME}</td>
                  <td className="border px-4 py-2">{u.EMP_NAME}</td>
                  <td className="border px-4 py-2">{u.ROLE_NAME}</td>
                  <td className="border px-4 py-2">
                    {u.IS_ACTIVE === "Y" ? "Active" : "Inactive"}
                  </td>
                  <td className="border px-4 py-2 space-x-2">
                    <button
                      onClick={() => handleEdit(u)}
                      className="bg-yellow-500 px-2 py-1 rounded hover:bg-yellow-600 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(u.USER_ID)}
                      className="bg-red-500 px-2 py-1 rounded hover:bg-red-600 transition"
                    >
                      Delete
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
  );
}
