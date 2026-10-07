require('dotenv').config();
const express = require('express');

const app = express();

// Thiết lập Json cho sever đọc 
app.use(express.json());

// Kiểm tra kết nối tới Database
const pool = require('./database');

// dự phòng docker/ không có thì dung port 8080
const PORT = process.env.PORT || 8080;

// API test
app.get('/', (req, res) => {
    res.send('Backend API Đặt Vé Phim!');
});

// Cho sever chạy và bắt đầu lắng nghe các request từ client
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});