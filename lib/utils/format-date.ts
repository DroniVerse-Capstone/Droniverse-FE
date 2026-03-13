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