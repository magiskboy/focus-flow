# Bug: Dữ liệu không được lưu ổn định (Race condition)

## Mô tả từ người dùng

Khi tôi thêm một task mới, nó hiện ra ngay lập tức ở giao diện. Tuy nhiên, nếu tôi reload trang web ngay sau đó, thỉnh thoảng task đó lại biến mất không dấu vết. Có vẻ như app chưa kịp lưu vào bộ nhớ bền vững mà đã coi như xong rồi.

## Kì vọng

Khi ứng dụng báo đã thêm task (hoặc đóng dialog thêm task), dữ liệu phải chắc chắn đã được lưu vào database (IndexedDB). Người dùng reload trang ngay lập tức cũng không được mất dữ liệu.

---

# Bug: Thứ tự kéo thả không được lưu lại

## Mô tả từ người dùng

Tôi dùng chuột kéo các task để sắp xếp thứ tự ưu tiên trong cột "To Do". Trong phiên làm việc đó thì mọi thứ có vẻ ổn, nhưng chỉ cần tôi reload lại trang (F5), thứ tự các task lại nhảy về trạng thái cũ. App không ghi nhớ được vị trí mới mà tôi đã sắp xếp.

## Kì vọng

Thứ tự các task sau khi kéo thả phải được lưu lại vào database. Khi tải lại trang, các task phải đứng đúng vị trí mà người dùng đã đặt cuối cùng.

---

# Bug: Thông tin task bị "dính" (Stale state)

## Mô tả từ người dùng

Khi tôi mở chi tiết của Task A, thông tin hiện ra đúng. Nhưng sau khi đóng lại và mở Task B, tôi vẫn thấy tiêu đề và nội dung của Task A hiện lên trong cái bảng chi tiết đó! Tôi phải tắt đi mở lại hoặc chọn đi chọn lại mấy lần thì nó mới cập nhật đúng. Rất là gây bối rối.

## Kì vọng

Bảng chi tiết task (Task Detail Dialog) phải luôn hiển thị đúng thông tin của task đang được chọn. Khi chuyển từ task này sang task khác, toàn bộ form phải được cập nhật lại hoặc xóa trắng trước khi nạp dữ liệu mới.
