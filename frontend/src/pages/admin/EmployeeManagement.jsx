import React, { useState } from "react";

const EmployeeManagement = () => {
  // Dữ liệu mẫu (Mock data) nhân viên
  const [employees, setEmployees] = useState([
    {
      id: "NV001",
      name: "Nguyễn Thị A",
      role: "Điều dưỡng viên",
      phone: "0901234567",
      status: "Đang làm việc",
    },
    {
      id: "NV002",
      name: "Trần Văn B",
      role: "Chuyên viên Massage",
      phone: "0912345678",
      status: "Đang làm việc",
    },
    {
      id: "NV003",
      name: "Lê Thị C",
      role: "Lễ tân",
      phone: "0923456789",
      status: "Nghỉ phép",
    },
  ]);

  // State kiểm soát trạng thái đóng/mở Modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State lưu trữ dữ liệu form nhập liệu nhân viên mới
  const [newEmployee, setNewEmployee] = useState({
    id: "",
    name: "",
    role: "",
    phone: "",
    status: "Đang làm việc",
  });

  // Xử lý lưu nhân viên mới
  const handleAddEmployee = (e) => {
    e.preventDefault();
    // Tự động tạo ID giả lập (VD: NV004) nếu chưa nhập
    const empId = newEmployee.id || `NV00${employees.length + 1}`;

    setEmployees([...employees, { ...newEmployee, id: empId }]);

    // Đóng Modal và reset lại form
    setIsModalOpen(false);
    setNewEmployee({
      id: "",
      name: "",
      role: "",
      phone: "",
      status: "Đang làm việc",
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Tiêu đề & Nút thao tác */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Quản Lý Nhân Viên
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Quản lý thông tin và trạng thái của đội ngũ nhân sự
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium shadow transition"
          >
            + Thêm Nhân Viên
          </button>
        </div>

        {/* Bảng danh sách nhân viên */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-sm text-gray-500 uppercase tracking-wider">
                  <th className="p-4 font-semibold whitespace-nowrap">Mã NV</th>
                  <th className="p-4 font-semibold whitespace-nowrap">
                    Họ và Tên
                  </th>
                  <th className="p-4 font-semibold whitespace-nowrap">
                    Vị trí
                  </th>
                  <th className="p-4 font-semibold whitespace-nowrap">
                    Số điện thoại
                  </th>
                  <th className="p-4 font-semibold whitespace-nowrap">
                    Trạng thái
                  </th>
                  <th className="p-4 font-semibold whitespace-nowrap text-center">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-50/50 transition">
                    <td className="p-4 text-gray-900 font-medium">{emp.id}</td>
                    <td className="p-4 text-gray-800">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">
                          {emp.name.charAt(0)}
                        </div>
                        <span className="font-medium">{emp.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">{emp.role}</td>
                    <td className="p-4 text-gray-600">{emp.phone}</td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap ${
                          emp.status === "Đang làm việc"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {emp.status}
                      </span>
                    </td>
                    <td className="p-4 text-center space-x-3 whitespace-nowrap">
                      <button className="text-indigo-500 hover:text-indigo-700 font-medium text-sm transition">
                        Sửa
                      </button>
                      <button className="text-red-500 hover:text-red-700 font-medium text-sm transition">
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Phân trang (Pagination) */}
          <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between text-sm text-gray-500 gap-4">
            <span>
              Hiển thị 1 đến {employees.length} trong số {employees.length} nhân
              viên
            </span>
            <div className="space-x-1">
              <button className="px-3 py-1.5 border border-gray-200 rounded-md hover:bg-gray-50 transition">
                Trước
              </button>
              <button className="px-3 py-1.5 border border-gray-200 rounded-md hover:bg-gray-50 transition">
                Sau
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Thêm Nhân Viên */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in-up">
            {/* Header Modal */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-900">
                Thêm Nhân Viên Mới
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            {/* Body / Form */}
            <form onSubmit={handleAddEmployee}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Họ và Tên
                  </label>
                  <input
                    type="text"
                    required
                    value={newEmployee.name}
                    onChange={(e) =>
                      setNewEmployee({ ...newEmployee, name: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                    placeholder="Nhập tên nhân viên"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vị trí / Chức vụ
                    </label>
                    <input
                      type="text"
                      required
                      value={newEmployee.role}
                      onChange={(e) =>
                        setNewEmployee({ ...newEmployee, role: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                      placeholder="VD: Lễ tân, Điều dưỡng..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      required
                      value={newEmployee.phone}
                      onChange={(e) =>
                        setNewEmployee({
                          ...newEmployee,
                          phone: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trạng thái
                  </label>
                  <select
                    value={newEmployee.status}
                    onChange={(e) =>
                      setNewEmployee({ ...newEmployee, status: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-white"
                  >
                    <option value="Đang làm việc">Đang làm việc</option>
                    <option value="Nghỉ phép">Nghỉ phép</option>
                    <option value="Đã nghỉ việc">Đã nghỉ việc</option>
                  </select>
                </div>
              </div>

              {/* Footer Modal */}
              <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm transition"
                >
                  Lưu Nhân Viên
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;
