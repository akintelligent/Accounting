import { useState, useContext } from "react";
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
    <div
      className="relative flex items-center justify-center h-screen"
      style={{
        background: "url('/images/bg1.webp') center/cover no-repeat",
      }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/70"></div>

      {/* Transparent Stylish Login Box */}
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-sm p-8 bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 animate-fade-in hover:scale-105 transform transition duration-300"
      >
        {/* Heading */}
        <h2 className="text-4xl font-extrabold mb-6 text-center text-white drop-shadow-lg">
          Smart Accounting System
        </h2>

        {/* Error Message */}
        {error && (
          <div className="mb-4 text-red-400 text-sm font-medium">{error}</div>
        )}

        {/* Username */}
        <div className="mb-4">
          <label className="block mb-2 text-white font-medium">Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            className="w-full p-3 rounded-lg bg-white/20 placeholder-gray-400 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholder="Enter your username"
          />
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="block mb-2 text-white font-medium">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full p-3 rounded-lg bg-white/20 placeholder-gray-400 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            placeholder="Enter your password"
          />
        </div>

        {/* Login Button */}
        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:scale-105 transform transition duration-300"
        >
          Login
        </button>
      </form>
    </div>
  );
}
