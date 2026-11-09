const nodemailer = require('nodemailer');

//xử lý gửi mail OTP
const guiMailOTP = async (emailNhan, maOTP) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.log(`[DEV MODE] Mã OTP gửi tới ${emailNhan} là: ${maOTP}`);
            return;
        }

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
        console.error(" LỖI GỬI MAIL (Đã in mã OTP ở console):", error);
        console.log(`[DEV MODE OTP] Mã OTP dự phòng cho ${emailNhan} là: ${maOTP}`);
    }
};

module.exports = { 
    guiMailOTP 
};