import React, { useState, useEffect, useMemo } from "react";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { serviceAPI } from "../../services/apiClient";
import toast from "react-hot-toast";
import AdminModal, {
  FormInput,
  FormSelect,
  FormTextarea,
} from "../../components/AdminModal";

const Services = () => {
  const [services, setServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebouncedValue(searchTerm, 350);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = [1, 4].includes(Number(user.role_id));

  const [formData, setFormData] = useState({
    name: "",
    loai_id: 1,
    gia: 0,
    mo_ta: "",
    thoi_gian: "60 Phút",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setIsLoading(true);
      const response = await serviceAPI.getAll();
      if (response?.data?.success) {
        setServices(response.data.data);
      } else if (Array.isArray(response?.data)) {
        setServices(response.data);
      }
    } catch (error) {
      toast.error("Lỗi khi tải dịch vụ.");
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.name.trim())
      newErrors.name = "Tên dịch vụ không được để trống";
    if (formData.gia <= 0) newErrors.gia = "Giá dịch vụ phải lớn hơn 0";
    if (!formData.mo_ta.trim()) newErrors.mo_ta = "Mô tả không được để trống";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOpenModal = (service = null) => {
    setErrors({});
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        loai_id: service.loai_id,
        gia: service.gia,
        mo_ta: service.mo_ta || "",
        thoi_gian: service.thoi_gian || "60 Phút",
      });
    } else {
      setEditingService(null);
      setFormData({
        name: "",
        loai_id: 1,
        gia: 0,
        mo_ta: "",
        thoi_gian: "60 Phút",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitLoading(true);
    try {
      if (editingService) {
        await serviceAPI.update(editingService.id, formData);
        toast.success("Cập nhật dịch vụ thành công!");
      } else {
        await serviceAPI.create(formData);
        toast.success("Thêm dịch vụ thành công!");
      }
      setIsModalOpen(false);
      fetchServices();
    } catch (error) {
      const msg = error.response?.data?.message || "Đã có lỗi xảy ra.";
      toast.error(msg);
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa dịch vụ này?")) {
      try {
        await serviceAPI.delete(id);
        toast.success("Xóa thành công!");
        fetchServices();
      } catch (error) {
        toast.error("Lỗi khi xóa dịch vụ.");
      }
    }
  };

  const filteredServices = useMemo(() => {
    if (!debouncedSearch.trim()) return services;
    const q = debouncedSearch.toLowerCase().trim();
    return services.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        String(s.id).includes(q) ||
        (s.mo_ta && s.mo_ta.toLowerCase().includes(q)),
    );
  }, [services, debouncedSearch]);

  const loaiOptions = [
    { value: 1, label: "Chăm sóc Bé" },
    { value: 2, label: "Chăm sóc Mẹ" },
    { value: 3, label: "Dưỡng sinh & Trị liệu" },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Quản lý dịch vụ</h2>
          <p className="text-gray-500 text-sm">
            Danh sách dịch vụ chăm sóc sức khỏe mẹ và bé
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => handleOpenModal()}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 flex items-center gap-2"
          >
            <span className="text-xl">+</span> Thêm dịch vụ
          </button>
        )}
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <input
          type="text"
          placeholder="Tìm theo tên dịch vụ, mã, mô tả..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-xl w-full max-w-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="col-span-full py-16 text-center text-gray-500 border border-dashed border-gray-200 rounded-2xl">
            Không có dịch vụ khớp từ khóa.
          </div>
        ) : (
          filteredServices.map((service) => (
            <div
              key={service.id}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-2xl">
                  {service.loai_id === 1
                    ? "👶"
                    : service.loai_id === 2
                      ? "🤰"
                      : "✨"}
                </div>
                {isAdmin && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenModal(service)}
                      className="p-2 text-gray-400 hover:text-indigo-600 transition"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {service.name}
              </h3>
              <p className="text-indigo-600 font-bold text-xl mb-3">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(service.gia)}
                <span className="text-gray-400 text-sm font-normal ml-2">
                  / {service.thoi_gian || "60 Phút"}
                </span>
              </p>
              <div className="bg-gray-50 p-4 rounded-2xl mb-4">
                <p className="text-xs font-bold text-gray-400 uppercase mb-2">
                  Chi tiết dịch vụ
                </p>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                  {service.mo_ta || "Chưa có mô tả cho dịch vụ này."}
                </p>
              </div>
              <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">
                  {loaiOptions.find((o) => o.value === service.loai_id)
                    ?.label || "Dịch vụ"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingService ? "Cập nhật dịch vụ" : "Thêm dịch vụ mới"}
        onSubmit={handleSubmit}
        isLoading={isSubmitLoading}
        size="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Tên dịch vụ/gói"
            id="name"
            placeholder="Gói chăm sóc 30 ngày..."
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={errors.name}
          />
          <FormSelect
            label="Loại dịch vụ"
            id="loai_id"
            options={loaiOptions}
            value={formData.loai_id}
            onChange={(e) =>
              setFormData({ ...formData, loai_id: parseInt(e.target.value) })
            }
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Giá dịch vụ (VNĐ)"
            id="gia"
            type="number"
            placeholder="5000000"
            required
            value={formData.gia}
            onChange={(e) => setFormData({ ...formData, gia: e.target.value })}
            error={errors.gia}
          />
          <FormInput
            label="Thời gian (ví dụ: 60 Phút)"
            id="thoi_gian"
            placeholder="60 Phút"
            required
            value={formData.thoi_gian}
            onChange={(e) =>
              setFormData({ ...formData, thoi_gian: e.target.value })
            }
          />
        </div>
        <FormTextarea
          label="Mô tả chi tiết"
          id="mo_ta"
          placeholder="Nhập mô tả về các đầu mục công việc trong gói..."
          required
          value={formData.mo_ta}
          onChange={(e) => setFormData({ ...formData, mo_ta: e.target.value })}
          error={errors.mo_ta}
          rows={5}
        />
      </AdminModal>
    </div>
  );
};

export default Services;
