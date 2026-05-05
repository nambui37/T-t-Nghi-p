import axios from "axios";

// Tự động xác định baseURL dựa trên host hiện tại nếu VITE_API_URL trỏ đến IP cụ thể
const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) return "http://localhost:5001/api";

  const currentHostname = window.location.hostname;
  // Nếu đang truy cập bằng localhost nhưng API lại trỏ vào IP, đổi lại thành localhost để đồng bộ Cookie/CORS
  if (currentHostname === "localhost" || currentHostname === "127.0.0.1") {
    return envUrl.replace(/192\.168\.1\.\d+/g, "localhost");
  }
  return envUrl;
};

// Khởi tạo một instance của axios với các cấu hình mặc định
const apiClient = axios.create({
  baseURL: getBaseURL(), 
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // Ngắt kết nối nếu request quá 10 giây
  withCredentials: true, // Bắt buộc: Cho phép axios tự động đính kèm HttpOnly Cookie vào request
});

// Interceptor gắn Token thủ công (Dự phòng cho trường hợp Cookie bị block do CORS/khác IP)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && token !== "null" && token !== "undefined") {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor chặn response để xử lý lỗi tự động toàn cục
apiClient.interceptors.response.use(
  (response) => {
    // Xóa bộ nhớ cục bộ ngay khi gọi API đăng xuất thành công
    if (response.config.url && response.config.url.includes("/auth/logout")) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
    // Nếu response thành công, trả về bình thường
    return response;
  },
  (error) => {
    // Bắt lỗi 401 Unauthorized (Cookie hết hạn hoặc không hợp lệ)
    if (error.response && error.response.status === 401) {
      // CỰC KỲ QUAN TRỌNG: Xóa rác localStorage để tránh trang Login tự động chuyển hướng ngược lại gây lặp vô hạn
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      
      const url = error.config.url;
      
      // Bỏ qua tự động redirect cho API lấy thông tin profile (để không ép khách vãng lai trang chủ phải đăng nhập)
      if (url && !url.includes('/auth/profile') && !url.includes('/auth/login')) {
        const currentPath = window.location.pathname;
        const publicPaths = ['/login', '/register', '/verify-account', '/forgot-password', '/reset-password'];
        
        if (!publicPaths.includes(currentPath)) {
          window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
        }
      }
    }
    return Promise.reject(error);
  }
);

// ==============================================
// ĐỊNH NGHĨA TOÀN BỘ API CỦA DỰ ÁN Ở ĐÂY
// ==============================================

// 1. Dịch vụ (Services)
export const serviceAPI = {
  getAll: () => apiClient.get("/services"),
  getById: (id) => apiClient.get(`/services/${id}`),
  create: (data) => apiClient.post("/services", data),
  update: (id, data) => apiClient.put(`/services/${id}`, data),
  delete: (id) => apiClient.delete(`/services/${id}`),
};

// 2. Nhân viên (Employees)
export const employeeAPI = {
  getAll: () => apiClient.get("/employees"),
  getSalaries: () => apiClient.get("/employees/salaries"),
  getById: (id) => apiClient.get(`/employees/${id}`),
  create: (data) => apiClient.post("/employees", data),
  update: (id, data) => apiClient.put(`/employees/${id}`, data),
  delete: (id) => apiClient.delete(`/employees/${id}`),
};

// 3. Lịch hẹn (Appointments)
export const appointmentAPI = {
  getAll: (params) => apiClient.get("/appointments", { params }),
  create: (data) => apiClient.post("/appointments", data),
  updateStatus: (id, status, extraData = {}) => apiClient.put(`/appointments/${id}/status`, { status, ...extraData }),
  assignEmployee: (id, employeeId) => apiClient.put(`/appointments/${id}/assign`, { nhan_vien_id: employeeId }),
  cancel: (id) => apiClient.put(`/appointments/${id}/cancel`),
  delete: (id) => apiClient.delete(`/appointments/${id}`),
};

