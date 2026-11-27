const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middlewares/authMiddleware');

// Phân luồng:

// Lấy danh sách đánh giá của một bộ phim theo movieId
router.get('/movie/:movieId', reviewController.getReviewsByMovie);

// Tạo đánh giá cho một bộ phim (yêu cầu xác thực người dùng)
router.post('/', authMiddleware.xacThucToken, reviewController.createReview);

module.exports = router;