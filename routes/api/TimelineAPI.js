var express = require('express');
var router = express.Router();
var timelineModel = require("../../components/timeline/TimelineModel");

//localhost:3000/timeline/add
router.post('/add', async function (req, res, next) {
    try {
        const { name } = req.body;
        const addNew = { name };
        await timelineModel.create(addNew);
        res.json(addNew)
    } catch (error) {
        res.status(400).json({ "status": false, "message": "That Bai" });
    }
});

//localhost:3000/timeline/get
router.get('/get', async function (req, res, next) {
    try {
        const list = await timelineModel.find();
        res.status(200).json(list);
    } catch (error) {
        res.status(400).json({ "status": false, "message": "That Bai" });
    }
});

//localhost:3000/timeline/editById/
router.post('/editById/:id', async function (req, res, next) {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const itemEdit = await timelineModel.findById(id);
        if (itemEdit) {
            itemEdit.name = name ? name : itemEdit.name;
            await itemEdit.save();
            res.status(200).json({ "status": true, "message": "Thanh Cong" });
        } else {
            res.status(400).json({ "status": false, "message": "That Bai" });
        }
    } catch (error) {
        res.status(400).json({ "status": false, "message": "That Bai" });
    }
});

//localhost:3000/timeline/deleteById
router.delete('/deleteById/:id', async function (req, res, next) {
    try {
        const { id } = req.params;
        await timelineModel.findByIdAndDelete(id);
        res.status(200).json({ "status": true, "message": "Thanh Cong" });
    } catch (error) {
        res.status(400).json({ "status": false, "message": "That Bai" });
    }
});

module.exports = router;
