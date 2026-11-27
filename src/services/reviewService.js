const reviewModel = require('../models/reviewModel');
const movieModel = require('../models/movieModel');

// Lấy danh sách đánh giá của một bộ phim theo movieId
const layDanhSachDanhGia = async (movieId) => {
    if (isNaN(movieId)) {
        throw new Error("ID phim không hợp lệ");
    }
    return await reviewModel.layDanhGiaTheoPhim(movieId);
};

// Tạo đánh giá cho một bộ phim
const taoDanhGia = async (userId, movieId, rating, comment) => {
    if (!movieId || isNaN(movieId)) {
        throw new Error("ID phim không hợp lệ");
    }

    const soSao = Number(rating);
    if (!Number.isInteger(soSao) || soSao < 1 || soSao > 5) {
        throw new Error("Số sao đánh giá phải là số nguyên từ 1 đến 5");
    }

    const phim = await movieModel.layChiTietPhim(movieId);
    if (!phim) {
        throw new Error("Không tìm thấy bộ phim này");
    }

    const daDanhGia = await reviewModel.kiemTraDaDanhGia(userId, movieId);
    if (daDanhGia) {
        throw new Error("Bạn đã đánh giá bộ phim này rồi");
    }

    const noiDung = comment ? comment.trim() : null;
    const reviewId = await reviewModel.themDanhGia(userId, movieId, soSao, noiDung);

    return {
        review_id: reviewId,
        user_id: userId,
        movie_id: Number(movieId),
        rating: soSao,
        comment: noiDung
    };
};

module.exports = {
    layDanhSachDanhGia,
    taoDanhGia
};