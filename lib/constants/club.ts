export const CLUB_STATUS = [
  { value: null, label: "status.all" },
  { value: "ACTIVE", label: "status.active" },
  { value: "INACTIVE", label: "status.inactive" },
  { value: "SUSPENDED", label: "status.suspended" },
  { value: "ARCHIVED", label: "status.archived" },
];

export const CLUB_REQUEST_STATUS = [
  { value: null, label: "Tất cả" },
  { value: "APPROVED", label: "Đã duyệt" },
  { value: "PENDING", label: "Chờ duyệt" },
  { value: "REJECTED", label: "Từ chối" },
  { value: "CANCEL", label: "Đã hủy" },
];

export const getClubStatus = (value: string ) =>
  CLUB_STATUS.find((e) => e.value === value)?.label || value;

export const getClubRequestStatus = (value: string) =>
  CLUB_REQUEST_STATUS.find((e) => e.value === value)?.label || value;