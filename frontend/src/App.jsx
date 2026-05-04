import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";
import { Toaster } from "react-hot-toast";
import HomePage from "./pages/user/Home";
import Services from "./pages/user/Services";
import Packages from "./pages/user/Packages";
import Team from "./pages/user/Team";
import Handbook from "./pages/user/Handbook";
import ServiceDetail from "./pages/user/ServiceDetail";
import UserLayout from "./layouts/UserLayout";
import Login from "./pages/user/Login";
import Register from "./pages/user/Register";
import ForgotPassword from "./pages/user/ForgotPassword";
import VerifyAccount from "./pages/user/VerifyAccount";
import Booking from "./pages/user/Booking";
import Profile from "./pages/user/Profile";
import Payment from "./pages/user/Payment";
import AdminLayout from "./layouts/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Appointments from "./pages/admin/Appointments";
import Customers from "./pages/admin/Customers";
import AdminServices from "./pages/admin/Services";
import Revenue from "./pages/admin/Revenue";
import EmployeeManagement from "./pages/admin/EmployeeManagement";
import UserManagement from "./pages/admin/UserManagement";
import HealthRecordManagement from "./pages/admin/HealthRecordManagement";
import EmployeeShifts from "./pages/admin/EmployeeShifts";
import ArticleManagement from "./pages/admin/ArticleManagement";
import ReviewManagement from "./pages/admin/ReviewManagement";
import IncidentManagement from "./pages/admin/IncidentManagement";
import ResetPassword from "./pages/user/ResetPassword";
import ChatWindow from "./components/ChatWindow";
import AIChatbot from "./components/AIChatbot";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Component bảo vệ Route yêu cầu đăng nhập
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Nếu có yêu cầu role cụ thể
  if (allowedRoles.length > 0 && !allowedRoles.includes(Number(user.role_id))) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" reverseOrder={false} />
        <div className="App">
          <ChatWindow />
          <AIChatbot />
          <Routes>
            {/* Các trang CÓ Header/Footer (được bọc bởi UserLayout) */}
            <Route element={<UserLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/dich-vu" element={<Services />} />
              <Route path="/dich-vu/:id" element={<ServiceDetail />} />
              <Route path="/doi-ngu" element={<Team />} />
              <Route path="/cam-nang" element={<Handbook />} />

              {/* Các trang yêu cầu đăng nhập hoặc có thể truy cập tự do */}
              <Route path="/dat-lich" element={<Booking />} />
              <Route
                path="/ho-so"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/payment/:id"
                element={
                  <ProtectedRoute>
                    <Payment />
                  </ProtectedRoute>
                }
              />

              {/* Các trang Form xác thực giờ đã có Header/Footer */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/verify-account" element={<VerifyAccount />} />
              <Route path="/reset-password" element={<ResetPassword />} />
            </Route>

            {/* Các trang ADMIN (được bọc bởi AdminLayout) */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route
                index
                element={
                  <ProtectedRoute allowedRoles={[1, 2, 4, 5, 6, 7, 8]}>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="lich-hen"
                element={
                  <ProtectedRoute allowedRoles={[1, 2, 4, 5, 6, 7, 8]}>
                    <Appointments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="khach-hang"
                element={
                  <ProtectedRoute allowedRoles={[1, 4]}>
                    <Customers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="dich-vu"
                element={
                  <ProtectedRoute allowedRoles={[1, 2, 4, 5, 6, 7, 8]}>
                    <AdminServices />
                  </ProtectedRoute>
                }
              />
              <Route
                path="doanh-thu"
                element={
                  <ProtectedRoute allowedRoles={[1, 4]}>
                    <Revenue />
                  </ProtectedRoute>
                }
              />
              <Route
                path="nhan-vien"
                element={
                  <ProtectedRoute allowedRoles={[1, 4]}>
                    <EmployeeManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="tai-khoan"
                element={
                  <ProtectedRoute allowedRoles={[1, 4]}>
                    <UserManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="ho-so-cham-soc"
                element={
                  <ProtectedRoute allowedRoles={[1, 2, 4, 5, 6, 7, 8]}>
                    <HealthRecordManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="ca-lam"
                element={
                  <ProtectedRoute allowedRoles={[2, 5, 6, 7, 8]}>
                    <EmployeeShifts />
                  </ProtectedRoute>
                }
              />
              <Route
                path="bai-viet"
                element={
                  <ProtectedRoute allowedRoles={[1, 4]}>
                    <ArticleManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="danh-gia"
                element={
                  <ProtectedRoute allowedRoles={[1, 4]}>
                    <ReviewManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="su-co"
                element={
                  <ProtectedRoute allowedRoles={[1, 4]}>
                    <IncidentManagement />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
