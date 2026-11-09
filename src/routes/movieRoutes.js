const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');


//Phân luồng:
// lấy danh sách phim đang chiếu 
router.get('/now-showing', movieController.getNowShowing);

// lấy danh sach phim sắp chiếu
router.get('/coming-soon', movieController.getComingSoon);

// tìm kiếm phim nhanh theo tên
router.get('/search', movieController.searchMovies);

// lọc phim nâng cao theo nhiều tiêu chí: trạng thái, thể loại, năm phát hành
router.get('/filter', movieController.filterMovies);
module.exports = router;