// 4. Xác thực (Authentication)
export const authAPI = {
  register: (data) => apiClient.post("/auth/register", data),
  verifyOTP: (data) => apiClient.post("/auth/verify-otp", data),
  login: (data) => apiClient.post("/auth/login", data),
  getProfile: () => apiClient.get("/auth/profile"),
  forgotPassword: (data) => apiClient.post("/auth/forgot-password", data),
  resetPassword: (data) => apiClient.post("/auth/reset-password", data),
  resendOTP: (email) => apiClient.post("/auth/resend-otp", { email }),
  logout: () => apiClient.post("/auth/logout"),
  changePassword: (data) => apiClient.post("/auth/change-password", data),
  updateAvatar: (formData) =>
    apiClient.post("/auth/update-avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  updateProfile: (data) => apiClient.put("/auth/profile", data),
};

// 5. Thống kê (Stats)
export const statsAPI = {
  getDashboard: () => apiClient.get("/services/dashboard/stats"),
  getRevenue: () => apiClient.get("/services/revenue/stats"),
};

// 6. Người dùng (Users)
export const userAPI = {
  getRoles: () => apiClient.get("/users/roles"),
  getCustomers: () => apiClient.get("/users/customers"),
  getAll: () => apiClient.get("/users"),
  create: (data) => apiClient.post("/users", data),
  update: (id, data) => apiClient.put(`/users/${id}`, data),
  delete: (id) => apiClient.delete(`/users/${id}`),
  updateStatus: (id, status) => apiClient.put(`/users/${id}/status`, { status }),
};

// 7. Ca làm việc (Shifts)
export const shiftAPI = {
  getUpcoming: (params) => apiClient.get("/shifts/upcoming", { params }),
  getAvailable: () => apiClient.get("/shifts/available"),
  accept: (lichHenId) => apiClient.post("/shifts/accept", { lichHenId }),
  checkIn: (data) => apiClient.post("/shifts/check-in", data),
  startService: (data) => apiClient.post("/shifts/start-service", data),
  checkOut: (data) => apiClient.post("/shifts/check-out", data),
};

// 8. Hồ sơ sức khỏe (Health Records) - Bảng cũ
export const healthRecordAPI = {
  getAll: () => apiClient.get("/health-records"),
  getById: (id) => apiClient.get(`/health-records/${id}`),
  create: (data) => apiClient.post("/health-records", data),
  update: (id, data) => apiClient.put(`/health-records/${id}`, data),
  delete: (id) => apiClient.delete(`/health-records/${id}`),
};

// 13. Nhật ký chăm sóc (Care Records) - Bảng mới cho workflow
export const careRecordAPI = {
  getByAppointment: (appointmentId) => apiClient.get(`/care-records/${appointmentId}`),
  create: (data) => apiClient.post("/care-records", data),
  update: (id, data) => apiClient.put(`/care-records/${id}`, data),
};

// 14. Sự cố (Incidents)
export const incidentAPI = {
  getAll: () => apiClient.get("/incidents"),
  report: (data) => apiClient.post("/incidents/report", data),
  handle: (id, data) => apiClient.put(`/incidents/${id}/handle`, data),
};

// 9. Thông báo (Notifications)
export const notificationAPI = {
  getAll: () => apiClient.get("/notifications"),
  markAsRead: (id) => apiClient.put(`/notifications/${id}/read`),
};


// 9. Chatbot AI
export const chatbotAPI = {
  chat: (message) => apiClient.post("/chatbot", { message }),
};

// 10. Thanh toán (Payment)
export const paymentAPI = {
  createVNPayPayment: (data) => apiClient.post("/payment/vnpay", data),
};

// 11. CMS (Content Management System)
export const cmsAPI = {
  getArticles: () => apiClient.get("/cms/articles"),
  createArticle: (data) => apiClient.post("/cms/articles", data),
  updateArticle: (id, data) => apiClient.put(`/cms/articles/${id}`, data),
  deleteArticle: (id) => apiClient.delete(`/cms/articles/${id}`),
  
  getTeam: () => apiClient.get("/cms/team"),
  createTeamMember: (data) => apiClient.post("/cms/team", data),
  updateTeamMember: (id, data) => apiClient.put(`/cms/team/${id}`, data),
  deleteTeamMember: (id) => apiClient.delete(`/cms/team/${id}`),
};

// 12. Đánh giá (Reviews)
export const reviewAPI = {
  create: (data) => apiClient.post("/reviews", data),
  getByService: (goiId) => apiClient.get(`/reviews/service/${goiId}`),
  getAll: () => apiClient.get("/reviews/all"),
  delete: (id) => apiClient.delete(`/reviews/${id}`),
};

// 15. Chat
export const chatAPI = {
  getHistory: (room) => apiClient.get(`/chat/history/${room}`),
};