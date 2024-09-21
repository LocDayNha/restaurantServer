var express = require('express');
var router = express.Router();
var menuModel = require("../../components/menu/MenuModel");
var listModel = require("../../components/list/ListModel");
var userModel = require("../../components/user/UserModel");


//localhost:3000/list/addNew
router.post('/addNew', async function (req, res, next) {
    try {
        const { user_id, menu_id } = req.body;
        const addNew = { user_id, menu_id };
        await listModel.create(addNew);
        res.status(200).json({ "status": true, "message": "Thanh Cong" });
    } catch (error) {
        res.status(400).json({ "status": false, "message": "That Bai" });
    }
});

//localhost:3000/list/get
router.get('/get', async function (req, res, next) {
    try {
        const listmenu = await listModel.find().populate('menu_id');
        res.status(200).json(listmenu);
    } catch (error) {
        res.status(400).json({ "status": false, "message": "That Bai" });
    }
});

//localhost:3000/list/getByIdUser
router.get('/getByIdUser/:id', async function (req, res, next) {
    try {
        const user = await userModel.findOne({ _id: req.params.id });
        if (!user) {
            return res.status(400).json({ "status": false, "message": "userId không tồn tại" });
        }
        const list = await listModel.find({ user_id: user._id }).populate('menu_id');
        res.status(200).json(list);
    } catch (error) {
        res.status(400).json({ "status": false, "message": "That Bai" });
    }
});

//localhost:3000/list/getByEmail
router.get('/getByEmail', async function (req, res, next) {
    try {
        const { email } = req.body;
        const user = await userModel.findOne({ email: email });
        if (!user) {
            return res.status(400).json({ "status": false, "message": "User không tồn tại" });
        }
        console.log(user);
        const list = await listModel.find({ user_id: user._id }).populate('menu_id');
        res.status(200).json(list);
    } catch (error) {
        res.status(400).json({ "status": false, "message": "That Bai" });
    }
});

//localhost:3000/list/deleteById
router.delete('/deleteById/:id', async function (req, res, next) {
    try {
        const { id } = req.params;
        await listModel.findByIdAndDelete(id);
        res.status(200).json({ "status": true, "message": "Thanh Cong" });
    } catch (error) {
        res.status(400).json({ "status": false, "message": "That Bai" });
    }
});

module.exports = router;


