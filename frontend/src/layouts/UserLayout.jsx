import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

const UserLayout = () => {
  return (
    <div className="font-sans text-gray-800 flex flex-col min-h-screen">
      <Header />
      {/* Nội dung các trang sẽ thay đổi tại Outlet */}
      <main className="grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default UserLayout;
