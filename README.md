## 1. Feature development

- Plan stage: Dựa vào prompts/sub-tasks.md để lập kế hoạch triển khai tính năng Subtasks (Checklist).
- Tạo new chat.
- Implementation stage: Dựa vào kế hoạch đã lập plan_subtasks.md để triển khai tính năng Subtasks (Checklist).

## 2. Fix

- Checkout sang nhánh bug.
- Plan stage: Hãy khoanh vùng, tìm vị trí và xác định root cause của các bug trong prompts/bug.md. Sau đó, ghi suy luận, nguyên nhân và giải pháp ngắn gọn, súc tích ra file plan_fix_bug.md (Không sử dụng emoji, sử dụng plaintext format). Hãy chạy yarn test để kiểm tra unit test
- Tạo new chat.
- Implementation stage: Dựa vào plan_fix_bug.md, hãy thực hiện sửa lỗi. Hãy chạy yarn test để kiểm tra unit test trước và sau khi fix bug
