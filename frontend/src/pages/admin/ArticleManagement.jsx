import React, { useState, useEffect } from "react";
import { cmsAPI } from "../../services/apiClient";
import toast from "react-hot-toast";
import AdminModal, {
  FormInput,
  FormSelect,
  FormTextarea,
} from "../../components/AdminModal";

const ArticleManagement = () => {
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    content: "",
    category: "Chăm sóc bé",
    author: "",
    read_time: "5 phút đọc",
    image_url: "",
  });

  const [errors, setErrors] = useState({});

  const categories = [
    { value: "Chăm sóc bé", label: "Chăm sóc bé" },
    { value: "Dinh dưỡng", label: "Dinh dưỡng" },
    { value: "Sức khỏe mẹ", label: "Sức khỏe mẹ" },
    { value: "Tâm lý", label: "Tâm lý" },
  ];

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setIsLoading(true);
      const response = await cmsAPI.getArticles();
      if (response?.data?.success) {
        setArticles(response.data.data);
      }
    } catch (error) {
      toast.error("Lỗi khi tải danh sách bài viết.");
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Tiêu đề không được để trống";
    if (!formData.summary.trim()) newErrors.summary = "Tóm tắt không được để trống";
    if (!formData.content.trim()) newErrors.content = "Nội dung không được để trống";
    if (!formData.author.trim()) newErrors.author = "Tác giả không được để trống";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOpenModal = (article = null) => {
    setErrors({});
    if (article) {
      setEditingArticle(article);
      setFormData({
        title: article.title,
        summary: article.summary,
        content: article.content,
        category: article.category,
        author: article.author,
        read_time: article.readTime || article.read_time || "5 phút đọc",
        image_url: article.image_url || "",
      });
    } else {
      setEditingArticle(null);
      setFormData({
        title: "",
        summary: "",
        content: "",
        category: "Chăm sóc bé",
        author: "",
        read_time: "5 phút đọc",
        image_url: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitLoading(true);
    try {
      if (editingArticle) {
        await cmsAPI.updateArticle(editingArticle.id, formData);
        toast.success("Cập nhật bài viết thành công!");
      } else {
        await cmsAPI.createArticle(formData);
        toast.success("Thêm bài viết thành công!");
      }
      setIsModalOpen(false);
      fetchArticles();
    } catch (error) {
      toast.error(error.response?.data?.message || "Đã có lỗi xảy ra.");
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bài viết này?")) {
      try {
        await cmsAPI.deleteArticle(id);
        toast.success("Xóa bài viết thành công!");
        fetchArticles();
      } catch (error) {
        toast.error("Lỗi khi xóa bài viết.");
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Quản lý Cẩm nang</h2>
          <p className="text-gray-500 text-sm">Quản lý các bài viết kiến thức mẹ và bé</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 flex items-center gap-2"
        >
          <span className="text-xl">+</span> Viết bài mới
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Bài viết</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Chuyên mục</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Tác giả</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  </td>
                </tr>
              ) : articles.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-gray-400">Chưa có bài viết nào.</td>
                </tr>
              ) : (
                articles.map((article) => (
                  <tr key={article.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img 
                          src={article.image_url || "https://placehold.co/400x250?text=No+Image"} 
                          alt="" 
                          className="w-16 h-10 object-cover rounded-lg shadow-sm"
                        />
                        <div>
                          <p className="font-bold text-gray-900 line-clamp-1">{article.title}</p>
                          <p className="text-xs text-gray-500 line-clamp-1">{article.summary}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold">
                        {article.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700">{article.author}</p>
                      <p className="text-[10px] text-gray-400">
                        {article.created_at ? new Date(article.created_at).toLocaleDateString('vi-VN') : 'Mới đây'}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(article)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="Sửa"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(article.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Xóa"
                        >
                          🗑️
                        </button>
                      </div>
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
        title={editingArticle ? "Cập nhật bài viết" : "Viết bài mới"}
        onSubmit={handleSubmit}
        isLoading={isSubmitLoading}
        size="2xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Tiêu đề bài viết"
            id="title"
            placeholder="Hướng dẫn tắm bé..."
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            error={errors.title}
          />
          <FormSelect
            label="Chuyên mục"
            id="category"
            options={categories}
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Tác giả"
            id="author"
            placeholder="BS. Nguyễn Văn A"
            required
            value={formData.author}
            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            error={errors.author}
          />
          <FormInput
            label="Thời gian đọc (vd: 5 phút đọc)"
            id="read_time"
            placeholder="5 phút đọc"
            value={formData.read_time}
            onChange={(e) => setFormData({ ...formData, read_time: e.target.value })}
          />
        </div>

        <FormInput
          label="Link ảnh minh họa (URL)"
          id="image_url"
          placeholder="https://images.unsplash.com/..."
          value={formData.image_url}
          onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
        />

        <FormTextarea
          label="Tóm tắt ngắn gọn"
          id="summary"
          placeholder="Nhập tóm tắt hiển thị ở danh sách bài viết..."
          required
          value={formData.summary}
          onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
          error={errors.summary}
          rows={2}
        />

        <FormTextarea
          label="Nội dung bài viết (Hỗ trợ HTML cơ bản)"
          id="content"
          placeholder="<h3>1. Chuẩn bị...</h3><p>Nội dung chi tiết bài viết...</p>"
          required
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          error={errors.content}
          rows={10}
        />
      </AdminModal>
    </div>
  );
};

export default ArticleManagement;
