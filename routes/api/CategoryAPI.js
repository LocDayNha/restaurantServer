var express = require('express');
var router = express.Router();
var categoryModel = require("../../components/category/CategoryModel");

//localhost:3000/category/add
router.post('/add', async function (req, res, next) {
    try {
        const { name, image } = req.body;
        const addNew = { name, image };
        await categoryModel.create(addNew);
        res.json(addNew)
    } catch (error) {
        res.status(400).json({ "status": false, "message": "That Bai" });
    }
});

//localhost:3000/category/get
router.get('/get', async function (req, res, next) {
    try {
        const list = await categoryModel.find();
        res.status(200).json(list);
    } catch (error) {
        res.status(400).json({ "status": false, "message": "That Bai" });
    }
});

//localhost:3000/category/getCategoryById/
router.get('/getCategoryById/:id', async function (req, res, next) {
    try {
        const {id} = req.params;
        const list = await categoryModel.findById(id);
        res.status(200).json(list);
    } catch (error) {
        res.status(400).json({ "status": false, "message": "That Bai" });
    }
});

//localhost:3000/category/editById
router.post('/editById/:id', async function (req, res, next) {
    try {
        const { id } = req.params;
        const { name, image } = req.body;
        const itemEdit = await categoryModel.findById(id);
        if (itemEdit) {
            itemEdit.name = name ? name : itemEdit.name;
            itemEdit.image = image ? image : itemEdit.image;
            await itemEdit.save();
            res.status(200).json({ "status": true, "message": "Thanh Cong" });
        } else {
            res.status(400).json({ "status": false, "message": "That Bai" });
        }
    } catch (error) {
        res.status(400).json({ "status": false, "message": "That Bai" });
    }
});

//localhost:3000/category/deleteById/
router.delete('/deleteById/:id', async function (req, res, next) {
    try {
        const { id } = req.params;
        await categoryModel.findByIdAndDelete(id);
        res.status(200).json({ "status": true, "message": "Thanh Cong" });
    } catch (error) {
        res.status(400).json({ "status": false, "message": "That Bai" });
    }
});

module.exports = router;