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

//đăng nhập user
const dangNhap = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ trangThai: "Thất bại", thongBao: "Vui lòng nhập email và mật khẩu!" });
        }

        // Gọi Bếp trưởng xử lý
        const ketQua = await userService.dangNhapUser(email, password);

        res.status(200).json({
            trangThai: "Thành công",
            thongBao: "Đăng nhập thành công!",
            token: ketQua.token,
            duLieu: ketQua.user
        });
    } catch (error) {
        if (error.message === "Email hoặc mật khẩu không chính xác") {
            return res.status(401).json({ trangThai: "Thất bại", thongBao: error.message });
        }
        res.status(500).json({ trangThai: "Thất bại", chiTiet: error.message });
    }
};

// xử lí avatar của User
const uploadAvatar = async (req, res) => {
    try {
        const { user_id } = req.body;
        if (!req.file) {
            return res.status(400).json({ trangThai: "Thất bại", thongBao: "Vui lòng chọn file ảnh!" });
        }

        // Tạo URL ảnh công khai dạng: http://<IP>:8080/uploads/avatars/filename.jpg
        const avatarUrl = `${req.protocol}://${req.get('host')}/uploads/avatars/${req.file.filename}`;

        // Gọi model cập nhật vào MySQL
        await userModel.capNhatAvatar(user_id, avatarUrl);

        return res.status(200).json({
            trangThai: "Thành công",
            thongBao: "Cập nhật ảnh đại diện thành công!",
            avatar_url: avatarUrl
        });
    } catch (error) {
        return res.status(500).json({ trangThai: "Thất bại", thongBao: error.message });
    }
};

// cập nhật thông tin profile
const capNhatThongTin = async (req, res) => {
    try {
        const { user_id, full_name, phone, gender, dob } = req.body;
        if (!user_id || !full_name) {
            return res.status(400).json({ trangThai: "Thất bại", thongBao: "Thiếu thông tin!" });
        }

        await userModel.capNhatThongTinUser(user_id, full_name, phone, gender, dob);

        return res.status(200).json({
            trangThai: "Thành công",
            thongBao: "Cập nhật thông tin thành công!"
        });
    } catch (error) {
        return res.status(500).json({ trangThai: "Thất bại", thongBao: error.message });
    }
};

// thay đổi mật khẩu 
const doiMatKhau = async (req, res) => {
    try {
        // Lấy userId trực tiếp từ Token đã được Middleware giải mã (Bảo mật tuyệt đối, không nhận từ body)
        const userId = req.user?.user_id;
        const oldPassword = req.body.oldPassword || req.body.old_password;
        const newPassword = req.body.newPassword || req.body.new_password;

        if (!userId) {
            return res.status(401).json({
                trangThai: "Thất bại",
                thongBao: "Không tìm thấy thông tin xác thực từ Token!"
            });
        }

        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                trangThai: "Thất bại",
                thongBao: "Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới!"
            });
        }

        // Regex: Tối thiểu 8 ký tự, 1 chữ hoa, 1 chữ số, 1 ký tự đặc biệt
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({
                trangThai: "Thất bại",
                thongBao: "Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ số và ký tự đặc biệt!"
            });
        }

        await userService.doiMatKhau(userId, oldPassword, newPassword);

        return res.status(200).json({
            trangThai: "Thành công",
            thongBao: "Đổi mật khẩu thành công!"
        });

    } catch (error) {
        return res.status(400).json({
            trangThai: "Thất bại",
            thongBao: error.message
        });
    }
};

module.exports = { layDanhSachUser, taoUser, dangNhap, uploadAvatar, capNhatThongTin, doiMatKhau };
