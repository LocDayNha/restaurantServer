var express = require('express');
var router = express.Router();
var userModel = require("../../components/user/UserModel");
var ratingfoodModel = require("../../components/ratingfood/RatingFoodModel");
var menuModel = require("../../components/menu/MenuModel");

//localhost:3000/ratingfood/addNew
router.post('/addNew', async function (req, res, next) {
    try {
        const { user_id, menu_id, content, star, image } = req.body;

        const now = new Date();
        const daytimeCreate = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')} ${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;

        if (!user_id || !menu_id || !star || !daytimeCreate) {
            return res.status(400).json({ status: false, result: false, message: "Đánh giá thất bại" });
        } else {
            const data = { user_id, menu_id, content, star, image, daytimeCreate: daytimeCreate };
            await ratingfoodModel.create(data);
            return res.status(200).json({ status: true, result: true, message: "Đánh giá thành công", data });
        }
    } catch (error) {
        return res.status(400).json({ status: false, result: false, message: "That Bai" });
    }
});

//localhost:3000/ratingfood/getByIdFood/
router.get('/getByIdFood', async function (req, res, next) {
    try {
        const { menu_id } = req.body;

        const dataRating = await ratingfoodModel.find({ menu_id: menu_id }).populate('user_id', 'name image');

        if (dataRating && dataRating.length > 0) {
            return res.status(200).json({ status: true, result: true, message: "Có dữ liệu đánh giá", dataRating });
        } else if (dataRating && dataRating.length == 0) {
            return res.status(200).json({ status: true, result: true, message: "Không có dữ liệu đánh giá", dataRating });
        } else {
            return res.status(400).json({ status: false, result: false, message: "Get thất bại" });
        }
    } catch (error) {
        return res.status(400).json({ status: false, result: false, message: "That Bai" });
    }
});

//localhost:3000/ratingfood/editById/
router.post('/editById/:id', async function (req, res, next) {
    try {
        const { id } = req.params;
        const { content, star, image } = req.body;

        const dataUpdate = await ratingfoodModel.findById(id);

        if (dataUpdate) {
            dataUpdate.content = content ? content : dataUpdate.content;
            dataUpdate.star = star ? star : dataUpdate.star;
            dataUpdate.image = image ? image : dataUpdate.image;
            await dataUpdate.save();
            return res.status(200).json({ status: true, message: "Cập nhật thành công", dataUpdate });
        } else {
            return res.status(400).json({ status: false, message: "Cập nhật thất bại" });
        }
    } catch (error) {
        return res.status(400).json({ status: false, message: "Lỗi quá lỗi", error });
    }
});

//localhost:3000/ratingfood/deleteById/
router.delete('/deleteById/:id', async function (req, res, next) {
    try {
        const { id } = req.params;

        await ratingfoodModel.findByIdAndDelete(id);
        return res.status(200).json({ status: true, message: "Xóa thành công" });
    } catch (error) {
        return res.status(400).json({ status: false, message: "Lỗi quá lỗi", error });
    }
});

module.exports = router;