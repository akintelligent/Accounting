export const Input = ({ label, ...props }) => {
  return (
    <div className="mb-4">
      {label && <label className="block mb-1 font-medium">{label}</label>}
      <input
        {...props}
        className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
};
