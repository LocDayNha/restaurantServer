var express = require('express');
var router = express.Router();
var bookingModel = require("../../components/booking/BookingModel");
var tableModel = require("../../components/table/TableModel");
var userModel = require("../../components/user/UserModel");

//localhost:3000/booking/add
router.post('/add', async function (req, res, next) {
    try {
        const { user_id, table_id, day } = req.body;
        const addNew = { user_id, table_id, day };
        await bookingModel.create(addNew);
        const table = await tableModel.findById(table_id);
        if (table) {
            table.isOrder = true;
            await table.save();
            return res.json({ status: true, message: "Cập nhật trạng thái thành công" });
        } else {
            return res.json({ status: true, message: "Cập nhật trạng thái thất bại" });
        }
    } catch (error) {
        res.status(400).json({ "status": false, "message": "That Bai" });
    }
});

//localhost:3000/booking/getByUser
router.get('/getByUser/:id', async function (req, res, next) {
    try {
        const user = await userModel.findOne({ _id: req.params.id });
        if (!user) {
            return res.status(400).json({ "status": false, "message": "userId không tồn tại" });
        }
        const listbooking = await bookingModel.find({ user_id: user._id }).populate('table_id');
        res.status(200).json(listbooking);
    } catch (error) {
        res.status(400).json({ "status": false, "message": "That Bai" });
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
        const { day } = req.body;
        const list = await bookingModel.find({ day: day }).populate('table_id');
        res.status(200).json(list);
    } catch (error) {
        res.status(400).json({ "status": false, "message": "That Bai" });
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

