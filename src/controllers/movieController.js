const movieService = require('../services/movieService');

// lấy danh sách phim đang chiếu
const getNowShowing = async (req, res) => {
    try {
        const danhSachPhim = await movieService.layPhimDangChieu();
        res.status(200).json({
            trangThai: "Thành công",
            soLuong: danhSachPhim.length,
            duLieu: danhSachPhim
        });
    } catch (error) {
        res.status(500).json({ trangThai: "Thất bại", chiTiet: error.message });
    }
};

// lấy danh sách phim sắp chiếu
const getComingSoon = async (req, res) => {
    try {
        const danhSachPhim = await movieService.layPhimSapChieu();
        res.status(200).json({
            trangThai: "Thành công",
            soLuong: danhSachPhim.length,
            duLieu: danhSachPhim
        });
    } catch (error) {
        res.status(500).json({ trangThai: "Thất bại", chiTiet: error.message });
    }
};

module.exports = {
    getNowShowing,
    getComingSoon
};