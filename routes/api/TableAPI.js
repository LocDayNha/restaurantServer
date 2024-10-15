var express = require('express');
var router = express.Router();
var tableModel = require("../../components/table/TableModel");
var upload = require("../utils/upload");
var timelineModel = require("../../components/timeline/TimelineModel");

//localhost:3000/table/add
router.post('/add', async function (req, res, next) {
    try {
        const { number, userNumber, timeline_id } = req.body;
        const addNew = { number, userNumber, timeline_id };
        await tableModel.create(addNew);
        res.status(200).json({ "status": true, "message": "Thanh Cong" });
    } catch (error) {
        res.status(400).json({ "status": false, "message": "That Bai" });
    }
});

//localhost:3000/table/getByNumber
router.post('/getByNumber', async function (req, res, next) {
    try {
        const { number } = req.body;
        const list = await tableModel.find({ number: number }).populate('timeline_id');
        if (list.isOrder === false) {
            res.status(200).json(list);
        } else {
            es.status(400).json({ "status": false, "message": "That Bai" });
        }
    } catch (error) {
        res.status(400).json({ "status": false, "message": "That Bai" });
    }
});

//localhost:3000/table/getById
router.get('/getById/:id', async function (req, res, next) {
    try {
        const { id } = req.params;
        const list = await tableModel.findById(id).populate('timeline_id');
        res.status(200).json(list);
    } catch (error) {
        res.status(400).json({ "status": false, "message": "That Bai" });
    }
});

//localhost:3000/table/editById
router.post('/editById/:id', async function (req, res, next) {
    try {
        const { id } = req.params;
        const { timeline_id } = req.body;
        const itemEdit = await tableModel.findById(id);
        if (itemEdit) {
            itemEdit.timeline_id = timeline_id ? timeline_id : itemEdit.timeline_id;
            await itemEdit.save();
            res.status(200).json({ "status": true, "message": "Thanh Cong" });
        } else {
            res.status(400).json({ "status": false, "message": "That Bai" });
        }
    } catch (error) {
        res.status(400).json({ "status": false, "message": "That Bai" });
    }
});

//localhost:3000/table/deleteById
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


