const nodemailer = require('nodemailer');

//xử lý gửi mail OTP
const guiMailOTP = async (emailNhan, maOTP, loai = 'DANG_KY') => {
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

        // Tự động thay đổi nội dung dựa vào tham số 'loai'
        let tieuDe = '';
        let noiDungHtml = '';
        
        // quên mật khẩu
        if (loai === 'QUEN_MAT_KHAU') {
            tieuDe = 'Mã OTP Khôi Phục Mật Khẩu - CQS Cinema';
            noiDungHtml = `<h1>Mã OTP khôi phục mật khẩu của bạn là: ${maOTP}</h1><p>Vui lòng không chia sẻ mã này. Mã hết hạn trong 3 phút.</p>`;
        } else {
            // đăng ký tài khoản
            tieuDe = 'Mã OTP Xác Nhận Đăng Ký Tài Khoản - CQS Cinema';
            noiDungHtml = `<h1>Mã OTP đăng ký tài khoản của bạn là: ${maOTP}</h1><p>Mã hết hạn trong 3 phút.</p>`;
        }

        const mailOptions = {
            from: '"CQS Cinema" <' + process.env.EMAIL_USER + '>',
            to: emailNhan,
            subject: tieuDe,
            html: noiDungHtml
        };

        await transporter.sendMail(mailOptions);
        console.log("Đã gửi email OTP thành công tới:", emailNhan);
    } catch (error) {
        console.error("LỖI GỬI MAIL (Đã in mã OTP ở console):", error);
        console.log(`[DEV MODE OTP] Mã OTP dự phòng cho ${emailNhan} là: ${maOTP}`);
    }
};


module.exports = { 
    guiMailOTP 
};