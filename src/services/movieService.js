const movieModel = require('../models/movieModel');

// xử lý lấy danh sách phim đang chiếu
const layPhimDangChieu = async () => {
    // Đang chiếu: Phim mới ra mắt (gần đây nhất) xếp lên đầu 
    const movies = await movieModel.layPhimTheoTrangThai('now_showing', 'DESC');
    return movies;
};

// xử lý lấy danh sách phim sắp chiếu
const layPhimSapChieu = async () => {
    // Sắp chiếu: Phim chiếu tuần sau xếp trên, phim chiếu năm sau xếp dưới 
    const movies = await movieModel.layPhimTheoTrangThai('coming_soon', 'ASC');
    return movies;
};

// xử lý tìm kiếm phim nhanh theo tên
const timKiemPhimNhanh = async (keyword) => {
    return await movieModel.timKiemTheoTen(keyword);
};

// xử lý lọc phim nâng cao theo nhiều tiêu chí: trạng thái, thể loại, năm phát hành
const locPhim = async (status, genre, year) => {
    return await movieModel.locPhimNangCao(status, genre, year);
};

module.exports = {
    layPhimDangChieu,
    layPhimSapChieu,
    timKiemPhimNhanh,
    locPhim
};