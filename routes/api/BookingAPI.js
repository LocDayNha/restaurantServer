var express = require('express');
var router = express.Router();
const moment = require('moment');
var bookingModel = require("../../components/booking/BookingModel");
var tableModel = require("../../components/table/TableModel");
var userModel = require("../../components/user/UserModel");
var sendMail = require("../utils/mail");

//localhost:3000/booking/add
router.post('/add', async function (req, res, next) {
    try {
        const { user_id, table_id, dayBooking } = req.body;
        const currentDate = new Date();
        let timeNow = currentDate.toLocaleTimeString('vi-VN');
        let dayNow = currentDate.toLocaleDateString('vi-VN');

        const [day, month, year] = dayBooking.split('/'); // dayBooking: 06/10/2024
        const bookingDate = new Date(`${year}-${month}-${day}`);

        const user = await userModel.findById(user_id);
        const table = await tableModel.findById(table_id).populate('timeline_id');
        const listBooking = await bookingModel.find().populate({
            path: 'table_id',
            populate: {
                path: 'timeline_id',
                select: 'name'
            }
        });

        const addNew = { user_id, table_id, dayBooking, timeCreate: timeNow, dayCreate: dayNow };
        let check = false;
        if (user.name && user.phoneNumber) {
            if (listBooking.length > 0) {
                if (bookingDate <= currentDate.setHours(0, 0, 0, 0)) {
                    return res.status(400).json({ status: false, result: false, message: 'Ngày không hợp lệ' });
                } else {
                    listBooking.forEach(item => {
                        if (item.dayBooking === dayBooking) {
                            const timeTable = table.timeline_id.name;
                            const timeItem = item.table_id.timeline_id.name;
                            if (timeTable !== timeItem) {
                                check = true;
                            } else {
                                check = false;
                            }
                        } else {
                            check = true;
                        }
                    })
                    const post = check && await bookingModel.create(addNew);
                    return post ? res.status(200).json({ status: true, result: true, message: 'Đặt bàn thành công' }) :
                        res.status(400).json({ status: false, result: false, message: 'Đặt bàn thất bại' });
                }
            } else if (listBooking.length == 0) {
                if (bookingDate <= currentDate.setHours(0, 0, 0, 0)) {
                    return res.status(400).json({ status: false, result: false, message: 'Ngày không hợp lệ' });
                } else {
                    const post = await bookingModel.create(addNew);
                    return post ? res.status(200).json({ status: true, result: true, message: 'Đặt bàn thành công' }) :
                        res.status(400).json({ status: false, result: false, message: 'Đặt bàn thất bại' });
                }
            }

        } else {
            res.status(400).json({ status: false, result: false, message: 'Chưa cập nhật thông tin cá nhân' })
        }
    } catch (error) {
        console.error("Lỗi khi gửi email:", err);
        return res.status(400).json({ status: false, message: "Gửi Mail thất bại" });
    }
});

//localhost:3000/booking/getByUser
router.get('/getByUser/:id', async function (req, res, next) {
    try {
        const user = await userModel.findOne({ _id: req.params.id });
        if (!user) {
            return res.status(400).json({ "status": false, "message": "userId không tồn tại" });
        }
        const listBooking = await bookingModel.find({ user_id: user._id }).populate({
            path: 'table_id',
            populate: {
                path: 'timeline_id',
                select: 'name'
            }
        });
        res.status(200).json({ result: true, message: "Thanh cong", listBooking });
    } catch (error) {
        console.log(error);
        res.status(400).json({ result: false, message: "That Bai" });
    }
});

//localhost:3000/booking/getByEmail
router.get('/getByEmail', async function (req, res, next) {
    try {
        const { email } = req.body;
        const user = await userModel.findOne({ email: email });
        if (!user) {
            return res.status(400).json({ "status": false, "message": "User không tồn tại" });
        }
        const list = await bookingModel.find({ user_id: user._id }).populate('table_id');
        res.status(200).json(list);
    } catch (error) {
        res.status(400).json({ "status": false, "message": "That Bai" });
    }
});

//localhost:3000/booking/getByDay
router.get('/getByDay', async function (req, res, next) {
    try {
        const currentDate = new Date();
        const day = String(currentDate.getDate()).padStart(2, '0');
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const year = currentDate.getFullYear();
        const today = `${day}/${month}/${year}`;

        const listBooking = await bookingModel.find({ dayBooking: today }).populate({
            path: 'user_id',
            select: 'email name phoneNumber'
        })
            .populate({
                path: 'table_id',
                populate: {
                    path: 'timeline_id',
                    select: 'name'
                }
            });
        res.status(200).json({ "status": true, "message": "Thanh Cong", listBooking });
    } catch (error) {
        res.status(400).json({ "status": false, "message": "That Bai", error });
    }
});

//localhost:3000/booking/getByNumber
router.get('/getByNumber', async function (req, res, next) {
    try {
        const { number } = req.body;
        const table = await tableModel.findOne({ number: number });
        if (!table) {
            return res.status(400).json({ "status": false, "message": "Số bàn không tồn tại" });
        }
        const list = await bookingModel.find({ table_id: table._id }).populate('table_id');
        res.status(200).json(list);
    } catch (error) {
        res.status(400).json({ "status": false, "message": "That Bai" });
    }
});

