var express = require('express');
var router = express.Router();
var orderModel = require("../../components/order/OrderModel");
var menuModel = require("../../components/menu/MenuModel");

//localhost:3000/order/addNew
router.post('/addNew', async function (req, res, next) {
    try {
        const { tableNumber, nameUser, dishes } = req.body;
        const menuIds = dishes.map(dish => dish._id); //tạo ra một mảng mới, chỉ chứa giá trị menuId của mỗi món ăn
        const menuItems = await menuModel.find({ _id: { $in: menuIds } }); //mảng menuItems chứa các đối tượng món ăn từ cơ sở dữ liệu

        let totalQuantity = 0;
        let totalMoney = 0;
        const currentDate = new Date();
        let timeNow = currentDate.toLocaleTimeString('vi-VN');
        let dayNow = currentDate.toLocaleDateString('vi-VN'); 

        dishes.forEach(dish => {  // forEach là một vòng lặp qua từng món ăn trong mảng dishes
            const menuItem = menuItems.find(item => item._id.toString() === dish._id);
            if (menuItem) { // Kiểm tra có tìm thấy món ăn trong cơ sở dữ liệu hay không -> thực hiện các tính toán
                totalQuantity += parseInt(dish.quantity, 10);
                totalMoney += menuItem.price * parseInt(dish.quantity, 10);
            }
        });

        const order = { tableNumber, nameUser, dishes, quantity: totalQuantity, totalMoney, timeOrder: timeNow, dayOrder: dayNow };

        await orderModel.create(order);

        return res.status(200).json({ "status": true, "message": "Thanh Cong" });
    } catch (error) {
        return res.status(400).json({ "status": false, "message": "That Bai" });
    }
});

//localhost:3000/order/get
router.get('/get', async function (req, res, next) {
    try {
        const list = await orderModel.find();
        return res.status(200).json(list);
    } catch (error) {
        return res.status(400).json({ "status": false, "message": "That Bai" });
    }
});

//localhost:3000/order/getByDay
router.get('/getByDay', async function (req, res, next) {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const orders = await orderModel.find({ createAt: { $gte: startOfDay, $lte: endOfDay } });

        // Tính tổng số lượng và tổng tiền từ các đơn hàng
        let totalQuantity = 0;
        let totalMoney = 0;

        orders.forEach(order => {
            totalQuantity += order.quantity;
            totalMoney += order.totalMoney;
        });

        // Trả về kết quả
        return res.status(200).json({
            "status": true, "message": "Thanh Cong", "orders": orders,
            "totalQuantity": totalQuantity,
            "totalMoney": totalMoney
        });
    } catch (error) {
        return res.status(400).json({ "status": false, "message": "That Bai" });
    }
});

//localhost:3000/order/getByMonth
router.get('/getByMonth', async function (req, res, next) {
    try {

        const month = parseInt(req.query.month) || (new Date()).getMonth() + 1; // getMonth() trả về giá trị từ 0-11, nên cần +1
        const year = parseInt(req.query.year) || (new Date()).getFullYear();

        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0);
        endOfMonth.setHours(23, 59, 59, 999);

        const orders = await orderModel.find({ createAt: { $gte: startOfMonth, $lte: endOfMonth } });

        let totalQuantity = 0;
        let totalMoney = 0;

        orders.forEach(order => {
            totalQuantity += order.quantity;
            totalMoney += order.totalMoney;
        });

        // Trả về kết quả
        return res.status(200).json({
            "status": true, "message": "Thanh Cong",
            "orders": orders,
            "totalQuantity": totalQuantity,
            "totalMoney": totalMoney,
            "month": month,
            "year": year
        });
    } catch (error) {
        return res.status(400).json({ "status": false, "message": "That Bai", "error": error.message });
    }
});

//localhost:3000/order/getByYear
router.get('/getByYear', async function (req, res, next) {
    try {
        const year = parseInt(req.query.year) || (new Date()).getFullYear();

        const startOfYear = new Date(year, 0, 1); // Tháng 0 là tháng 1 (tháng 1 - 12)
        const endOfYear = new Date(year, 11, 31); // Tháng 11 là tháng 12 (tháng 12 - 12)
        endOfYear.setHours(23, 59, 59, 999);

        const orders = await orderModel.find({ createAt: { $gte: startOfYear, $lte: endOfYear } });

        let totalQuantity = 0;
        let totalMoney = 0;

        orders.forEach(order => {
            totalQuantity += order.quantity;
            totalMoney += order.totalMoney;
        });

        return res.status(200).json({
            "status": true, "message": "Thanh Cong",
            "orders": orders,
            "totalQuantity": totalQuantity,
            "totalMoney": totalMoney,
            "year": year
        });
    } catch (error) {
        return res.status(400).json({ "status": false, "message": "That Bai", "error": error.message });
    }
});

//localhost:3000/order/getById
router.get('/getById/:id', async function (req, res, next) {
    try {
        const { id } = req.params;
        const list = await orderModel.findById(id);
        return res.status(200).json({ "status": true, "message": "Lay thanh cong", list });
    } catch (error) {
        return res.status(400).json({ "status": false, "message": "That Bai" });
    }
});

//localhost:3000/order/edit
router.post('/edit/:id', async function (req, res, next) {
    try {
        const { id } = req.params;
        const { dishes } = req.body;

        const list = await orderModel.findById(id);

        if (list) {
            list.dishes = dishes ? dishes : list.dishes;

            let totalQuantity = 0;
            let totalMoney = 0;

            const menuIds = list.dishes.map(dish => dish.menuId);
            const menuItems = await menuModel.find({ _id: { $in: menuIds } });

            list.dishes.forEach(dish => {
                const menuItem = menuItems.find(item => item._id.toString() === dish.menuId);
                if (menuItem) {
                    totalQuantity += parseInt(dish.quantity, 10);
                    totalMoney += menuItem.price * parseInt(dish.quantity, 10);
                }
            });

            list.quantity = totalQuantity;
            list.totalMoney = totalMoney;

            await list.save();
            res.status(200).json({ "status": true, "message": "Thanh Cong" });
        } else {
            res.status(400).json({ "status": false, "message": "That Bai" });
        }

    } catch (error) {
        res.status(400).json({ "status": false, "message": "That Bai" });
    }
});

module.exports = router;