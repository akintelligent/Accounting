const Button = ({ label, onClick, type = "button", className = "" }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition ${className}`}
    >
      {label}
    </button>
  );
};

export default Button;
