import React, { useState, useEffect } from "react";
import { employeeAPI, userAPI } from "../../services/apiClient";
import toast from "react-hot-toast";
import AdminModal, { FormSelect } from "../../components/AdminModal";

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [formData, setFormData] = useState({
    user_id: "",
    chuc_vu: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Admin (1) và Quản lý (4) mới có quyền truy cập
    if (user.role_id && ![1, 4].includes(Number(user.role_id))) {
      setIsLoading(false);
      return;
    }
    fetchEmployees();
    fetchUsers();
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

  const fetchUsers = async () => {
    try {
      const res = await userAPI.getAll();
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error("Lỗi tải users:", err);
    }
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.user_id) newErrors.user_id = "Vui lòng chọn người dùng";
    if (!formData.chuc_vu.trim()) newErrors.chuc_vu = "Vui lòng nhập chức vụ";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOpenModal = (employee = null) => {
    setErrors({});
    if (employee) {
      setEditingEmployee(employee);
      setFormData({
        user_id: employee.user_id,
        chuc_vu: employee.chuc_vu,
      });
    } else {
      setEditingEmployee(null);
      setFormData({
        user_id: "",
        chuc_vu: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitLoading(true);
    try {
      if (editingEmployee) {
        await employeeAPI.update(editingEmployee.id, formData);
        toast.success("Cập nhật thành công!");
      } else {
        await employeeAPI.create(formData);
        toast.success("Thêm nhân viên thành công!");
      }
      setIsModalOpen(false);
      fetchEmployees();
    } catch (error) {
      toast.error(error.response?.data?.message || "Đã có lỗi xảy ra.");
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa nhân viên này?")) {
      try {
        await employeeAPI.delete(id);
        toast.success("Xóa nhân viên thành công!");
        fetchEmployees();
      } catch (error) {
        toast.error("Lỗi khi xóa nhân viên.");
      }
    }
  };

  const userOptions = [
    { value: "", label: "-- Chọn người dùng --" },
    ...users
      .filter((u) => [2, 4, 5, 6, 7, 8].includes(u.role_id))
      .map((u) => ({
        value: u.id,
        label: `${u.name} (${u.email}) - ${u.role_name}`,
      })),
  ];

  const chucVuOptions = [
    { value: "", label: "-- Chọn chức vụ --" },
    { value: "Lễ tân", label: "Lễ tân" },
    { value: "Dưỡng sinh", label: "Dưỡng sinh" },
    { value: "Thực phẩm", label: "Thực phẩm" },
    { value: "Tổng đài", label: "Tổng đài" },
    { value: "Chuyên viên chăm sóc", label: "Chuyên viên chăm sóc" },
    { value: "Điều dưỡng", label: "Điều dưỡng" },
    { value: "Quản lý", label: "Quản lý" },
    { value: "Bác sĩ", label: "Bác sĩ" },
  ];

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
        <button
          onClick={() => handleOpenModal()}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 flex items-center gap-2"
        >
          <span className="text-xl">+</span> Thêm nhân viên
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                <th className="px-6 py-4 font-semibold">Nhân viên</th>
                <th className="px-6 py-4 font-semibold">Liên hệ</th>
                <th className="px-6 py-4 font-semibold">Chức vụ</th>
                <th className="px-6 py-4 font-semibold text-center">
                  Trạng thái
                </th>
                <th className="px-6 py-4 font-semibold text-right">
                  Hành động
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
                        <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                          {emp.name?.charAt(0) || "N"}
                        </div>
                        <p className="font-bold text-gray-900">{emp.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900 font-medium">{emp.email}</p>
                      <p className="text-gray-500 text-xs">{emp.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold w-fit">
                          {emp.role_name || "Nhân viên"}
                        </span>
                        <span className="text-gray-500 text-[10px] mt-1 italic">
                          Chức vụ: {emp.chuc_vu || "Chưa cập nhật"}
                        </span>
                      </div>
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
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenModal(emp)}
                        className="text-indigo-600 hover:text-indigo-900 font-bold mr-4"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(emp.id)}
                        className="text-red-600 hover:text-red-900 font-bold"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEmployee ? "Cập nhật nhân viên" : "Thêm nhân viên mới"}
        onSubmit={handleSubmit}
        isLoading={isSubmitLoading}
      >
        <FormSelect
          label="Chọn tài khoản người dùng"
          id="user_id"
          options={userOptions}
          required
          disabled={!!editingEmployee}
          value={formData.user_id}
          onChange={(e) =>
            setFormData({ ...formData, user_id: e.target.value })
          }
          error={errors.user_id}
        />
        <FormSelect
          label="Chức vụ"
          id="chuc_vu"
          options={chucVuOptions}
          required
          value={formData.chuc_vu}
          onChange={(e) =>
            setFormData({ ...formData, chuc_vu: e.target.value })
          }
          error={errors.chuc_vu}
        />
      </AdminModal>
    </div>
  );
};

export default EmployeeManagement;
