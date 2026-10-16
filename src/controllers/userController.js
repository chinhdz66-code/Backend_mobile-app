const userModel = require('../models/userModel');

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

module.exports = { layDanhSachUser };