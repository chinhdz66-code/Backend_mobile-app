const userModel = require('../models/userModel');
const userService = require('../services/userService');
const emailService = require('../services/emailService');

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
        const { full_name, email, password, phone, gender, dob } = req.body;

        if (!full_name || !email || !password || !phone || !dob) {
            return res.status(400).json({ trangThai: "Thất bại", thongBao: "Thiếu thông tin!" });
        }

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 3 * 60 * 1000);

        // 1. Cất vào Database
        const newUserId = await userService.dangKyUser(full_name, email, password, phone, gender, dob, otpCode, otpExpires);

        // 2. Gửi Email 
        await emailService.guiMailOTP(email, otpCode);

        return res.status(201).json({
            trangThai: "Thành công",
            thongBao: "Đăng ký thành công! Vui lòng kiểm tra Email để lấy mã OTP.",
            duLieu: { id: newUserId, email: email }
        });
    } catch (error) {
        console.error("LỖI CONTROLLER:", error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ trangThai: "Thất bại", thongBao: "Email hoặc SĐT đã tồn tại!" });
        }


        return res.status(500).json({ trangThai: "Thất bại", chiTiet: error.message });
    }
};

//gui lại OTP
const guiLaiOTP = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ thongBao: "Vui lòng cung cấp email!" });

        // 1. Kiểm tra user
        const user = await userModel.timUserBangEmail(email);
        if (!user) {
            return res.status(404).json({ thongBao: "Email này chưa từng đăng ký!" });
        }

        // 2. Nếu đã kích hoạt rồi thì không gửi nữa
        if (user.is_active === 1) {
            return res.status(400).json({ thongBao: "Tài khoản này đã được kích hoạt từ trước!" });
        }

        // 3. Sinh OTP mới
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 3 * 60 * 1000);

        // 4. Lưu OTP mới vào DB và gửi mail
        await userModel.capNhatOTP(email, otpCode, otpExpires);
        await emailService.guiMailOTP(email, otpCode);

        return res.status(200).json({
            trangThai: "Thành công",
            thongBao: "Đã gửi lại mã OTP mới! Mã có hiệu lực trong 3 phút."
        });

    } catch (error) {
        return res.status(500).json({ trangThai: "Thất bại", chiTiet: error.message });
    }
};

//xác nhận OTP 
const xacThucOTP = async (req, res) => {
    try {
        const { email, otpCode } = req.body;

        if (!email || !otpCode) {
            return res.status(400).json({ trangThai: "Thất bại", thongBao: "Vui lòng cung cấp Email và Mã OTP!" });
        }

        // 1. Tìm user
        const user = await userModel.timUserBangEmail(email);
        if (!user) {
            return res.status(404).json({ trangThai: "Thất bại", thongBao: "Không tìm thấy tài khoản này!" });
        }

        // 2. Check trạng thái
        if (user.is_active === 1) {
            return res.status(400).json({ trangThai: "Thất bại", thongBao: "Tài khoản đã được kích hoạt từ trước!" });
        }

        // 3. Check OTP có khớp không
        if (user.otp_code !== String(otpCode)) {
            return res.status(400).json({ trangThai: "Thất bại", thongBao: "Mã OTP không chính xác!" });
        }

        // 4. Check thời gian 3 phút
        if (new Date() > new Date(user.otp_expires)) {
            return res.status(400).json({ trangThai: "Thất bại", thongBao: "Mã OTP đã hết hạn (quá 3 phút)!" });
        }

        // 5. Cấp thẻ xanh
        await userModel.kichHoatTaiKhoan(email);

        return res.status(200).json({
            trangThai: "Thành công",
            thongBao: "Xác thực tài khoản thành công! Bạn có thể đăng nhập ngay bây giờ."
        });

    } catch (error) {
        return res.status(500).json({ trangThai: "Thất bại", chiTiet: error.message });
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
        // Bắt lỗi tài khoản chưa kích hoạt
        if (error.message === "Tài khoản chưa được kích hoạt") {
            return res.status(403).json({
                trangThai: "Thất bại",
                thongBao: "Tài khoản chưa được kích hoạt. Vui lòng xác thực OTP!",
                maLoi: "NOT_ACTIVATED",
                email: req.body.email // Bắn email về cho Frontend
            });
        }

        // Bắt lỗi sai mật khẩu hoặc email
        if (error.message === "Email hoặc mật khẩu không chính xác") {
            return res.status(401).json({ trangThai: "Thất bại", thongBao: error.message });
        }

        // Lỗi hệ thống khác
        res.status(500).json({ trangThai: "Thất bại", chiTiet: error.message });
    }
};

