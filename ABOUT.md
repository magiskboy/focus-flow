FocusFlow là một ứng dụng quản lý công việc và theo dõi thời gian tập trung (task & focus tracking) được xây dựng hoàn toàn ở phía client. Ứng dụng không sử dụng backend, không gửi dữ liệu ra ngoài, và được thiết kế theo triết lý offline-first & privacy-by-design.

Mục tiêu

FocusFlow giúp người dùng:
	•	Quản lý danh sách công việc cá nhân
	•	Theo dõi các phiên tập trung (focus session)
	•	Hiểu và cải thiện năng suất làm việc hằng ngày
mà không cần đăng nhập, không cần kết nối mạng, và không chia sẻ dữ liệu.

⸻

Kiến trúc & nguyên tắc thiết kế

Thuần client-side
	•	Ứng dụng chạy hoàn toàn trên trình duyệt
	•	Client-side rendering (CSR) với React
	•	Không có server, API, hoặc cloud service

Offline-first
	•	Ứng dụng hoạt động đầy đủ khi không có internet
	•	Mọi thao tác (CRUD task, focus session, thống kê) đều xử lý tại client
	•	Trạng thái được hydrate lại khi reload trang

Bảo mật & quyền riêng tư
	•	Toàn bộ dữ liệu được lưu cục bộ trên máy người dùng
	•	Không có telemetry, tracking, hay analytics
	•	Không truyền dữ liệu ra bên ngoài dưới bất kỳ hình thức nào

Lưu trữ dữ liệu
	•	Sử dụng:
	•	localStorage cho state nhanh
	•	IndexedDB cho dữ liệu có vòng đời dài
	•	Có cơ chế versioning để tránh lỗi khi schema thay đổi

⸻

Phạm vi nghiệp vụ

FocusFlow tập trung vào logic phía frontend, bao gồm:
	•	Quản lý state phức tạp
	•	Derived state & memoization
	•	Time-based logic (timer, pause/resume)
	•	Persistence & hydration
	•	Undo / redo
	•	Validation & workflow rules

Ứng dụng không tập trung vào:
	•	Networking
	•	Authentication
	•	Multi-user
	•	Backend integration

⸻

Đối tượng sử dụng
	•	Người dùng cá nhân cần quản lý công việc offline
	•	Người quan tâm đến quyền riêng tư
	•	Người làm việc trong môi trường hạn chế kết nối mạng
	•	(Trong ngữ cảnh benchmark) làm codebase chuẩn để đánh giá AI coding agent

⸻

Lý do lựa chọn mô hình này cho benchmark AI agent
	•	Không có backend → agent không thể né logic
	•	Logic tập trung ở frontend → dễ đánh giá khả năng reasoning
	•	State & side-effect phức tạp → phân hóa agent mạnh/yếu rõ rệt
	•	Offline & persistence → phù hợp test debug nâng cao
	•	Codebase đủ thực tế nhưng không phụ thuộc external system
