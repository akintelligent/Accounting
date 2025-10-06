export const Select = ({ label, options, ...props }) => {
  return (
    <div className="mb-4">
      {label && <label className="block mb-1 font-medium">{label}</label>}
      <select
        {...props}
        className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Select {label}</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};
