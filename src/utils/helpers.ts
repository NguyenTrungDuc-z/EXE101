export type Status =
  | "Pending"
  | "Approved"
  | "Rejected"
  | "New"
  | "Contacted"
  | "Paid"
  | "Refunded"
  | "Resolved"
  | "Review"
  | "Shortlisted"
  | "Verified";

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, ".");

export const statusClass = (status: Status) => {
  switch (status) {
    case "Approved":
      return "badge badge-approved";
    case "Pending":
      return "badge badge-pending";
    case "Rejected":
      return "badge badge-rejected";
    case "New":
      return "badge badge-new";
    case "Contacted":
      return "badge badge-contacted";
    case "Paid":
      return "badge badge-paid";
    case "Refunded":
      return "badge badge-refunded";
    case "Resolved":
      return "badge badge-resolved";
    case "Review":
      return "badge badge-pending";
    case "Shortlisted":
      return "badge badge-contacted";
    case "Verified":
      return "badge badge-approved";
    default:
      return "badge";
  }
};

export const statusLabel = (status: Status) => {
  switch (status) {
    case "Approved":
      return "Đã duyệt";
    case "Pending":
      return "Chờ duyệt";
    case "Rejected":
      return "Từ chối";
    case "New":
      return "Mới";
    case "Contacted":
      return "Đã liên hệ";
    case "Paid":
      return "Đã thanh toán";
    case "Refunded":
      return "Hoàn tiền";
    case "Resolved":
      return "Đã xử lý";
    case "Review":
      return "Đang xem xét";
    case "Shortlisted":
      return "Đã chọn";
    case "Verified":
      return "Đã xác minh";
    default:
      return status;
  }
};
