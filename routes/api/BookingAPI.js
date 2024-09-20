var express = require('express');
var router = express.Router();
var bookingModel = require("../../components/booking/BookingModel");
var tableModel = require("../../components/table/TableModel");
var userModel = require("../../components/user/UserModel");

//localhost:3000/booking/add
router.post('/add', async function (req, res, next) {
    try {
        const { user, table } = req.body;
        const addNew = { user, table };
        await bookingModel.create(addNew);
        res.status(200).json({ "status": true, "message": "Thanh Cong" });
    } catch (error) {
        res.status(400).json({ "status": false, "message": "That Bai" });
    }
});

//localhost:3000/booking/getByUser
router.get('/getByUser', async function (req, res, next) {
    try {
        const user = await userModel.findOne({ user: req.params.user });
        if (!user) {
            return res.status(400).json({ "status": false, "message": "userId không tồn tại" });
        }
        const listbooking = await bookingModel.find({ user: user._id }).populate('table');
        res.status(200).json(listbooking);
    } catch (error) {
        res.status(400).json({ "status": false, "message": "That Bai" });
    }
});

//localhost:3000/booking/deleteById
router.delete('/deleteById', async function (req, res, next) {
    try {
        const { id } = req.params;
        await bookingModel.findByIdAndDelete(id);
        res.status(200).json({ "status": true, "message": "Thanh Cong" });
    } catch (error) {
        res.status(400).json({ "status": false, "message": "That Bai" });
    }
});

module.exports = router;

