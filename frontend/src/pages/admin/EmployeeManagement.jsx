import React, { useState, useEffect } from "react";
import { employeeAPI } from "../../services/apiClient";
import toast from "react-hot-toast";

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    // Admin (1) và Quản lý (4) mới có quyền truy cập
    if (user.role_id && ![1, 4].includes(Number(user.role_id))) {
      setIsLoading(false);
      return;
    }
    fetchEmployees();
  }, [user.role_id]);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const response = await employeeAPI.getAll();
      if (response?.data?.success) {
        setEmployees(response.data.data);
      }
    } catch (error) {
      toast.error("Lỗi khi tải danh sách nhân viên");
    } finally {
      setIsLoading(false);
    }
  };

  if (user.role_id && ![1, 4].includes(Number(user.role_id))) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Bạn không có quyền truy cập trang này.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Quản lý Nhân viên
          </h2>
          <p className="text-gray-500 text-sm">
            Quản lý đội ngũ chuyên gia và nhân sự
          </p>
        </div>
        <p className="text-sm text-gray-500 italic">
          * Thêm/xóa nhân viên được thực hiện tại trang Quản lý tài khoản.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                <th className="px-6 py-4 font-semibold">Nhân viên</th>
                <th className="px-6 py-4 font-semibold">Liên hệ</th>
                <th className="px-6 py-4 font-semibold">Vai trò</th>
                <th className="px-6 py-4 font-semibold text-center">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-indigo-50/30 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        {emp.avatar ? (
                          <img
                            src={emp.avatar}
                            alt={emp.name}
                            className="w-10 h-10 rounded-full object-cover border border-indigo-100"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                            {emp.name?.charAt(0) || "N"}
                          </div>
                        )}
                        <p className="font-bold text-gray-900">{emp.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900 font-medium">{emp.email}</p>
                      <p className="text-gray-500 text-xs">{emp.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold w-fit">
                        {emp.role_name || "Nhân viên"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          emp.status === "hoat_dong"
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {emp.status === "hoat_dong" ? "Hoạt động" : "Bị khóa"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeManagement;
