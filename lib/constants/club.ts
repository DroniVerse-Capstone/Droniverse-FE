export const CLUB_STATUS = [
  { value: null, label: "status.all" },
  { value: "ACTIVE", label: "status.active" },
  { value: "INACTIVE", label: "status.inactive" },
  { value: "SUSPENDED", label: "status.suspended" },
  { value: "ARCHIVED", label: "status.archived" },
];

export const getClubStatus = (value: string ) =>
  CLUB_STATUS.find((e) => e.value === value)?.label || value;
