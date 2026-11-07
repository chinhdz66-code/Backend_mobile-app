const jwt = require('jsonwebtoken');

app.use((err, req, res, next) => {
    // Nếu lỗi là do sai cú pháp JSON (SyntaxError)
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        // In một dòng thông báo nhỏ cho gọn log, không in stack trace dài ngoằng
        console.warn('Cảnh báo: Client gửi lên JSON sai cú pháp!');
        
        // Trả về lỗi cho Postman đọc
        return res.status(400).json({ 
            trangThai: "Thất bại", 
            thongBao: "Dữ liệu JSON gửi lên bị sai cú pháp." 
        });
    }
    // Nếu là lỗi khác thì cho đi tiếp
    next();
});

// Middleware xác thực token JWT
const xacThucToken = (req, res, next) => {
    // 1. Nhìn ra vỏ phong bì xem có ô 'authorization' không
    const authHeader = req.headers['authorization'];
    
    // 2. Nếu có authHeader, cắt lấy phần tử thứ 2 (chính là token, bỏ chữ Bearer đi)
    const token = authHeader && authHeader.split(' ')[1]; 

    // 3. Khách không đưa thẻ (Mã 401: Unauthorized)
    if (!token) {
        return res.status(401).json({ 
            trangThai: "Thất bại", 
            thongBao: "Bạn chưa đăng nhập. Vui lòng cung cấp Token!" 
        });
    }

    // 4. Có thẻ -> Đưa thẻ vào máy(Dùng chìa khóa JWT_SECRET trong file .env để giải mã)
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            // Máy báo lỗi (Thẻ giả, hoặc thẻ đã quá hạn 7 ngày) ->(Mã 403: Forbidden)
            return res.status(403).json({ 
                trangThai: "Thất bại", 
                thongBao: "Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại!" 
            });
        }
        
        // 5. Thẻ đúng -> Đọc lấy thông tin khách (user_id, role) nhét vào giỏ req để mang vào cho Lễ tân
        req.user = user; 
        
        // 6. Ra lệnh mở barrier cho đi tiếp vào Controller
        next(); 
    });
};

//Kiểm tra quyền Admin
const kiemTraAdmin = (req, res, next) => {
    // Lúc này req.user đã có dữ liệu nhờ hàm xacThucToken chạy thành công ở trước đó
    const user = req.user;

    // Kiểm tra xem role có phải admin không
    if (user && user.role === 'admin') {
        next(); // Chức vụ to -> Mời sếp vào
    } else {
        // Dân thường -> Đuổi về (Mã 403: Forbidden - Không đủ thẩm quyền)
        return res.status(403).json({ 
            trangThai: "Thất bại", 
            thongBao: "Bạn không có quyền thực hiện hành động này. Yêu cầu quyền Admin!" 
        });
    }
};


module.exports = { xacThucToken, kiemTraAdmin };