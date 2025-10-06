import { useEffect, useState } from "react";
import { Input } from "../../components/UI/Input";
import { Select } from "../../components/UI/Select";
import { getEmployees, getRoles, createUser, updateUser } from "../../services/userService";

export default function UserForm({ editUser, onSave }) {
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
  const [formData, setFormData] = useState({
    emp_id: "",
    username: "",
    password: "",
    role_id: "",
    is_active: "Y",
  });

  useEffect(() => {
    fetchEmployees();
    fetchRoles();
  }, []);

  useEffect(() => {
    if (editUser) {
      setFormData({
        emp_id: editUser.EMP_ID || "",
        username: editUser.USERNAME || "",
        password: "",
        role_id: editUser.ROLE_ID || "",
        is_active: editUser.IS_ACTIVE || "Y",
      });
    } else {
      resetForm();
    }
  }, [editUser]);

  const fetchEmployees = async () => {
    try {
      const res = await getEmployees();
      if (res.data.success) {
        setEmployees(res.data.data.employees.map(emp => ({
          value: emp.EMP_ID,
          label: emp.EMP_NAME
        })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await getRoles();
      if (res.data.success) {
        setRoles(res.data.data.roles.map(role => ({
          value: role.ROLE_ID,
          label: role.ROLE_NAME
        })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({
      emp_id: "",
      username: "",
      password: "",
      role_id: "",
      is_active: "Y",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editUser && editUser.USER_ID) {
        await updateUser(editUser.USER_ID, formData);
      } else {
        await createUser(formData);
      }
      resetForm();
      onSave();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md bg-white p-6 rounded shadow">
      <Select
        label="Employee"
        name="emp_id"
        value={formData.emp_id}
        onChange={handleChange}
        options={employees}
      />

      <Input
        label="Username"
        name="username"
        value={formData.username}
        onChange={handleChange}
        required
      />

      <Input
        label="Password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        type="password"
        required={!editUser}
      />

      <Select
        label="Role"
        name="role_id"
        value={formData.role_id}
        onChange={handleChange}
        options={roles}
      />

      <div className="mb-4">
        <label className="block mb-1 font-medium">Status</label>
        <select
          name="is_active"
          value={formData.is_active}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        >
          <option value="Y">Active</option>
          <option value="N">Inactive</option>
        </select>
      </div>

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        {editUser ? "Update" : "Create"} User
      </button>
    </form>
  );
}
