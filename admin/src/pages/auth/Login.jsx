import { useState, useContext } from "react";
import { Input } from "../../components/UI/Input";
import { UserContext } from "../../context/userContext";
import { useNavigate } from "react-router-dom";
import { login, setUser as saveUser } from "../../services/authService";

export default function Login() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await login(formData);

      if (res.data.success) {
        localStorage.setItem("token", res.data.data.token);
        saveUser(res.data.data.user);
        setUser(res.data.data.user);
        navigate("/dashboard");
      } else {
        setError(res.data.message || "Login failed");
      }
    } catch (err) {
      console.error(err);
      setError("Invalid credentials");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-96"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        {error && (
          <div className="mb-4 text-red-500 text-sm font-medium">{error}</div>
        )}
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
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Login
        </button>
      </form>
    </div>
  );
}
