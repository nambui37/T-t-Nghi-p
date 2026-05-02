import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const HealthChart = ({ shifts }) => {
  // Trích xuất dữ liệu từ ghi chú
  const extractData = (shifts) => {
    return shifts
      .filter((s) => s.status === "hoan_thanh" && s.ghi_chu)
      .map((s) => {
        const date = new Date(s.ngay_lam).toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
        });

        // Tìm cân nặng (vd: 3.5kg, 3,5 kg, 3500g)
        const weightMatch = s.ghi_chu.match(/(\d+[.,]?\d*)\s*(kg|g)/i);
        let weight = null;
        if (weightMatch) {
          weight = parseFloat(weightMatch[1].replace(",", "."));
          if (weightMatch[2].toLowerCase() === "g") weight = weight / 1000;
        }

        // Tìm nhiệt độ (vd: 37.5C, 37,5 độ, 37.5 C)
        const tempMatch = s.ghi_chu.match(/(\d+[.,]?\d*)\s*(C|độ|degree)/i);
        let temp = null;
        if (tempMatch) {
          temp = parseFloat(tempMatch[1].replace(",", "."));
        }

        return { date, weight, temp };
      })
      .filter((d) => d.weight || d.temp)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const data = extractData(shifts);

  if (data.length === 0) {
    return (
      <div className="bg-gray-50 rounded-2xl p-8 text-center border border-dashed border-gray-200">
        <p className="text-gray-400 text-sm italic">
          Chưa có đủ dữ liệu chỉ số (cân nặng, nhiệt độ) trong ghi chú để vẽ biểu
          đồ.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Biểu đồ Cân nặng */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <h4 className="text-sm font-bold text-gray-700 mb-6 flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-500 rounded-full"></span> Biểu đồ Cân
          nặng (kg)
        </h4>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" fontSize={10} tickMargin={10} />
              <YAxis domain={["auto", "auto"]} fontSize={10} />
              <Tooltip
                contentStyle={{
                  borderRadius: "15px",
                  border: "none",
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                }}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 4, fill: "#3b82f6" }}
                activeDot={{ r: 6 }}
                name="Cân nặng (kg)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Biểu đồ Nhiệt độ */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <h4 className="text-sm font-bold text-gray-700 mb-6 flex items-center gap-2">
          <span className="w-2 h-2 bg-red-500 rounded-full"></span> Biểu đồ Nhiệt
          độ (°C)
        </h4>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" fontSize={10} tickMargin={10} />
              <YAxis domain={[35, 42]} fontSize={10} />
              <Tooltip
                contentStyle={{
                  borderRadius: "15px",
                  border: "none",
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                }}
              />
              <Line
                type="monotone"
                dataKey="temp"
                stroke="#ef4444"
                strokeWidth={3}
                dot={{ r: 4, fill: "#ef4444" }}
                activeDot={{ r: 6 }}
                name="Nhiệt độ (°C)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default HealthChart;