//localhost:3000/booking/deleteById
router.delete('/deleteById/:id', async function (req, res, next) {
    try {
        const { id } = req.params;
        await bookingModel.findByIdAndDelete(id);
        res.status(200).json({ "status": true, "message": "Thanh Cong" });
    } catch (error) {
        res.status(400).json({ "status": false, "message": "That Bai" });
    }
});

//localhost:3000/booking/notification
router.get('/notification', async function (req, res, next) {
    try {
        const tomorrow = moment().add(1, 'days').format('DD/MM/YYYY');

        const listEmailBooking = await bookingModel.find({ dayBooking: tomorrow, notification: false }).populate([
            {
                path: 'table_id',
                populate: {
                    path: 'timeline_id',
                    select: 'name'
                }
            },
            {
                path: 'user_id',
                select: 'name email'
            }
        ]);

        const userInfor = listEmailBooking.map(booking => ({
            id: booking._id,
            name: booking.user_id.name,
            email: booking.user_id.email,
            dayBooking: booking.dayBooking,
            timeline: booking.table_id.timeline_id.name
        }));

        const failedEmails = [];

        // Lặp qua từng người dùng để gửi email
        for (const user of userInfor) {
            const { id, name, email, dayBooking, timeline } = user;

            const subject = 'Thông Báo Đặt Bàn - Phoenix Restaurant';
            const content = `
                <!DOCTYPE html>
                <html lang="vi">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Thông Báo Đặt Bàn - Phoenix Restaurant</title>
                    <style>
                        body {
                            font-family: 'Arial', sans-serif;
                            background-color: #f4f4f9;
                            margin: 0;
                            padding: 0;
                            color: #333;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            background-color: #ffffff;
                            padding: 30px;
                            border-radius: 10px;
                            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                            border: 1px solid #e5e5e5;
                        }
                        .header {
                            text-align: center;
                            margin-bottom: 30px;
                        }
                        .header img {
                            max-width: 180px;
                            height: auto;
                            margin-bottom: 20px;
                        }
                        .header h1 {
                            color: #d9534f;
                            font-size: 32px;
                            margin-bottom: 10px;
                        }
                        .header p {
                            font-size: 18px;
                            color: #555;
                            margin-top: 0;
                        }
                        .content {
                            font-size: 16px;
                            line-height: 1.7;
                            color: #555;
                            margin-bottom: 30px;
                        }
                        .content p {
                            margin: 12px 0;
                        }
                        .highlight {
                            color: #d9534f;
                            font-weight: bold;
                        }
                        .footer {
                            text-align: center;
                            font-size: 14px;
                            color: #777;
                            margin-top: 40px;
                            border-top: 1px solid #e5e5e5;
                            padding-top: 20px;
                        }
                        .footer a {
                            color: #d9534f;
                            text-decoration: none;
                        }
                        .footer a:hover {
                            text-decoration: underline;
                        }
                        /* Responsive styling for smaller screens */
                        @media (max-width: 600px) {
                            .container {
                                padding: 20px;
                            }
                            .header h1 {
                                font-size: 28px;
                            }
                            .content {
                                font-size: 14px;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <img src="https://firebasestorage.googleapis.com/v0/b/phoenix-restaurant-401d8.appspot.com/o/343aa513-aed5-41e9-862c-687833e00b31.png?alt=media&token=b39280de-e844-41ec-b81f-d07ca5661c39" alt="Phoenix Restaurant Logo">
                            <h1>Thông Báo Đặt Bàn</h1>
                            <p>Xin chào quý khách ${name},</p>
                        </div>
                        <div class="content">
                            <p>Nhà hàng Phoenix Restaurant xin thông báo. Quý khách có lịch hẹn đặt bàn tại nhà hàng vào <strong>${timeline}</strong> ngày <strong>${dayBooking}</strong>.</p>
                            <p>Quý khách vui lòng đến đúng thời gian lịch hẹn đặt bàn. Nếu quý khách đến muộn sau thời gian đặt bàn là <span class="highlight">10 phút</span>, <strong>bàn sẽ bị hủy</strong>.</p>
                            <p>Phoenix Restaurant rất mong được chào đón quý khách tại nhà hàng của chúng tôi!</p>
                        </div>
                        <div class="footer">
                            <p>Cảm ơn quý khách đã chọn Phoenix Restaurant. Nếu có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua email <a href="mailto:phoenixrestaurant13@gmail.com">phoenixrestaurant13@gmail.com</a>.</p>
                        </div>
                    </div>
                </body>
                </html>
            `;

            const mailOptions = {
                from: "Phoenix Restaurant <phoenixrestaurant13@gmail.com>", // Người gửi
                to: email, // Người nhận
                subject: subject, // Tiêu đề
                html: content // Nội dung HTML
            };

            try {
                await sendMail.transporter.sendMail(mailOptions);

                // Cập nhật trạng thái notification thành true
                await bookingModel.updateOne({ _id: id }, { $set: { notification: true } });

            } catch (err) {
                console.error(`Lỗi khi gửi email cho ${email}:`, err);
                failedEmails.push({ name, email });
            }
        }

        return res.status(200).json({
            status: true,
            message: failedEmails.length
                ? `Gửi thông báo thành công cho ${userInfor.length - failedEmails.length} người. Không thể gửi cho ${failedEmails.length} người.`
                : 'Gửi thông báo thành công cho tất cả người dùng.',
            failedEmails
        });
    } catch (err) {
        console.error("Lỗi khi gửi email:", err);
        return res.status(400).json({ status: false, message: "Gửi Mail thất bại" });
    }
});


module.exports = router;

