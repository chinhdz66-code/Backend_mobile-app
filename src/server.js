require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path'); //  Bổ sung thư viện path để xử lý đường dẫn thư mục

// Thiết lập Json cho sever đọc 
app.use(express.json());

//trả lỗi về nếu JSON sai cú pháp
app.use((err, req, res, next) => {
    // Nếu lỗi là do sai cú pháp JSON (SyntaxError)
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        // In một dòng thông báo nhỏ cho gọn log, không in stack trace dài ngoằng
        console.warn('Cảnh báo: Client gửi lên JSON sai cú pháp!');
        
        // Trả về lỗi cho Postman đọc
        return res.status(400).json({ 
            trangThai: "Thất bại", 
            thongBao: "Dữ liệu JSON gửi lên bị sai cú pháp." 
        });
    }
    // Nếu là lỗi khác thì cho đi tiếp
    next();
});

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

// Nạp bản đồ phân luồng của khu vực Movies
const movieRoutes = require('./routes/movieRoutes');

// Định tuyến tổng: Mọi luồng đi vào /api/users đều phải chạy qua userRoutes
app.use('/api/users', userRoutes);

// Định tuyến tổng: Mọi luồng đi vào /api/movies đều phải chạy qua movieRoutes
app.use('/api/movies', movieRoutes);

// Cho sever chạy và bắt đầu lắng nghe các request từ client
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server đang chạy tại http://0.0.0.0:${PORT}`);
});