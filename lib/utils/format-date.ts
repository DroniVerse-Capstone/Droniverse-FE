export function formatDate(dateStr: string | null) {
  if (!dateStr) return "—"

  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export function formatDateTime(dateStr: string | null) {
  if (!dateStr) return "—";

  const date = new Date(dateStr);

  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).replace(",", " -");
}

/**
 * Converts a date string/object to a format compatible with <input type="datetime-local"> (YYYY-MM-DDTHH:mm)
 * preserving the local time.
 */
export function toLocalDatetimeString(dateInput: string | Date | null) {
  if (!dateInput) return "";

  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function formatDateWithTime(dateStr: string | null) {
  if (!dateStr) return { day: "—", time: "" };

  const date = new Date(dateStr);

  return {
    day: date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
    time: date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}