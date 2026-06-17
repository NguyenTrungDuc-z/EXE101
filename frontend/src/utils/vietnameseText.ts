const textMap: Record<string, string> = {
  "Dien nuoc": "Điện nước",
  "Don dep nha": "Dọn dẹp nhà",
  "Ve sinh may lanh": "Vệ sinh máy lạnh",
  urgent: "Khẩn cấp",
  hourly: "Theo giờ",
  scheduled: "Đặt lịch",
  task: "Theo việc",
  shift: "Theo ca",
  contract: "Theo hợp đồng",
  "District 1": "Quận 1",
  "District 3": "Quận 3",
  "District 4": "Quận 4",
  "District 7": "Quận 7",
  "Binh Thanh": "Bình Thạnh",
  "Nha Be": "Nhà Bè",
  "Thu Duc": "Thủ Đức",
  "Ho Chi Minh City": "TP. Hồ Chí Minh",
  "District 1, Ho Chi Minh City": "Quận 1, TP. Hồ Chí Minh",
  "District 7, Ho Chi Minh City": "Quận 7, TP. Hồ Chí Minh",
  "Binh Thanh, Ho Chi Minh City": "Bình Thạnh, TP. Hồ Chí Minh",
  "Sua ong nuoc bon rua trong ngay": "Sửa ống nước bồn rửa trong ngày",
  "Don dep can ho sau sua chua": "Dọn dẹp căn hộ sau sửa chữa",
  "Ve sinh may lanh van phong": "Vệ sinh máy lạnh văn phòng",
  "Can tho co mat trong 2 gio de xu ly ro ri nuoc.": "Cần thợ có mặt trong 2 giờ để xử lý rò rỉ nước.",
  "Don dep can ho 2 phong ngu sau khi tho xong viec.": "Dọn dẹp căn hộ 2 phòng ngủ sau khi thợ hoàn tất công việc.",
  "Can tho den buoi chieu de ve sinh 2 may lanh.": "Cần thợ đến buổi chiều để vệ sinh 2 máy lạnh.",
  "Co kinh nghiem xu ly ro ri": "Có kinh nghiệm xử lý rò rỉ",
  "Mang dung cu co ban": "Mang dụng cụ cơ bản",
  "Dung cu ve sinh co ban": "Dụng cụ vệ sinh cơ bản",
  "Nhan viec trong ngay": "Nhận việc trong ngày",
  "Co thang va do bao ho": "Có thang và đồ bảo hộ",
  "Dung hen": "Đúng hẹn",
  "350k / task": "350k / việc",
  "220k / ca": "220k / ca",
  "420k / lan": "420k / lần",
  "Viec Nhanh Home Services": "Dịch vụ Nhà Nhanh",
  "Thanh Cong Utility": "Tiện ích Thành Công",
  "Le Minh": "Lê Minh",
  "Tran Thanh": "Trần Thanh",
  "Nguyen Van Tuan": "Nguyễn Văn Tuấn",
  "Tran Thi Lan": "Trần Thị Lan",
  "Electric and plumbing freelancer": "Thợ điện nước tự do",
  "Cleaning and home support specialist": "Chuyên viên dọn dẹp và hỗ trợ nhà cửa",
  "Review pending cleaning request": "Duyệt yêu cầu dọn dẹp đang chờ",
  "Verify employer legal documents": "Xác minh hồ sơ pháp lý của khách hàng",
  content_ops: "Đội nội dung",
  risk_ops: "Đội rủi ro",
  plumbing: "Điện nước",
  electrical: "Điện dân dụng",
  maintenance: "Bảo trì",
  cleaning: "Dọn dẹp",
  laundry: "Giặt ủi",
  "home care": "Chăm sóc nhà cửa"
};

export function viText(value: string | undefined | null) {
  if (!value) {
    return "";
  }

  return textMap[value] ?? value;
}

export function viTextList(values: string[] | undefined | null) {
  return values?.map(viText) ?? [];
}
