var express = require('express');
var router = express.Router();
var tableModel = require("../../components/table/TableModel");
var upload = require("../utils/upload");
var timelineModel = require("../../components/timeline/TimelineModel");

//localhost:3000/table/add
router.post('/add', async function (req, res, next) {
    try {
        const { dayTime, number, userNumber, timeline } = req.body;
        const addNew = { dayTime, number, userNumber, timeline };
        await tableModel.create(addNew);
        res.status(200).json({ "status": true, "message": "Thanh Cong" });
    } catch (error) {
        res.status(400).json({ "status": false, "message": "That Bai" });
    }
});

//localhost:3000/table/getByNumber
router.get('/getByNumber', async function (req, res, next) {
    try {
        const { number } = req.body;
        const list = await tableModel.find({ number: number }).populate('timeline');
        res.status(200).json(list);
    } catch (error) {
        res.status(400).json({ "status": false, "message": "That Bai" });
    }
});

//localhost:3000/menu/editById
router.post('/editById', async function (req, res, next) {
    try {
        const { id } = req.params;
        const { dayTime } = req.body;
        const itemEdit = await tableModel.findById(id);
        if (itemEdit) {
            itemEdit.dayTime = dayTime ? dayTime : itemEdit.dayTime;
            await itemEdit.save();
            res.status(200).json({ "status": true, "message": "Thanh Cong" });
        } else {
            res.status(400).json({ "status": false, "message": "That Bai" });
        }
    } catch (error) {
        res.status(400).json({ "status": false, "message": "That Bai" });
    }
});

//localhost:3000/list/deleteById
router.delete('/deleteById', async function (req, res, next) {
    try {
        const { id } = req.params;
        await tableModel.findByIdAndDelete(id);
        res.status(200).json({ "status": true, "message": "Thanh Cong" });
    } catch (error) {
        res.status(400).json({ "status": false, "message": "That Bai" });
    }
});

module.exports = router;


