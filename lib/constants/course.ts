export const COURSE_STATUS = [
  { value: null, label: "status.all" },
  { value: "DRAFT", label: "status.draft" },
  { value: "PUBLISH", label: "status.publish" },
  { value: "UNPUBLISH", label: "status.unpublish" },
  { value: "ARCHIVED", label: "status.archived" },
];

export const COURSE_VERSION_STATUS = [
  { value: null, label: "status.all" },
  { value: "DRAFT", label: "status.draft" },
  { value: "ACTIVE", label: "status.active" },
  { value: "INACTIVE", label: "status.inactive" },
  { value: "DEPRECATED", label: "status.deprecated" },
];

export const COURSE_LEVELS = [
  { value: null, label: "level.all" },
  { value: "EASY", label: "level.easy" },
  { value: "MEDIUM", label: "level.medium" },
  { value: "HARD", label: "level.hard" },
];

export const getCourseStatus = (value: string ) =>
  COURSE_STATUS.find((e) => e.value === value)?.label || value;

export const getCourseVersionStatus = (value: string) =>
  COURSE_VERSION_STATUS.find((e) => e.value === value)?.label || value;

export const getCourseLevel = (value: string) =>
  COURSE_LEVELS.find((e) => e.value === value)?.label || value;