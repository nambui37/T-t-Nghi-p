import React, { useState, useEffect } from "react";
import { incidentAPI, appointmentAPI } from "../../services/apiClient";
import toast from "react-hot-toast";
import AdminModal, { FormSelect, FormTextarea } from "../../components/AdminModal";

const IncidentManagement = () => {
  const [incidents, setIncidents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isHandleModalOpen, setIsHandleModalOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [handleData, setHandleData] = useState({
    status: "dang_xu_ly",
    admin_ghi_chu: ""
  });

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      setIsLoading(true);
      const res = await incidentAPI.getAll();
      if (res.data.success) {
        setIncidents(res.data.data || []);
      }
    } catch (err) {
      toast.error("Lỗi khi tải danh sách sự cố");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    try {
      const res = await incidentAPI.handle(selectedIncident.id, handleData);
      if (res.data.success) {
        toast.success("Đã cập nhật trạng thái xử lý");
        setIsHandleModalOpen(false);
        fetchIncidents();
      }
    } catch (err) {
      toast.error("Lỗi khi cập nhật");
    }
  };

  const getMucDoBadge = (mucDo) => {
    const config = {
      nhe: { label: "Nhẹ", class: "bg-blue-100 text-blue-700" },
      trung_binh: { label: "Trung bình", class: "bg-orange-100 text-orange-700" },
      nghiem_trong: { label: "Nghiêm trọng", class: "bg-red-100 text-red-700" }
    };
    const s = config[mucDo] || config.nhe;
    return <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${s.class}`}>{s.label}</span>;
  };

  const getStatusBadge = (status) => {
    const config = {
      cho_xu_ly: { label: "Chờ xử lý", class: "bg-yellow-100 text-yellow-700" },
      dang_xu_ly: { label: "Đang xử lý", class: "bg-indigo-100 text-indigo-700" },
      da_xu_ly: { label: "Đã xong", class: "bg-green-100 text-green-700" }
    };
    const s = config[status] || config.cho_xu_ly;
    return <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${s.class}`}>{s.label}</span>;
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Quản lý Sự cố</h2>
          <p className="text-gray-500 text-sm">Xử lý các báo cáo sự cố từ nhân viên</p>
        </div>
        <button onClick={fetchIncidents} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition">🔄 Làm mới</button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                <th className="px-6 py-4 font-semibold">Ngày báo</th>
                <th className="px-6 py-4 font-semibold">Lịch hẹn</th>
                <th className="px-6 py-4 font-semibold">Nhân viên</th>
                <th className="px-6 py-4 font-semibold">Nội dung</th>
                <th className="px-6 py-4 font-semibold">Mức độ</th>
                <th className="px-6 py-4 font-semibold">Trạng thái</th>
                <th className="px-6 py-4 font-semibold text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {isLoading ? (
                <tr><td colSpan="7" className="px-6 py-10 text-center text-indigo-500 font-bold">Đang tải...</td></tr>
              ) : incidents.length === 0 ? (
                <tr><td colSpan="7" className="px-6 py-10 text-center text-gray-500">Chưa có báo cáo sự cố nào.</td></tr>
              ) : (
                incidents.map((inc) => (
                  <tr key={inc.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4 text-xs">{new Date(inc.created_at).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-indigo-600">{inc.lich_hen_id}</p>
                      <p className="text-[10px] text-gray-400">{inc.guest_name}</p>
                    </td>
                    <td className="px-6 py-4 font-medium">{inc.nhan_vien_name}</td>
                    <td className="px-6 py-4 max-w-xs truncate" title={inc.noi_dung}>{inc.noi_dung}</td>
                    <td className="px-6 py-4">{getMucDoBadge(inc.muc_do)}</td>
                    <td className="px-6 py-4">{getStatusBadge(inc.trang_thai)}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => { setSelectedIncident(inc); setHandleData({ status: inc.trang_thai, admin_ghi_chu: inc.admin_ghi_chu || "" }); setIsHandleModalOpen(true); }}
                        className="text-indigo-600 hover:underline font-bold"
                      >
                        Xử lý
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AdminModal
        isOpen={isHandleModalOpen}
        onClose={() => setIsHandleModalOpen(false)}
        title="Xử lý báo cáo sự cố"
        onConfirm={handleUpdateStatus}
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-50 rounded-xl border border-red-100">
            <p className="text-xs font-bold text-red-600 uppercase mb-1">Nội dung sự cố:</p>
            <p className="text-sm text-gray-700">{selectedIncident?.noi_dung}</p>
          </div>
          
          <FormSelect 
            label="Trạng thái xử lý"
            value={handleData.status}
            onChange={(e) => setHandleData({...handleData, status: e.target.value})}
            options={[
              { value: "cho_xu_ly", label: "Chờ xử lý" },
              { value: "dang_xu_ly", label: "Đang xử lý" },
              { value: "da_xu_ly", label: "Đã xử lý xong" }
            ]}
          />

          <FormTextarea 
            label="Ghi chú của Admin"
            value={handleData.admin_ghi_chu}
            onChange={(e) => setHandleData({...handleData, admin_ghi_chu: e.target.value})}
            placeholder="Nhập hướng xử lý, ví dụ: Đã đổi nhân viên thay thế..."
          />
        </div>
      </AdminModal>
    </div>
  );
};

export default IncidentManagement;