// lấy thông tin profile cá nhân của user đang đăng nhập qua Token
const layThongTinCaNhan = async (req, res) => {
    try {
        const userId = req.user?.user_id;
        if (!userId) {
            return res.status(401).json({ trangThai: "Thất bại", thongBao: "Không tìm thấy thông tin xác thực từ Token!" });
        }

        const user = await userModel.timUserBangId(userId);
        if (!user) {
            return res.status(404).json({ trangThai: "Thất bại", thongBao: "Người dùng không tồn tại!" });
        }

        delete user.password;
        delete user.otp_code;
        delete user.otp_expires;

        return res.status(200).json({
            trangThai: "Thành công",
            duLieu: user
        });
    } catch (error) {
        return res.status(500).json({ trangThai: "Thất bại", chiTiet: error.message });
    }
};

// xử lí avatar của User
const uploadAvatar = async (req, res) => {
    try {
        // Lấy userId trực tiếp từ Token JWT đã giải mã (Bảo mật tuyệt đối, chống giả mạo user_id)
        const userId = req.user?.user_id || req.body.user_id;
        if (!userId) {
            return res.status(401).json({ trangThai: "Thất bại", thongBao: "Không tìm thấy thông tin xác thực từ Token!" });
        }

        if (!req.file) {
            return res.status(400).json({ trangThai: "Thất bại", thongBao: "Vui lòng chọn file ảnh!" });
        }

        // Tạo URL ảnh công khai dạng: http://<IP>:8080/uploads/avatars/filename.jpg
        const avatarUrl = `${req.protocol}://${req.get('host')}/uploads/avatars/${req.file.filename}`;

        // Gọi model cập nhật vào MySQL
        await userModel.capNhatAvatar(userId, avatarUrl);

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
        // Lấy userId trực tiếp từ Token JWT đã giải mã (Bảo mật tuyệt đối)
        const userId = req.user?.user_id || req.body.user_id;
        const { full_name, phone, gender, dob } = req.body;

        if (!userId) {
            return res.status(401).json({ trangThai: "Thất bại", thongBao: "Không tìm thấy thông tin xác thực từ Token!" });
        }

        if (!full_name) {
            return res.status(400).json({ trangThai: "Thất bại", thongBao: "Vui lòng nhập họ và tên!" });
        }

        await userModel.capNhatThongTinUser(userId, full_name, phone, gender, dob);

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

//quen mat khau
const forgotPass = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ trangThai: "Thất bại", thongBao: "Vui lòng cung cấp email!" });

        // Gọi Service gửi OTP
        await userService.guiOtpQuenMatKhau(email);

        res.status(200).json({ trangThai: "Thành công", thongBao: "Mã OTP đã được gửi đến email của bạn." });
    } catch (error) {

        if (error.message === "Tài khoản chưa được kích hoạt") {
            return res.status(403).json({
                trangThai: "Thất bại",
                thongBao: "Tài khoản chưa được kích hoạt. Vui lòng xác thực tài khoản trước!",
                maLoi: "NOT_ACTIVATED",
                email: req.body.email
            });
        }

        if (error.message === "Email không tồn tại trong hệ thống") {
            return res.status(404).json({ trangThai: "Thất bại", thongBao: error.message });
        }
        res.status(500).json({ trangThai: "Thất bại", chiTiet: error.message });
    }
};

const resetPass = async (req, res) => {
    try {
        const { email, otp, matKhauMoi } = req.body;

        if (!email || !otp || !matKhauMoi) {
            return res.status(400).json({ trangThai: "Thất bại", thongBao: "Vui lòng nhập đủ email, mã OTP và mật khẩu mới!" });
        }

        // Gọi Service đặt lại mật khẩu
        await userService.datLaiMatKhau(email, otp, matKhauMoi);

        res.status(200).json({ trangThai: "Thành công", thongBao: "Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay." });
    } catch (error) {
        // TRẢ LỖI OTP CHO FRONTEND THEO TỪNG TRƯỜNG HỢP:
        if (error.message === "Mã OTP không chính xác") {
            return res.status(400).json({ trangThai: "Thất bại", thongBao: error.message, maLoi: "OTP_INVALID" });
        }
        if (error.message === "Mã OTP đã hết hạn") {
            return res.status(400).json({ trangThai: "Thất bại", thongBao: error.message, maLoi: "OTP_EXPIRED" });
        }

        if (error.message === "Email không tồn tại trong hệ thống") {
            return res.status(404).json({ trangThai: "Thất bại", thongBao: error.message });
        }
        res.status(500).json({ trangThai: "Thất bại", chiTiet: error.message });
    }
};

module.exports = {
    layDanhSachUser,
    layThongTinCaNhan,
    taoUser,
    xacThucOTP,
    guiLaiOTP,
    dangNhap,
    uploadAvatar,
    capNhatThongTin,
    doiMatKhau,
    forgotPass,
    resetPass
};

