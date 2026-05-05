import React, { useState, useEffect, useMemo } from "react";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { userAPI } from "../../services/apiClient";
import toast from "react-hot-toast";
import AdminModal, { FormInput, FormSelect } from "../../components/AdminModal";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebouncedValue(searchTerm, 350);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [roleOptions, setRoleOptions] = useState([]);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role_id: 3,
    status: "hoat_dong",
    avatar: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user.role_id && ![1, 4].includes(Number(user.role_id))) {
      setIsLoading(false);
      return;
    }
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await userAPI.getRoles();
      // Đảm bảo luôn lấy được mảng dữ liệu dù cấu trúc là res.data.data hay res.data
      const rolesData = res.data?.data || res.data || [];
      const options = (Array.isArray(rolesData) ? rolesData : []).map((r) => ({
        value: r.id,
        label: r.name,
      }));
      setRoleOptions(options);
    } catch (err) {
      console.error("Lỗi tải danh sách vai trò:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await userAPI.getAll();
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error("Lỗi tải người dùng:", err);
      toast.error("Không thể tải danh sách người dùng");
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Họ tên không được để trống";
    if (!formData.email.trim()) {
      newErrors.email = "Email không được để trống";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!editingUser) {
      if (!formData.password) {
        newErrors.password = "Mật khẩu không được để trống";
      } else if (formData.password.length < 6) {
        newErrors.password = "Mật khẩu phải từ 6 ký tự";
      }
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Số điện thoại không được để trống";
    } else if (!/^\d{10,11}$/.test(formData.phone.trim())) {
      newErrors.phone = "Số điện thoại phải có 10-11 chữ số";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOpenModal = (user = null) => {
    setErrors({});
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        password: "",
        phone: user.phone || "",
        role_id: user.role_id,
        status: user.status,
        avatar: user.avatar || "",
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        role_id: 3,
        status: "hoat_dong",
        avatar: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitLoading(true);
    try {
      if (editingUser) {
        await userAPI.update(editingUser.id, formData);
        toast.success("Cập nhật tài khoản thành công!");
      } else {
        await userAPI.create(formData);
        toast.success("Tạo tài khoản thành công! (Tự động xác thực)");
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      const msg = err.response?.data?.message || "Đã có lỗi xảy ra.";
      toast.error(msg);
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa tài khoản này?")) {
      try {
        await userAPI.delete(id);
        toast.success("Xóa tài khoản thành công!");
        fetchUsers();
      } catch (err) {
        toast.error("Lỗi khi xóa tài khoản");
      }
    }
  };

  const statusOptions = [
    { value: "hoat_dong", label: "Hoạt động" },
    { value: "bi_khoa", label: "Bị khóa" },
  ];

  const filteredUsers = useMemo(() => {
    if (!debouncedSearch.trim()) return users;
    const q = debouncedSearch.toLowerCase().trim();
    return users.filter(
      (u) =>
        String(u.id).includes(q) ||
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.phone?.includes(q),
    );
  }, [users, debouncedSearch]);

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
            Quản lý Tài khoản
          </h2>
          <p className="text-gray-500 text-sm">
            Quản lý phân quyền và trạng thái người dùng
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 flex items-center gap-2"
        >
          <span className="text-xl">+</span> Thêm tài khoản
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <input
          type="text"
          placeholder="Tìm mã, tên, email, SĐT..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-xl w-full max-w-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                <th className="px-6 py-4 font-semibold">Người dùng</th>
                <th className="px-6 py-4 font-semibold">Liên hệ</th>
                <th className="px-6 py-4 font-semibold">Vai trò</th>
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
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    Không có tài khoản khớp bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-indigo-50/30 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        {u.avatar ? (
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="w-10 h-10 rounded-full object-cover border border-indigo-100"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                            {u.name?.charAt(0) || "U"}
                          </div>
                        )}
                        <p className="font-bold text-gray-900">{u.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900 font-medium">{u.email}</p>
                      <p className="text-gray-500 text-xs">{u.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          u.role_id === 1
                            ? "bg-red-100 text-red-600"
                            : [2, 4, 5, 6, 7, 8].includes(u.role_id)
                              ? "bg-blue-100 text-blue-600"
                              : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {u.role_name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          u.status === "hoat_dong"
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {u.status === "hoat_dong" ? "Hoạt động" : "Bị khóa"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {u.role_id !== 1 && (
                        <>
                          <button
                            onClick={() => handleOpenModal(u)}
                            className="text-indigo-600 hover:text-indigo-900 font-bold mr-4"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDelete(u.id)}
                            className="text-red-600 hover:text-red-900 font-bold"
                          >
                            Xóa
                          </button>
                        </>
                      )}
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
        title={editingUser ? "Cập nhật tài khoản" : "Thêm tài khoản mới"}
        onSubmit={handleSubmit}
        isLoading={isSubmitLoading}
      >
        <FormInput
          label="Họ và tên"
          id="name"
          placeholder="Nguyễn Văn A"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
        />
        <FormInput
          label="Email"
          id="email"
          type="email"
          placeholder="example@gmail.com"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          error={errors.email}
        />
        {!editingUser && (
          <FormInput
            label="Mật khẩu"
            id="password"
            type="password"
            placeholder="Min 6 characters"
            required
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            error={errors.password}
          />
        )}
        <FormInput
          label="Số điện thoại"
          id="phone"
          placeholder="0123456789"
          required
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          error={errors.phone}
        />
        <FormInput
          label="Link ảnh đại diện"
          id="avatar"
          placeholder="https://example.com/avatar.jpg"
          value={formData.avatar}
          onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormSelect
            label="Vai trò"
            id="role_id"
            options={roleOptions}
            value={formData.role_id}
            // Ép kiểu về Number để khớp với kiểu dữ liệu của ID vai trò
            onChange={(e) =>
              setFormData({ ...formData, role_id: Number(e.target.value) })
            }
          />
          <FormSelect
            label="Trạng thái"
            id="status"
            options={statusOptions}
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value })
            }
          />
        </div>
      </AdminModal>
    </div>
  );
};

export default UserManagement;
