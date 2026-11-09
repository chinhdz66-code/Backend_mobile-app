const nodemailer = require('nodemailer');

//xử lý gửi mail OTP
const guiMailOTP = async (emailNhan, maOTP) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: '"CQS Cinema" <' + process.env.EMAIL_USER + '>',
            to: emailNhan,
            subject: 'Mã OTP Xác Nhận Đăng Ký Tài Khoản',
            html: `<h1>Mã OTP của bạn là: ${maOTP}</h1><p>Mã hết hạn trong 3 phút.</p>`
        };

        await transporter.sendMail(mailOptions);
        console.log("Đã gửi email OTP thành công tới:", emailNhan);
    } catch (error) {
        console.error(" LỖI TẠI CON BOT GỬI MAIL:", error);
        throw new Error("Không thể kết nối tới Gmail để gửi OTP. Vui lòng kiểm tra lại EMAIL_USER và EMAIL_PASS.");
    }
};

module.exports = { 
    guiMailOTP 
};