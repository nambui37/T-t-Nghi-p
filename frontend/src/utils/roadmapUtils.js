export const generateRoadmap = (startDate, endDate, serviceName = "") => {
  if (!startDate || !endDate) return [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const roadmap = [];
  let current = new Date(start);
  let dayCount = 1;

  const sName = serviceName.toLowerCase();

  // Định nghĩa các template
  const templates = {
    phuc_hoi: {
      fixed:
        "Lộ trình Phục hồi sau sinh (Cố định): 07:00 Ăn sáng dinh dưỡng; 08:30 Xông hơ thảo mộc; 10:00 Massage phục hồi vùng bụng; 14:00 Chăm sóc vết thương; 16:00 Thư giãn đá nóng.",
      flexible: "Theo dõi co hồi tử cung, hướng dẫn bài tập Kegel nhẹ nhàng.",
    },
    be_so_sinh: {
      fixed:
        "Lộ trình Bé sơ sinh (Cố định): 06:30 Vệ sinh mắt mũi tai; 07:30 Bú sữa/Ăn sáng; 08:30 Tắm bé & Massage; 10:00 Vệ sinh rốn; 15:00 Tương tác sớm (Kích thích thị giác).",
      flexible: "Theo dõi vàng da, giấc ngủ và phản xạ tự nhiên của bé.",
    },
    thong_sua: {
      fixed:
        "Lộ trình Thông tắc tia sữa (Cố định): 08:00 Kiểm tra khối tắc; 09:00 Chiếu đèn hồng ngoại/Chườm ấm; 10:00 Massage thông tuyến sữa; 15:00 Hút sữa dư thừa; 16:00 Hướng dẫn tư thế bú.",
      flexible: "Theo dõi lượng sữa và tình trạng căng tức ngực.",
    },
    default: {
      fixed:
        "Lộ trình 2-4-6 (Cố định): 06:30 Rửa mặt, vệ sinh; 07:00 Ăn sáng; 08:30 Massage & Tắm nắng; 09:30 Vệ sinh rốn; 10:30 Kích thích đa giác quan; 16:00 Tắm bé; 17:00 Bàn giao.",
      flexible: "Theo dõi vận động, tương tác sớm, rèn luyện kỹ năng.",
    },
  };

  // Chọn template dựa trên tên dịch vụ
  let activeTemplate = templates.default;
  if (sName.includes("phục hồi")) activeTemplate = templates.phuc_hoi;
  else if (sName.includes("bé") || sName.includes("sơ sinh"))
    activeTemplate = templates.be_so_sinh;
  else if (sName.includes("thông sữa") || sName.includes("tia sữa"))
    activeTemplate = templates.thong_sua;

  while (current <= end) {
    const dayOfWeek = current.getDay();
    let activity = "";

    if (activeTemplate === templates.be_so_sinh) {
      if (dayCount === 1) activity = "Ngày 1: Tắm bé & Vệ sinh rốn chuyên sâu. ";
      else if (dayCount <= 10)
        activity = `Ngày ${dayCount}: Tắm bé & Massage kích thích hệ tiêu hóa. `;
    }

    if ([1, 3, 5].includes(dayOfWeek)) {
      activity += activeTemplate.fixed;
    } else if ([2, 4, 6].includes(dayOfWeek)) {
      activity += activeTemplate.flexible;
    } else {
      activity +=
        "Chủ Nhật: Kiểm tra tổng quát tuần, tư vấn mẹ và bé, vệ sinh khu vực sinh hoạt.";
    }

    roadmap.push({
      day: dayCount,
      date: current.toISOString().split("T")[0],
      activity: activity,
    });

    current.setDate(current.getDate() + 1);
    dayCount++;
  }
  return roadmap;
};
