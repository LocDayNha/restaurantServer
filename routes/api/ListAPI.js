var express = require('express');
var router = express.Router();
var menuModel = require("../../components/menu/MenuModel");
var listModel = require("../../components/list/ListModel");
var userModel = require("../../components/user/UserModel");


//localhost:3000/list/addNew
router.post('/addNew', async function (req, res, next) {
    try {
        const { user, menu } = req.params;
        const menuData = await menuModel.findById(menu);
        if (!menuData) {
            return res.status(404).json({ "status": false, "message": "Sản phẩm không tồn tại" });
        }

        const addNew = { user, product, quantity };
        await listModel.create(addNew);
        res.status(200).json({ "status": true, "message": "Thanh Cong" });
    } catch (error) {
        res.status(400).json({ "status": false, "message": "That Bai" });
    }
});

//localhost:3000/list/getById
router.get('/getById', async function (req, res, next) {
    try {
        const user = await userModel.findOne({ user: req.params.user });
        if (!user) {
            return res.status(400).json({ "status": false, "message": "userId không tồn tại" });
        }
        const listmenu = await listModel.find({ user: user._id }).populate('menu');
        res.status(200).json(listmenu);
    } catch (error) {
        res.status(400).json({ "status": false, "message": "That Bai" });
    }
});

//localhost:3000/list/deleteById
router.delete('/deleteById', async function (req, res, next) {
    try {
        const { id } = req.params;
        await listModel.findByIdAndDelete(id);
        res.status(200).json({ "status": true, "message": "Thanh Cong" });
    } catch (error) {
        res.status(400).json({ "status": false, "message": "That Bai" });
    }
});

module.exports = router;


