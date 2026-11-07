require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());

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

// dự phòng docker/ không có thì dung port 8080
const PORT = process.env.PORT || 8080;

// API test
app.get('/', (req, res) => {
    res.send('Backend API Đặt Vé Phim! - đã có CI/CD');
});

// Nạp bản đồ phân luồng của khu vực Users
const userRoutes = require('./routes/userRoutes');

// Định tuyến tổng: Mọi luồng đi vào /api/users đều phải chạy qua userRoutes
app.use('/api/users', userRoutes);

// Cho sever chạy và bắt đầu lắng nghe các request từ client
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});