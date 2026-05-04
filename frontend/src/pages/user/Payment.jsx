import React, { useState, useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { paymentAPI } from "../../services/apiClient";

const Payment = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isPaymentPending, setIsPaymentPending] = useState(false);

  const { amount, serviceName, type, method } = location.state || {
    amount: 0,
    serviceName: "Dịch vụ Mom&Baby",
    type: "deposit",
    method: "vnpay",
  };

  useEffect(() => {
    if (!location.state) {
      toast.error("Thông tin thanh toán không hợp lệ");
      navigate("/ho-so");
      return;
    }

    // Kiểm tra xem trước đó đã chuyển hướng đến cổng thanh toán chưa
    const pendingStatus = sessionStorage.getItem(`payment_pending_${id}`);
    if (pendingStatus) {
      setIsPaymentPending(true);
    }
  }, [location.state, navigate, id]);

  const handlePayment = async () => {
    try {
      setIsLoading(true);
      let res;

      // Gọi API tạo yêu cầu thanh toán VNPay
      res = await paymentAPI.createVNPayPayment({
        orderId: id,
        amount: amount,
        orderInfo: `Thanh toan coc cho lich hen ${id}`,
      });

      if (res.data && res.data.payUrl) {
        // Lưu cờ vào sessionStorage trước khi chuyển hướng
        sessionStorage.setItem(`payment_pending_${id}`, "true");
        window.location.href = res.data.payUrl;
      } else {
        toast.error(`Không thể tạo giao dịch VNPay lúc này.`);
      }
    } catch (error) {
      console.error(error);
      toast.error(`Lỗi khi kết nối với cổng thanh toán VNPay.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-pink-100">
        <div className="bg-pink-500 p-6 text-center text-white">
          <h2 className="text-2xl font-bold">Thanh Toán Đặt Cọc</h2>
          <p className="opacity-90">Mã lịch hẹn: #{id}</p>
        </div>

        <div className="p-8 space-y-6">
          <div className="text-center">
            <p className="text-gray-500 text-sm uppercase font-bold tracking-wider">
              Số tiền cần thanh toán
            </p>
            <p className="text-4xl font-black text-pink-600 mt-2">
              {amount?.toLocaleString()}đ
            </p>
            <p className="text-sm font-medium text-gray-700 mt-4">
              Thanh toán an toàn và tiện lợi qua cổng thanh toán{" "}
              <span className="text-pink-600 font-bold">VNPay</span>
            </p>
          </div>

          {isPaymentPending ? (
            <div className="space-y-4 text-center pt-4 animate-fade-in">
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-xl">
                <p className="font-bold">Đang chờ xác nhận thanh toán</p>
                <p className="text-sm mt-1">
                  Nếu bạn đã thanh toán, hệ thống sẽ tự động cập nhật sau ít
                  phút.
                </p>
              </div>
              <button
                onClick={() => navigate("/ho-so")}
                className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-4 rounded-2xl shadow-lg transition"
              >
                Kiểm tra lịch hẹn
              </button>
              <button
                onClick={() => {
                  sessionStorage.removeItem(`payment_pending_${id}`);
                  setIsPaymentPending(false);
                }}
                className="w-full text-pink-500 font-bold py-2 hover:underline"
              >
                Thử thanh toán lại
              </button>
            </div>
          ) : (
            <div className="space-y-3 pt-4">
              <button
                onClick={handlePayment}
                disabled={isLoading}
                className={`w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-4 rounded-2xl shadow-lg transition transform hover:-translate-y-1 active:scale-95 flex justify-center items-center gap-2 ${
                  isLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? "Đang xử lý..." : `Thanh toán bằng VNPay`}
              </button>
              <button
                onClick={() => navigate("/ho-so")}
                className="w-full bg-white border-2 border-gray-200 text-gray-500 font-bold py-4 rounded-2xl hover:bg-gray-50 transition"
              >
                Để sau
              </button>
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-[10px] text-gray-400 leading-tight uppercase tracking-tighter">
            An toàn • Bảo mật • Tự động cập nhật sau 1-3 phút
          </p>
        </div>
      </div>
    </div>
  );
};

export default Payment;
