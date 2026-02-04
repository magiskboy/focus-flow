# TASK: Lập kế hoạch triển khai tính năng Subtasks (Checklist)

**Vai trò:** Bạn là một Senior Frontend Engineer chịu trách nhiệm thiết kế tính năng mới.

**Mục tiêu:**
Tôi muốn triển khai tính năng **Subtasks (Checklist)** cho từng Task trong ứng dụng quản lý công việc hiện tại. Trước khi viết code, hãy phân tích và lập kế hoạch triển khai chi tiết (Implementation Plan) để đảm bảo tính năng đi đúng hướng và tận dụng tối đa cấu trúc hiện có.

**Bước 1: Phân tích Context (Hãy đọc kỹ các file sau)**

1. [src/types/task.ts](cci:7://file:///Users/nkthanh/code/zen8labs/vtnet/labs/tasks-mgr/src/types/task.ts:0:0-0:0): Kiểm tra interface [Task](cci:2://file:///Users/nkthanh/code/zen8labs/vtnet/labs/tasks-mgr/src/types/task.ts:8:0-23:1) và [Subtask](cci:2://file:///Users/nkthanh/code/zen8labs/vtnet/labs/tasks-mgr/src/types/task.ts:2:0-6:1) đã được định nghĩa chưa. Chúng ta BẮT BUỘC phải sử dụng cấu trúc dữ liệu này, không được tự ý sửa đổi type nếu không cần thiết.
2. [src/features/dashboard/components/TaskDetailDialog.tsx](cci:7://file:///Users/nkthanh/code/zen8labs/vtnet/labs/tasks-mgr/src/features/dashboard/components/TaskDetailDialog.tsx:0:0-0:0): Đây là nơi chính sẽ đặt UI của Checklist. Phân tích xem nên đặt component Checklist ở vị trí nào cho hợp lý (UX).
3. [src/features/dashboard/components/TaskCard.tsx](cci:7://file:///Users/nkthanh/code/zen8labs/vtnet/labs/tasks-mgr/src/features/dashboard/components/TaskCard.tsx:0:0-0:0): Cần hiển thị tiến độ (ví dụ: icon 2/5 subtasks) ra ngoài card để người dùng nắm thông tin nhanh.

**Bước 2: Yêu cầu chức năng (Functional Requirements)**
Trong bản kế hoạch, hãy mô tả cách bạn sẽ xử lý các logic sau:

1. **Thêm Subtask:** Input nhập text -> Enter để thêm vào mảng `subtasks`.
2. **Toggle Status:** Click vào checkbox để cập nhật trạng thái `completed` trong mảng.
3. **Xóa Subtask:** Nút xóa (cần có confirm hoặc thao tác nhanh) cho từng item.
4. **Progress Bar:** Hiển thị thanh tiến độ hoặc chỉ số phần trăm hoàn thành ngay trong Dialog.

**Bước 3: Yêu cầu giao diện (UI/UX Constraints)**

- Sử dụng **Tailwind CSS** để style, đảm bảo nhất quán với design system hiện tại (spacing, colors, rounded corners).
- Sử dụng **Lucide React** cho các icons (Check, Trash, Plus...).
- Giao diện phải hỗ trợ cả Light Mode và Dark Mode (dùng class `dark:`).

**Bước 4: Output đầu ra mong muốn**
Hãy trả về một bản kế hoạch (Plan) dưới dạng Markdown tên là plan_subtasks.md, KHÔNG VIẾT CODE CỤ THỂ, bao gồm:

1. **Phân tích hiện trạng:** Tóm tắt ngắn gọn những gì đã có trong code.
2. **Chi tiết thay đổi (Proposed Changes):**
   - File nào sẽ sửa?
   - State mới nào cần thêm vào component?
   - Logic xử lý CRUD mảng subtask như thế nào (đặc biệt là logic update vào `selectedTask` và sync với Jotai/Storage)?
3. **Các trường hợp biên (Edge Cases):** Ví dụ: Task chưa có mảng subtask (undefined) thì xử lý sao? Nhập text rỗng thì sao?
4. **Các bước thực hiện (Step-by-step):** Chia nhỏ các bước code để tôi có thể review trước khi bạn làm.
