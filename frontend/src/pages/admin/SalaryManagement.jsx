import React, { useState } from "react";

const SalaryManagement = () => {
  // Dữ liệu mẫu (Mock data) lương nhân viên
  const [salaries] = useState([
    {
      id: "NV001",
      name: "Nguyễn Thị A",
      month: "10/2023",
      baseSalary: 7000000,
      shiftsCompleted: 15,
      commissionPerShift: 100000,
      otherBonus: 0,
      deduction: 0,
      status: "Đã thanh toán",
    },
    {
      id: "NV002",
      name: "Trần Văn B",
      month: "10/2023",
      baseSalary: 8000000,
      shiftsCompleted: 5,
      commissionPerShift: 100000,
      otherBonus: 0,
      deduction: 200000,
      status: "Chưa thanh toán",
    },
    {
      id: "NV003",
      name: "Lê Thị C",
      month: "10/2023",
      baseSalary: 6000000,
      shiftsCompleted: 10,
      commissionPerShift: 100000,
      otherBonus: 0,
      deduction: 0,
      status: "Chưa thanh toán",
    },
  ]);

  // Hàm định dạng tiền tệ Việt Nam (VNĐ)
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Tiêu đề & Bộ lọc */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản Lý Lương</h1>
            <p className="text-gray-500 text-sm mt-1">
              Tính toán, duyệt và theo dõi lương thưởng của nhân viên
            </p>
          </div>
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <select className="border border-gray-300 bg-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm">
              <option value="10/2023">Kỳ lương: Tháng 10/2023</option>
              <option value="09/2023">Kỳ lương: Tháng 09/2023</option>
            </select>
            <button className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-medium shadow transition whitespace-nowrap">
              Xuất Bảng Lương (Excel)
            </button>
          </div>
        </div>

        {/* Bảng danh sách Lương */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-sm text-gray-500 uppercase tracking-wider">
                  <th className="p-4 font-semibold whitespace-nowrap">
                    Nhân viên
                  </th>
                  <th className="p-4 font-semibold whitespace-nowrap">
                    Lương cơ bản
                  </th>
                  <th className="p-4 font-semibold whitespace-nowrap">
                    Số ca (Dịch vụ)
                  </th>
                  <th className="p-4 font-semibold whitespace-nowrap">
                    Hoa hồng & Thưởng
                  </th>
                  <th className="p-4 font-semibold whitespace-nowrap">
                    Khấu trừ
                  </th>
                  <th className="p-4 font-semibold whitespace-nowrap">
                    Thực nhận
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
                {salaries.map((salary, idx) => {
                  const commission =
                    salary.shiftsCompleted * salary.commissionPerShift;
                  const totalBonus = commission + salary.otherBonus;
                  const netSalary =
                    salary.baseSalary + totalBonus - salary.deduction;
                  return (
                    <tr key={idx} className="hover:bg-gray-50/50 transition">
                      <td className="p-4 text-gray-800">
                        <span className="block font-medium">{salary.name}</span>
                        <span className="text-xs text-gray-500">
                          {salary.id}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600">
                        {formatCurrency(salary.baseSalary)}
                      </td>
                      <td className="p-4 text-gray-600">
                        <span className="font-bold text-indigo-600">
                          {salary.shiftsCompleted}
                        </span>{" "}
                        ca
                        <span className="block text-xs text-gray-400 mt-0.5">
                          x {formatCurrency(salary.commissionPerShift)}
                        </span>
                      </td>
                      <td className="p-4 text-green-600 font-medium">
                        +{formatCurrency(totalBonus)}
                      </td>
                      <td className="p-4 text-red-500 font-medium">
                        -{formatCurrency(salary.deduction)}
                      </td>
                      <td className="p-4 text-indigo-700 font-bold text-lg">
                        {formatCurrency(netSalary)}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap ${
                            salary.status === "Đã thanh toán"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {salary.status}
                        </span>
                      </td>
                      <td className="p-4 text-center space-x-3 whitespace-nowrap">
                        <button className="text-indigo-500 hover:text-indigo-700 font-medium text-sm transition">
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalaryManagement;
