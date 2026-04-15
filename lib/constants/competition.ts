export const COMPETITION_STATUS = [
  { value: null, label: "ALL" },
  { value: "DRAFT", label: "DRAFT" },
  { value: "PUBLISHED", label: "PUBLISHED" },
  { value: "REGISTRATION_OPEN", label: "REGISTRATION_OPEN" },
  { value: "REGISTRATION_CLOSED", label: "REGISTRATION_CLOSED" },
  { value: "ONGOING", label: "ONGOING" },
  { value: "FINISHED", label: "FINISHED" },
  { value: "RESULT_PUBLISHED", label: "RESULT_PUBLISHED" },
  { value: "CANCELLED", label: "CANCELLED" },
  { value: "INVALID", label: "INVALID" },
];

export const getCompetitionStatus = (value: string) =>
  COMPETITION_STATUS.find((e) => e.value === value)?.label || value;
