# Kế Hoạch Triển Khai: Hệ Thống Chấm Điểm & Tối Ưu Hóa Bài Lab

Tài liệu này tóm tắt 4 giai đoạn phát triển để nâng cấp hệ thống Drone Lab từ kiểm tra trạng thái đơn giản thành một engine chấm điểm tự động chuyên nghiệp.

---

## 🚀 Giai đoạn 1: Thu Thập & Lưu Trữ Dữ Liệu Chính Xác (CURRENT)
**Mục tiêu**: Thu thập các chỉ số "Vàng" từ lượt giải của Admin và lưu vào cơ sở dữ liệu.

*   **Logic Distance**: Tính quãng đường dựa trên thông số trong khối lệnh (ví dụ: Forward 1m = 1m). Xử lý chính xác các vòng lặp (Repeat).
*   **Metric Collection**: Thu thập đủ 5 thông số:
    1.  `xml`: Cấu trúc khối lệnh Blockly.
    2.  `timeSpent`: Thời gian hoàn thành thực tế.
    3.  `fuelConsumed`: Lượng pin tiêu thụ.
    4.  `distanceTraveled`: Quãng đường logic (Block-based).
    5.  `blockCount`: Tổng số khối lệnh đã dùng.
*   **Persistence**: Cập nhật trang `Solve` để lưu toàn bộ object dữ liệu này vào `labContent`.

---

## 🛠️ Giai đoạn 2: Quản Lý Lời Giải Mẫu (Admin)
**Mục tiêu**: Giúp Admin quản lý và duy trì tính đúng đắn của lời giải.

*   **HUD Indicator**: Hiển thị trạng thái "Đã có đáp án mẫu" kèm các thông số kỷ lục (Best Time, Best Blocks) ngay trong Map Editor.
*   **Auto-Invalidation**: Tự động thông báo hoặc xóa lời giải cũ nếu Admin thay đổi bản đồ (di chuyển vật cản, checkpoint) khiến lời giải cũ không còn khả thi.

---

## 📊 Giai đoạn 3: Engine Chấm Điểm Tự Động (Student)
**Mục tiêu**: So sánh bài làm của học sinh với Admin và đưa ra điểm số.

*   **Comparison Logic**: Tính toán tỷ lệ phần trăm dựa trên baseline của Admin.
    *   *Efficiency Score*: (Số khối Admin / Số khối Học sinh) * 100.
    *   *Performance Score*: (Thời gian Admin / Thời gian Học sinh) * 100.
*   **Result UI**: Thay thế thông báo "Thành công" đơn giản bằng một "Bảng Điểm Sứ Mệnh" hiện đại, có nhận xét tối ưu (Ví dụ: "Bạn có thể dùng ít khối lệnh hơn nếu dùng vòng lặp").

---

## 📖 Giai đoạn 4: Tham Khảo & Học Tập
**Mục tiêu**: Giúp học sinh học hỏi từ cách giải của Admin.

*   **View Master Solution**: Sau khi hoàn thành (hoặc sau N lần thất bại), học sinh có thể nhấn nút "Xem đáp án mẫu".
*   **Read-only Workspace**: Mở một cửa sổ hiện các khối lệnh của Admin dưới dạng chỉ đọc (Read-only) để học sinh đối chiếu với logic của mình.

---

> [!IMPORTANT]
> **Trạng thái hiện tại**: Sẵn sàng bắt đầu **Giai đoạn 1**. Bước tiếp theo là cài đặt hàm tính quãng đường logic trong `PlayLabWorkspace.tsx`.
