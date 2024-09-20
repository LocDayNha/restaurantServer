var express = require('express');
var router = express.Router();
var menuModel = require("../../components/menu/MenuModel");
var upload = require("../utils/upload");
var categoryModel = require("../../components/category/CategoryModel");

//localhost:3000/menu/add
router.post('/add', [upload.single('image')], async function (req, res, next) {
    try {
        const { name, price, category, image } = req.body;

        try {
            const { file } = req;
            if (!file) {
                return res.json({ status: 0, link: "" });
            } else {
                image = `http://localhost:3000/images/${file.filename}`;
                return res.json({ status: 1, url: image });
            }
        } catch (error) {
            res.status(400).json({ "status": false, "message": "That Bai" });
        }

        const addNew = { name, price, image, category };
        await menuModel.create(addNew);
        res.status(200).json({ "status": true, "message": "Thanh Cong" });
    } catch (error) {
        res.status(400).json({ "status": false, "message": "That Bai" });
    }
});

//localhost:3000/menu/getByCategory
router.get('/getByCategory', async function (req, res, next) {
    try {
        const category = await categoryModel.findOne({ category: req.query.category });
        if (!category) {
            return res.status(400).json({ "status": false, "message": "Danh mục không tồn tại" });
        }
        const list = await menuModel.find({ category: category._id }).populate('category');
        res.status(200).json(list);
    } catch (error) {
        res.status(400).json({ "status": false, "message": "That Bai" });
    }
});

//localhost:3000/menu/getByName
router.get('/getByName', async function (req, res, next) {
    try {
        const { name } = req.body;
        const list = await menuModel.find({ name: name }).populate('category');
        res.status(200).json(list);
    } catch (error) {
        res.status(400).json({ "status": false, "message": "That Bai" });
    }
});

//localhost:3000/menu/editById
router.post('/editById', async function (req, res, next) {
    try {
        const { id } = req.params;
        const { name, price } = req.body;
        const itemEdit = await menuModel.findById(id);
        if (itemEdit) {
            itemEdit.name = name ? name : itemEdit.name;
            itemEdit.price = price ? price : itemEdit.price;
            await itemEdit.save();
            res.status(200).json({ "status": true, "message": "Thanh Cong" });
        } else {
            res.status(400).json({ "status": false, "message": "That Bai" });
        }
    } catch (error) {
        res.status(400).json({ "status": false, "message": "That Bai" });
    }
});

//localhost:3000/menu/deleteById
router.delete('/deleteById', async function (req, res, next) {
    try {
        const { id } = req.params;
        await menuModel.findByIdAndDelete(id);
        res.status(200).json({ "status": true, "message": "Thanh Cong" });
    } catch (error) {
        res.status(400).json({ "status": false, "message": "That Bai" });
    }
});



module.exports = router;