import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import HomePage from "./pages/user/Home";
import Services from "./pages/user/Services";
import Packages from "./pages/user/Packages";
import Team from "./pages/user/Team";
import Handbook from "./pages/user/Handbook";
import UserLayout from "./layouts/UserLayout";
import Login from "./pages/user/Login";
import Register from "./pages/user/Register";
import ForgotPassword from "./pages/user/ForgotPassword";
import VerifyAccount from "./pages/user/VerifyAccount";
import Booking from "./pages/user/Booking";
import Profile from "./pages/user/Profile";
import AdminLayout from "./layouts/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Appointments from "./pages/admin/Appointments";
import Customers from "./pages/admin/Customers";
import AdminServices from "./pages/admin/Services";
import Revenue from "./pages/admin/Revenue";
import EmployeeManagement from "./pages/admin/EmployeeManagement";
import SalaryManagement from "./pages/admin/SalaryManagement";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Các trang CÓ Header/Footer (được bọc bởi UserLayout) */}
          <Route element={<UserLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/dich-vu" element={<Services />} />
            <Route path="/goi-dich-vu" element={<Packages />} />
            <Route path="/doi-ngu" element={<Team />} />
            <Route path="/cam-nang" element={<Handbook />} />
            <Route path="/dat-lich" element={<Booking />} />
            <Route path="/ho-so" element={<Profile />} />

            {/* Các trang Form xác thực giờ đã có Header/Footer */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-account" element={<VerifyAccount />} />
          </Route>

          {/* Các trang ADMIN (được bọc bởi AdminLayout) */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="lich-hen" element={<Appointments />} />
            <Route path="khach-hang" element={<Customers />} />
            <Route path="dich-vu" element={<AdminServices />} />
            <Route path="doanh-thu" element={<Revenue />} />
            <Route path="nhan-vien" element={<EmployeeManagement />} />
            <Route path="luong" element={<SalaryManagement />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
