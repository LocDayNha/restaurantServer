var express = require('express');
var router = express.Router();
const JWT = require("jsonwebtoken");
const config = require("../routes/utils/config");
const checkToken = require("../routes/utils/checkToken");
var sendMail = require("../routes/utils/mail");
const bcrypt = require('bcrypt');
var upload = require("../routes/utils/upload");

var userModel = require("../components/user/UserModel");
var menuModel = require("../components/menu/MenuModel");
var tableModel = require("../components/table/TableModel");
var bookingModel = require("../components/booking/BookingModel");
var timelineModel = require("../components/timeline/TimelineModel");
var categoryModel = require("../components/category/CategoryModel");
var orderModel = require("../components/order/OrderModel");

const { validationRegister } = require('../routes/validation/register');
const { validationLogin } = require('../routes/validation/login');
const { validationProfile } = require('../routes/validation/profile');

/* Login */
router.get('/login', function (req, res, next) {
  res.render('login');
});
router.post('/clickLogin', async function (req, res, next) {
  try {
    const { email, password } = req.body;

    const userMail = await userModel.findOne({ email: email });

    if (!userMail) {
      console.log('Email không tồn tại');
    } else if (userMail.isVerified !== true) {
      console.log('Email chưa được xác thực');
    } else if (userMail.role !== 3) {
      console.log('Không có quyền Admin để truy cập');
    } else if (userMail.password !== password) {
      console.log('Nhập lại mật khẩu');
    } else {
      const { password, ...newUser } = userMail._doc;
      const token = JWT.sign({ newUser }, config.SECRETKEY, { expiresIn: '1h' });
      const returnData = {
        error: false,
        responseTimestamp: new Date(),
        statusCode: 200,
        data: {
          token: token,
          user: newUser,
        },
      };
      console.log('Đăng nhập thành công:', returnData);
      res.redirect("/home");
    }
  } catch (error) {
    console.log('Lỗi hệ thống:', error);
  }
});

/* Register */
router.get('/register', function (req, res, next) {
  res.render('register');
});

/* View */
router.get('/home', async function (req, res, next) {
  try {
    const listOrder = await orderModel.find();
    if (!listOrder) {
      console.log('Lấy dữ liệu thất bại /getOrder');
    } else {
      console.log('Lấy dữ liệu thành công /getOrder');
      res.render('home', { order: listOrder });
    }
  } catch (error) {
    console.log('Lỗi hệ thống:', error);
  }
});
router.get('/data', async function (req, res, next) {
  try {
    const listMenu = await menuModel.find().populate('category');
    const listTable = await tableModel.find().populate('timeline_id');
    const listTimeline = await timelineModel.find();
    const listCategory = await categoryModel.find();
    if (!listMenu | !listTable | !listTimeline | !listCategory) {
      console.log('Lấy dữ liệu thất bại /data');
    } else {
      console.log('Lấy dữ liệu thành công /data');
      res.render('data', { menu: listMenu, table: listTable, category: listCategory, timeline: listTimeline });
    }
  } catch (error) {
    console.log('Lỗi hệ thống:', error);
  }
});
router.get('/addMenu', async function (req, res, next) {
  try {
    const listCategory = await categoryModel.find();
    if (!listCategory) {
      console.log('Lấy dữ liệu thất bại /addMenu');
    } else {
      console.log('Lấy dữ liệu thành công /addMenu');
      res.render('addMenu', { category: listCategory });
    }
  } catch (error) {
    console.log('Lỗi hệ thống:', error);
  }
});
router.get('/addTable',async function (req, res, next) {
  try {
    const listTimeline = await timelineModel.find();
    if (!listTimeline) {
      console.log('Lấy dữ liệu thất bại /addTable');
    } else {
      console.log('Lấy dữ liệu thành công /addTable');
      res.render('addTable', {timeline: listTimeline });
    }
  } catch (error) {
    console.log('Lỗi hệ thống:', error);
  }
});
router.get('/addCategory', function (req, res, next) {
  res.render('addCategory');
});
router.get('/addTimeline', function (req, res, next) {
  res.render('addTimeline');
});


/* Add */
router.post('/addMenu', async function (req, res, next) {
  try {
    const { name, price, category, image } = req.body;
    const addNew = { name, price, image, category };
    if (!name | !price | !image | !category) {
      console.log('Thêm món ăn thất bại /addMenu');
    } else {
      await menuModel.create(addNew);
      console.log('Thêm món ăn thành công /addMenu');
      res.render('', {});
    }
  } catch (error) {
    console.log('Lỗi hệ thống:', error);
  }
});
router.post('/addTable', async function (req, res, next) {
  try {
    const { number, userNumber, timeline_id } = req.body;
    const addNew = { number, userNumber, timeline_id };
    if (!number | !userNumber | !timeline_id) {
      console.log('Thêm bàn thất bại /addTable');
    } else {
      await tableModel.create(addNew);
      console.log('Thêm bàn thành công /addTable');
      res.render('', {});
    }
  } catch (error) {
    console.log('Lỗi hệ thống:', error);
  }

});
router.post('/addCategory', async function (req, res, next) {
  try {
    const { name, image } = req.body;
    const addNew = { name, image };
    if (!name | !image) {
      console.log('Thêm loại món ăn thất bại /addCategory');
    } else {
      await categoryModel.create(addNew);
      console.log('Thêm loại món ăn thành công /addCategory');
      res.render('', {});
    }
  } catch (error) {
    console.log('Lỗi hệ thống:', error);
  }

});
router.post('/addTimeline', async function (req, res, next) {
  try {
    const { name } = req.body;
    const addNew = { name };
    if (!name) {
      console.log('Thêm thời gian thất bại /addTimeline');
    } else {
      await timelineModel.create(addNew);
      console.log('Thêm thời gian thành công /addTimeline');
      res.render('', {});
    }
  } catch (error) {
    console.log('Lỗi hệ thống:', error);
  }

});

/* Get */

/* Edit */

/* Delete */

module.exports = router;
