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
  { value: "BEGINNER", label: "level.easy" },
  { value: "INTERMEDIATE", label: "level.medium" },
  { value: "ADVANCED", label: "level.hard" },
  { value: "MASTER", label: "level.master" },
];

export const getCourseStatus = (value: string ) =>
  COURSE_STATUS.find((e) => e.value === value)?.label || value;

export const getCourseVersionStatus = (value: string) =>
  COURSE_VERSION_STATUS.find((e) => e.value === value)?.label || value;

export const getCourseLevel = (value: string) =>
  (
    {
      EASY: "level.easy",
      MEDIUM: "level.medium",
      HARD: "level.hard",
      BEGINNER: "level.easy",
      INTERMEDIATE: "level.medium",
      ADVANCED: "level.hard",
      MASTER: "level.master",
    } as Record<string, string>
  )[value] || COURSE_LEVELS.find((e) => e.value === value)?.label || value;