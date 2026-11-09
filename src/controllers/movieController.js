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

// tìm kiếm phim nhanh theo tên
const searchMovies = async (req, res) => {
    try {
        const { keyword } = req.query;
        
        // Bắt lỗi nếu frontend gọi API mà không truyền từ khóa
        if (!keyword) {
            return res.status(400).json({ 
                trangThai: "Thất bại", 
                chiTiet: "Vui lòng nhập từ khóa tìm kiếm" 
            });
        }

        const danhSachPhim = await movieService.timKiemPhimNhanh(keyword);
        res.status(200).json({
            trangThai: "Thành công",
            soLuong: danhSachPhim.length,
            duLieu: danhSachPhim
        });
    } catch (error) {
        res.status(500).json({ trangThai: "Thất bại", chiTiet: error.message });
    }
};

// Bộ lọc phim nâng cao theo nhiều tiêu chí: trạng thái, thể loại, năm phát hành
const filterMovies = async (req, res) => {
    try {
        const { status, genre, year } = req.query;
        const danhSachPhim = await movieService.locPhim(status, genre, year);
        
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
    getComingSoon,
    searchMovies,
    filterMovies
};