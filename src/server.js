require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path'); //  Bổ sung thư viện path để xử lý đường dẫn thư mục

// Thiết lập Json cho sever đọc 
app.use(express.json());

// Kiểm tra kết nối tới Database
const pool = require('./database');

// Mở quyền truy cập công khai thư mục uploads qua URL
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));


// dự phòng docker/ không có thì dung port 8080
const PORT = process.env.PORT || 8080;

// API test
app.get('/', (req, res) => {
    res.send('Backend API Đặt Vé Phim!');
});

// Nạp bản đồ phân luồng của khu vực Users
const userRoutes = require('./routes/userRoutes');

// Định tuyến tổng: Mọi luồng đi vào /api/users đều phải chạy qua userRoutes
app.use('/api/users', userRoutes);

// Cho sever chạy và bắt đầu lắng nghe các request từ client
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server đang chạy tại http://0.0.0.0:${PORT}`);
});