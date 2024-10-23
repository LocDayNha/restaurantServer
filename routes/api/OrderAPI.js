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

//localhost:3000/order/getOrderByDay
router.get('/getOrderByDay', async function (req, res, next) {
    try {

        const data = [
            {
                "_id": "6714a1ce6cd9ac454aee2c2c",
                "dayOrder": "20/01/2024",
                "quantity": 5,
                "totalMoney": 500000,
            },
            {
                "_id": "6714a1ce6cd9ac454aee2c2c",
                "dayOrder": "25/01/2024",
                "quantity": 4,
                "totalMoney": 500000,
            },
            {
                "_id": "6714b2856cd9ac454aee2c89",
                "dayOrder": "20/02/2024",
                "quantity": 8,
                "totalMoney": 800000,
            },
            {
                "_id": "6714b9a96cd9ac454aee2c9d",
                "dayOrder": "20/03/2024",
                "quantity": 4,
                "totalMoney": 400000,
            },
            {
                "_id": "6714b9a96cd9ac454aee2c9d",
                "dayOrder": "30/03/2024",
                "quantity": 7,
                "totalMoney": 400000,
            },
            {
                "_id": "6714b9ee6cd9ac454aee2ca0",
                "dayOrder": "20/04/2024",
                "quantity": 3,
                "totalMoney": 300000,
            },
            {
                "_id": "6714b9ee6cd9ac454aee2ca0",
                "dayOrder": "13/04/2024",
                "quantity": 3,
                "totalMoney": 300000,
            },
            {
                "_id": "671664b5a39d57ba57a959d4",
                "dayOrder": "21/05/2024",
                "quantity": 5,
                "totalMoney": 500000,
            }
        ];

        const today = new Date();
        const formatDate = (date) => {
            const day = ('0' + date.getDate()).slice(-2);
            const month = ('0' + (date.getMonth() + 1)).slice(-2);
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        };

        const todayString = formatDate(today);

        const orders = await orderModel.find({ dayOrder: todayString });

        let totalQuantity = 0;
        let totalMoney = 0;

        orders.forEach(item => {
            totalQuantity += item.quantity;
            totalMoney += item.totalMoney;
        });

        // Trả về kết quả
        return res.status(200).json({
            "status": true,
            "message": "Thành Công",
            "totalQuantity": totalQuantity,
            "totalMoney": totalMoney,
            "orderCount": orders.length, // Số lượng đơn hàng
            "today": todayString
        });
    } catch (error) {
        return res.status(400).json({ "status": false, "message": "That Bai", "error": error.message });
    }
});

//localhost:3000/order/getOrderByYear
router.get('/getOrderByYear', async function (req, res, next) {
    try {

        const data = [
            {
                "_id": "6714a1ce6cd9ac454aee2c2c",
                "dayOrder": "20/01/2024",
                "quantity": 5,
                "totalMoney": 500000,
            },
            {
                "_id": "6714a1ce6cd9ac454aee2c2c",
                "dayOrder": "25/01/2024",
                "quantity": 4,
                "totalMoney": 500000,
            },
            {
                "_id": "6714b2856cd9ac454aee2c89",
                "dayOrder": "20/02/2024",
                "quantity": 8,
                "totalMoney": 800000,
            },
            {
                "_id": "6714b9a96cd9ac454aee2c9d",
                "dayOrder": "20/03/2024",
                "quantity": 4,
                "totalMoney": 400000,
            },
            {
                "_id": "6714b9a96cd9ac454aee2c9d",
                "dayOrder": "30/03/2024",
                "quantity": 7,
                "totalMoney": 400000,
            },
            {
                "_id": "6714b9ee6cd9ac454aee2ca0",
                "dayOrder": "20/04/2024",
                "quantity": 3,
                "totalMoney": 300000,
            },
            {
                "_id": "6714b9ee6cd9ac454aee2ca0",
                "dayOrder": "13/04/2024",
                "quantity": 3,
                "totalMoney": 300000,
            },
            {
                "_id": "671664b5a39d57ba57a959d4",
                "dayOrder": "21/05/2024",
                "quantity": 5,
                "totalMoney": 500000,
            }
        ];

        const year = parseInt(req.query.year) || new Date().getFullYear();

        const formatDate = (date) => {
            const day = ('0' + date.getDate()).slice(-2);
            const month = ('0' + (date.getMonth() + 1)).slice(-2);
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        };

        const startOfYear = formatDate(new Date(year, 0, 1));
        const endOfYear = formatDate(new Date(year, 11, 31));

        const orders = await orderModel.find({
            dayOrder: { $gte: startOfYear, $lte: endOfYear }
        });

        const quantityData = new Array(12).fill(0);
        const moneyData = new Array(12).fill(0);
        const orderData = new Array(12).fill(0);

        orders.forEach(order => {
            const orderDate = new Date(order.dayOrder.split('/').reverse().join('-'));
            const month = orderDate.getMonth();

            if (orderDate.getFullYear() === year) {
                quantityData[month] += order.quantity;
                moneyData[month] += order.totalMoney;
                orderData[month] += 1;
            }
        });

        const quantity = quantityData.reduce((acc, val) => acc + val, 0);
        const money = moneyData.reduce((acc, val) => acc + val, 0);      
        const orderr = orderData.reduce((acc, val) => acc + val, 0);

        // Trả về kết quả
        return res.status(200).json({
            "status": true,
            "message": "Thanh Cong",
            "quantityData": quantityData,
            "moneyData": moneyData,
            "orderData": orderData,
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