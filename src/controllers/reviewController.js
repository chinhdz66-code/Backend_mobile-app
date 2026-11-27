const reviewService = require('../services/reviewService');

// Lấy danh sách đánh giá của một bộ phim theo movieId
const getReviewsByMovie = async (req, res) => {
    try {
        const { movieId } = req.params;
        const danhSach = await reviewService.layDanhSachDanhGia(movieId);

        res.status(200).json({
            trangThai: "Thành công",
            soLuong: danhSach.length,
            duLieu: danhSach
        });
    } catch (error) {
        if (error.message === "ID phim không hợp lệ") {
            return res.status(400).json({ trangThai: "Thất bại", chiTiet: error.message });
        }
        res.status(500).json({ trangThai: "Thất bại", chiTiet: error.message });
    }
};

// Tạo đánh giá cho một bộ phim
const createReview = async (req, res) => {
    try {
        const userId = req.user?.user_id;
        if (!userId) {
            return res.status(401).json({ trangThai: "Thất bại", chiTiet: "Không tìm thấy thông tin xác thực từ Token" });
        }

        const { movie_id, rating, comment } = req.body;
        const ketQua = await reviewService.taoDanhGia(userId, movie_id, rating, comment);

        res.status(201).json({
            trangThai: "Thành công",
            duLieu: ketQua
        });
    } catch (error) {
        const loiClient = [
            "ID phim không hợp lệ",
            "Số sao đánh giá phải là số nguyên từ 1 đến 5",
            "Bạn đã đánh giá bộ phim này rồi"
        ];
        if (loiClient.includes(error.message)) {
            return res.status(400).json({ trangThai: "Thất bại", chiTiet: error.message });
        }
        if (error.message === "Không tìm thấy bộ phim này") {
            return res.status(404).json({ trangThai: "Thất bại", chiTiet: error.message });
        }
        res.status(500).json({ trangThai: "Thất bại", chiTiet: error.message });
    }
};

module.exports = {
    getReviewsByMovie,
    createReview
};