import React from "react";

export const AdminModal = ({
  isOpen,
  onClose,
  title,
  onSubmit,
  onConfirm, // Thêm alias cho onSubmit
  children,
  isLoading = false,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  size = "md", // md, lg, xl
  showConfirm = true, // Thêm option ẩn nút confirm
}) => {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (onConfirm) onConfirm(e);
    else if (onSubmit) onSubmit(e);
  };

  const sizeClasses = {
    md: "max-w-md",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div
        className={`${sizeClasses[size]} w-full bg-white rounded-3xl shadow-2xl overflow-hidden animate-scale-up`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="px-8 py-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
            {children}
          </div>

          {/* Footer */}
          <div className="px-8 py-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl font-semibold text-gray-600 hover:bg-gray-200 transition"
            >
              {cancelText}
            </button>
            {showConfirm && (
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading && (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                )}
                {confirmText}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

// Reusable Input Component with Error Message
export const FormInput = ({
  label,
  error,
  id,
  required = false,
  type = "text",
  ...props
}) => (
  <div className="mb-4">
    {label && (
      <label
        htmlFor={id}
        className="block text-sm font-bold text-gray-700 mb-1.5"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <input
      id={id}
      type={type}
      className={`w-full px-4 py-3 rounded-xl border transition-all outline-none text-gray-900 ${
        error
          ? "border-red-500 focus:ring-4 focus:ring-red-100"
          : "border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
      }`}
      {...props}
    />
    {error && (
      <p className="mt-1.5 text-xs font-medium text-red-500 flex items-center gap-1">
        <span>⚠️</span> {error}
      </p>
    )}
  </div>
);

// Reusable Select Component
export const FormSelect = ({
  label,
  error,
  id,
  options = [],
  required = false,
  ...props
}) => (
  <div className="mb-4">
    {label && (
      <label
        htmlFor={id}
        className="block text-sm font-bold text-gray-700 mb-1.5"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <select
      id={id}
      className={`w-full px-4 py-3 rounded-xl border transition-all outline-none text-gray-900 bg-white appearance-none ${
        error
          ? "border-red-500 focus:ring-4 focus:ring-red-100"
          : "border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
      } ${props.disabled ? "opacity-60 cursor-not-allowed" : ""}`}
      {...props}
    >
      {options.map((opt, idx) => (
        <option
          key={opt.value ?? `opt-${idx}`}
          value={opt.value}
          disabled={opt.disabled}
        >
          {opt.label}
        </option>
      ))}
    </select>
    {error && (
      <p className="mt-1.5 text-xs font-medium text-red-500 flex items-center gap-1">
        <span>⚠️</span> {error}
      </p>
    )}
  </div>
);

// Reusable Textarea Component
export const FormTextarea = ({
  label,
  error,
  id,
  required = false,
  rows = 3,
  ...props
}) => (
  <div className="mb-4">
    {label && (
      <label
        htmlFor={id}
        className="block text-sm font-bold text-gray-700 mb-1.5"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <textarea
      id={id}
      rows={rows}
      className={`w-full px-4 py-3 rounded-xl border transition-all outline-none text-gray-900 ${
        error
          ? "border-red-500 focus:ring-4 focus:ring-red-100"
          : "border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
      }`}
      {...props}
    />
    {error && (
      <p className="mt-1.5 text-xs font-medium text-red-500 flex items-center gap-1">
        <span>⚠️</span> {error}
      </p>
    )}
  </div>
);

export default AdminModal;
