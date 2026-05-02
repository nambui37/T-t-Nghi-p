import React, { useState, useEffect } from "react";
import { cmsAPI } from "../../services/apiClient";

const Handbook = () => {
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    "Tất cả",
    "Chăm sóc bé",
    "Dinh dưỡng",
    "Sức khỏe mẹ",
    "Tâm lý",
  ];

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setIsLoading(true);
      const res = await cmsAPI.getArticles();
      // Hỗ trợ cả 2 trường hợp backend trả về object { success, data } hoặc trả về thẳng mảng
      if (res.data?.success) {
        setArticles(res.data.data || []);
      } else if (Array.isArray(res.data)) {
        setArticles(res.data);
      }
    } catch (error) {
      console.error("Lỗi tải cẩm nang:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const openArticle = (article) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeArticle = () => {
    setIsModalOpen(false);
    setSelectedArticle(null);
    document.body.style.overflow = "unset";
  };

  const filteredArticles = articles.filter((a) => {
    const matchCategory =
      activeCategory === "Tất cả" || a.category === activeCategory;
    const matchSearch =
      (a.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.summary || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Article Detail Modal */}
      {isModalOpen && selectedArticle && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeArticle}
          ></div>
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] overflow-hidden relative z-10 flex flex-col animate-in fade-in zoom-in duration-300">
            <button
              onClick={closeArticle}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md text-white flex items-center justify-center transition-all z-20"
            >
              ✕
            </button>

            <div className="overflow-y-auto flex-1 custom-scrollbar">
              <div className="relative h-64 sm:h-96">
                <img
                  src={selectedArticle.image_url}
                  alt={selectedArticle.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 sm:p-12">
                  <span className="text-pink-400 font-bold text-sm uppercase mb-3 whitespace-nowrap">
                    {selectedArticle.category}
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-bold text-white leading-tight">
                    {selectedArticle.title}
                  </h2>
                </div>
              </div>

              <div className="p-8 sm:p-12">
                <div className="flex flex-wrap items-center gap-6 mb-8 py-6 border-y border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold text-lg">
                      {selectedArticle.author?.charAt(0) || "T"}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {selectedArticle.author}
                      </p>
                      <p className="text-xs text-gray-500">
                        Tác giả chuyên gia
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    <span className="mr-4">
                      📅{" "}
                      {selectedArticle.created_at
                        ? new Date(
                            selectedArticle.created_at,
                          ).toLocaleDateString("vi-VN")
                        : "Mới đây"}
                    </span>
                    <span>
                      ⏱️{" "}
                      {selectedArticle.read_time ||
                        selectedArticle.readTime ||
                        "5 phút đọc"}
                    </span>
                  </div>
                </div>

                <div
                  className="prose prose-pink max-w-none text-gray-600 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
                ></div>

                <div className="mt-12 p-8 bg-pink-50 rounded-3xl border border-pink-100">
                  <h4 className="font-bold text-pink-900 mb-2">
                    Lời khuyên từ Mom&Baby
                  </h4>
                  <p className="text-pink-800 text-sm italic">
                    "Mỗi bé là một cá thể duy nhất, những kiến thức trên mang
                    tính chất tham khảo. Mẹ hãy luôn lắng nghe cơ thể mình và
                    quan sát biểu hiện của bé để có cách chăm sóc phù hợp nhất
                    nhé!"
                  </p>
                </div>

                <div className="mt-6 text-center">
                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(selectedArticle.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-100 transition-colors"
                  >
                    <span className="text-xl">🔍</span> Tìm đọc thêm trên Google
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <section className="bg-white border-b border-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Cẩm Nang <span className="text-pink-500">Mẹ & Bé</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Kho tàng kiến thức y khoa và kinh nghiệm thực tế được chia sẻ bởi
            đội ngũ chuyên gia hàng đầu tại Mom&Baby.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Category Filter */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2 rounded-full font-bold transition-all whitespace-nowrap ${
                  activeCategory === cat
                    ? "bg-pink-500 text-white shadow-lg shadow-pink-200"
                    : "bg-white text-gray-500 hover:bg-pink-50 hover:text-pink-500 border border-gray-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm bài viết..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-pink-100 focus:border-pink-500 transition-all"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
          </div>
        </div>

        {/* Featured Article (Hero-like) */}
        {!isLoading &&
          filteredArticles.length > 0 &&
          activeCategory === "Tất cả" &&
          !searchQuery && (
            <div
              className="mb-16 group cursor-pointer"
              onClick={() => openArticle(articles[0])}
            >
              <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col lg:flex-row">
                <div className="lg:w-3/5 relative overflow-hidden">
                  <img
                    src={articles[0].image_url}
                    alt={articles[0].title}
                    className="w-full h-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-6 left-6">
                    <span className="px-4 py-1.5 bg-pink-500 text-white text-xs font-bold rounded-full uppercase tracking-widest">
                      Nổi bật
                    </span>
                  </div>
                </div>
                <div className="lg:w-2/5 p-8 md:p-12 flex flex-col justify-center">
                  <span className="text-indigo-600 font-bold text-sm uppercase mb-4 whitespace-nowrap">
                    {articles[0].category}
                  </span>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6 group-hover:text-pink-500 transition">
                    {articles[0].title}
                  </h2>
                  <p className="text-gray-600 mb-8 leading-relaxed">
                    {articles[0].summary}
                  </p>
                  <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold">
                        {articles[0].author?.charAt(0) || "T"}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          {articles[0].author}
                        </p>
                        <p className="text-xs text-gray-500">
                          {articles[0].created_at
                            ? new Date(
                                articles[0].created_at,
                              ).toLocaleDateString("vi-VN")
                            : "Mới đây"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <a
                        href={`https://www.google.com/search?q=${encodeURIComponent(articles[0].title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-blue-500 hover:text-blue-600 text-xl hover:scale-110 transition-transform"
                        title="Tìm bài viết này trên Google"
                      >
                        🔍
                      </a>
                      <span className="text-pink-500 font-bold text-sm">
                        Đọc bài viết →
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        {/* Article Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            <div className="col-span-full py-20 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
              <p className="text-gray-400">
                Chưa có bài viết nào trong danh mục này.
              </p>
            </div>
          ) : (
            filteredArticles
              .slice(activeCategory === "Tất cả" && !searchQuery ? 1 : 0)
              .map((article) => (
                <div
                  key={article.id}
                  onClick={() => openArticle(article)}
                  className="group bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-pink-100/30 transition-all duration-500 flex flex-col cursor-pointer"
                >
                  <div className="h-56 relative overflow-hidden">
                    <img
                      src={article.image_url}
                      alt={article.title}
                      className="w-full h-full object-cover transition duration-700 group-hover:scale-110"
                    />
                    <div className="absolute bottom-4 left-4">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-pink-600 text-[10px] font-bold rounded-full uppercase tracking-wider whitespace-nowrap">
                        {article.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                      <span>
                        📅{" "}
                        {article.created_at
                          ? new Date(article.created_at).toLocaleDateString(
                              "vi-VN",
                            )
                          : "Mới đây"}
                      </span>
                      <span>
                        ⏱️{" "}
                        {article.read_time || article.readTime || "5 phút đọc"}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-pink-500 transition line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-6 line-clamp-3 leading-relaxed">
                      {article.summary}
                    </p>
                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
                      <span className="text-xs font-bold text-gray-400">
                        Bởi {article.author}
                      </span>
                      <div className="flex items-center gap-3">
                        <a
                          href={`https://www.google.com/search?q=${encodeURIComponent(article.title)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-blue-500 hover:text-blue-600 transition-transform hover:scale-110"
                          title="Tìm bài viết này trên Google"
                        >
                          🔍
                        </a>
                        <button className="text-pink-500 font-bold text-sm hover:translate-x-1 transition-transform flex items-center gap-1">
                          Đọc thêm <span>→</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>

        {/* Newsletter / Subscription */}
        <section className="mt-20 bg-indigo-600 rounded-[3rem] p-8 md:p-16 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-pink-500/20 rounded-full blur-3xl"></div>

          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-4">
              Nhận kiến thức hữu ích hàng tuần
            </h2>
            <p className="text-indigo-100 mb-10">
              Đăng ký để nhận những bài viết mới nhất về chăm sóc mẹ và bé từ
              các chuyên gia.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Email của bạn..."
                className="flex-1 px-6 py-4 rounded-2xl bg-white border-none focus:ring-4 focus:ring-white/20 outline-none"
              />
              <button className="px-8 py-4 bg-pink-500 text-white font-bold rounded-2xl hover:bg-pink-600 shadow-xl shadow-pink-500/30 transition-all">
                Đăng ký ngay
              </button>
            </div>
            <p className="text-indigo-200 text-xs mt-4">
              Chúng tôi cam kết không gửi thư rác.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Handbook;

// Thêm CSS tùy chỉnh cho nội dung bài viết
const style = document.createElement("style");
style.innerHTML = `
  .prose h3 {
    color: #111827;
    font-weight: 700;
    font-size: 1.25rem;
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;
  }
  .prose p {
    margin-bottom: 1rem;
    line-height: 1.75;
  }
  .prose ul {
    list-style-type: disc;
    padding-left: 1.5rem;
    margin-bottom: 1rem;
  }
  .prose li {
    margin-bottom: 0.5rem;
  }
  .prose strong {
    color: #be185d;
    font-weight: 600;
  }
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #fbcfe8;
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #f9a8d4;
  }
`;
document.head.appendChild(style);
