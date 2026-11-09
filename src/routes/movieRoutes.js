const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');


//Phân luồng:
// lấy danh sách phim đang chiếu 
router.get('/now-showing', movieController.getNowShowing);

// lấy danh sach phim sắp chiếu
router.get('/coming-soon', movieController.getComingSoon);

module.exports = router;