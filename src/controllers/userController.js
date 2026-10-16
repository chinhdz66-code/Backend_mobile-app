const userModel = require('../models/userModel');
const userService = require('../services/userService');

//lấy danh sách user
const layDanhSachUser = async (req, res) => {
    try {
        // Gọi Thủ kho lấy data
        const users = await userModel.layTatCaUser();
        
        // Trả kết quả thành công (Mã 200) về cho Postman/App
        res.status(200).json({
            trangThai: "Thành công",
            soLuong: users.length,
            duLieu: users
        });
    } catch (error) {
        // Nếu database lỗi, trả về mã 500
        res.status(500).json({
            trangThai: "Thất bại",
            thongBao: "Lỗi khi lấy dữ liệu từ database",
            chiTiet: error.message
        });
    }
};

//tao user mới
const taoUser = async (req, res) => {
    try {
        // Rút thông tin từ túi (body) mà khách hàng gửi lên (Phải khớp chính xác với key trên Postman)
        const { full_name, email, password, phone, gender, dob } = req.body;

        if (!full_name || !email || !password || !phone || !dob) {
            return res.status(400).json({ trangThai: "Thất bại", thongBao: "Thiếu thông tin!" });
        }

        // Nhờ Bếp trưởng xử lý mã hóa và lưu trữ (Truyền đúng tên biến vừa lấy ở trên)
        const newUserId = await userService.dangKyUser(full_name, email, password, phone, gender, dob);

        res.status(201).json({
            trangThai: "Thành công",
            thongBao: "Đăng ký thành công!",
            duLieu: { id: newUserId, email: email }
        });
    } catch (error) {
        // Bắt lỗi MySQL: 1062 là mã khi bị trùng cột UNIQUE (Email)
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ trangThai: "Thất bại", thongBao: "Email này đã tồn tại!" });
        }
        res.status(500).json({ trangThai: "Thất bại", chiTiet: error.message });
    }
};

module.exports = { layDanhSachUser, taoUser };