import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { appointmentAPI } from "../../services/apiClient";
import toast from "react-hot-toast";

const VNPayReturn = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const processPayment = async () => {
      const responseCode = searchParams.get("vnp_ResponseCode");
      const txnRef = searchParams.get("vnp_TxnRef");

      if (!txnRef) {
        setResult("error");
        setLoading(false);
        return;
      }

      // vnp_TxnRef thường có cấu trúc {id} hoặc {id}_{timestamp}
      const appointmentId = txnRef.split("_")[0];

      if (responseCode === "00") {
        // 00 là mã Thành Công của VNPay
        try {
          // Cập nhật trạng thái thanh toán (để trống status để không đè mất trạng thái cũ)
          await appointmentAPI.updateStatus(appointmentId, null, {
            trang_thai_thanh_toan: "da_coc_15",
          });

          setResult("success");
          toast.success("Thanh toán thành công!");
          sessionStorage.removeItem(`payment_pending_${appointmentId}`);
        } catch (error) {
          console.error("Lỗi cập nhật trạng thái:", error);
          setResult("error");
          toast.error("Lỗi khi ghi nhận thanh toán vào hệ thống.");
        }
      } else {
        setResult("error");
        toast.error("Thanh toán thất bại hoặc đã bị hủy.");
        sessionStorage.removeItem(`payment_pending_${appointmentId}`);
      }
      setLoading(false);
    };

    processPayment();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-700">
            Đang xử lý kết quả thanh toán...
          </h2>
          <p className="text-gray-500 mt-2">
            Vui lòng không đóng hoặc làm mới trình duyệt lúc này.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center animate-fade-in">
        {result === "success" ? (
          <>
            <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center text-5xl mx-auto mb-6">
              ✓
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">
              Thanh toán thành công!
            </h2>
            <p className="text-gray-600 mb-8">
              Cảm ơn bạn đã tin tưởng. Lịch hẹn của bạn đã được cập nhật trạng
              thái đặt cọc 15%.
            </p>
            <Link
              to="/ho-so"
              className="block w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-4 rounded-2xl shadow-lg transition"
            >
              Xem hồ sơ / Lịch hẹn
            </Link>
          </>
        ) : (
          <>
            <div className="w-24 h-24 bg-red-100 text-red-500 rounded-full flex items-center justify-center text-5xl mx-auto mb-6">
              ✕
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">
              Thanh toán thất bại
            </h2>
            <p className="text-gray-600 mb-8">
              Giao dịch của bạn đã bị hủy hoặc xảy ra lỗi trong quá trình xử lý.
            </p>
            <button
              onClick={() => navigate(-1)}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 rounded-2xl shadow-lg transition mb-3"
            >
              Thử thanh toán lại
            </button>
            <Link
              to="/ho-so"
              className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-4 rounded-2xl transition"
            >
              Quay về hồ sơ
            </Link>
          </>
        )}
      </div>
    </div>
  );
};
export default VNPayReturn;
