export function slugify(str: string) {
  return str
    .normalize("NFD") // tách dấu tiếng Việt
    .replace(/[\u0300-\u036f]/g, "") // xóa dấu
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // xóa ký tự đặc biệt
    .replace(/\s+/g, "-") // space -> -
    .replace(/-+/g, "-") // tránh ----
}