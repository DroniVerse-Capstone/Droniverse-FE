export const COURSE_STATUS = [
  { value: null, label: "Tất cả" },
  { value: "DRAFT", label: "Nháp" },
  { value: "PUBLISH", label: "Xuất bản" },
  { value: "UNPUBLISH", label: "Chưa xuất bản" },
  { value: "ARCHIVED", label: "Lưu trữ" },
];

export const COURSE_VERSION_STATUS = [
  { value: null, label: "Tất cả" },
  { value: "DRAFT", label: "Nháp" },
  { value: "ACTIVE", label: "Hoạt động" },
  { value: "INACTIVE", label: "Không hoạt động" },
  { value: "DEPRECATED", label: "Lỗi thời" },
];

export const COURSE_LEVELS = [
  { value: null, label: "Tất cả" },
  { value: "EASY", label: "Cơ bản" },
  { value: "MEDIUM", label: "Trung bình" },
  { value: "HARD", label: "Nâng cao" },
];

export const getCourseStatus = (value: string ) =>
  COURSE_STATUS.find((e) => e.value === value)?.label || value;

export const getCourseVersionStatus = (value: string) =>
  COURSE_VERSION_STATUS.find((e) => e.value === value)?.label || value;

export const getCourseLevel = (value: string) =>
  COURSE_LEVELS.find((e) => e.value === value)?.label || value;