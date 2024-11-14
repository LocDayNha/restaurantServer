var express = require('express');
var router = express.Router();
var bookingModel = require("../../components/booking/BookingModel");
var tableModel = require("../../components/table/TableModel");
var userModel = require("../../components/user/UserModel");

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
                    return post ? res.status(200).json({ status: true, message: 'Đặt bàn thành công' }) :
                        res.status(400).json({status: false, result: false, message: 'Đặt bàn thất bại' });
                }
            } else if (listBooking.length == 0) {
                if (bookingDate <= currentDate.setHours(0, 0, 0, 0)) {
                    return res.status(400).json({status: false, result: false, message: 'Ngày không hợp lệ' });
                } else {
                    const post = await bookingModel.create(addNew);
                    return post ? res.status(200).json({ status: true, message: 'Đặt bàn thành công' }) :
                        res.status(400).json({status: false, result: false, message: 'Đặt bàn thất bại' });
                }
            }

        } else {
            res.status(400).json({ result: false, message: 'Chưa cập nhật thông tin cá nhân' })
        }
    } catch (error) {
        console.log(error);
        res.status(400).json({ result: false, message: "Thất bại" });
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

module.exports = router;

