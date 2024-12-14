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

var upload = require("./utils/upload");
const { bucket } = require("./utils/firebase");
const upload_firebase = require("./utils/multerConfig");
const { v4: uuidv4 } = require("uuid"); // Để tạo tên tệp duy nhất

const { validationRegister } = require('../routes/validation/register');
const { validationLogin } = require('../routes/validation/login');
const { validationProfile } = require('../routes/validation/profile');

const dataDay = async () => {
  try {
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
    let totalOrder = orders.length;

    orders.forEach(item => {
      totalQuantity += item.quantity;
      totalMoney += item.totalMoney;
    });

    return { totalQuantity, totalMoney, totalOrder }
  } catch (error) {
    return { error }
  }
}

const dataYear = async () => {
  try {
    const year = new Date().getFullYear();

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

    return { quantityData, moneyData, orderData, quantity, money, orderr }
  } catch (error) {
    return { error }
  }
}

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

    const dataToDay = await dataDay();
    const dataToYear = await dataYear();

    if (dataToDay.error) {
      console.error('Lỗi khi lấy dữ liệu ngày:', dataToDay.error);
    }
    if (dataToYear.error) {
      console.error('Lỗi khi lấy dữ liệu năm:', dataToYear.error);
    }

    res.locals.quantityData = JSON.stringify(dataToYear.quantityData); //chuyển dữ liệu sang dạng chuỗi JSON để sử dụng trong JavaScript
    res.locals.moneyData = JSON.stringify(dataToYear.moneyData);
    res.locals.orderData = JSON.stringify(dataToYear.orderData);

    const listOrder = await orderModel.find();
    if (!listOrder) {
      console.log('Lấy dữ liệu thất bại /getOrder');
    } else {
      console.log('Lấy dữ liệu thành công /getOrder');
      res.render('home', { order: listOrder, quantityDay: dataToDay.totalQuantity, moneyDay: dataToDay.totalMoney, orderDay: dataToDay.totalOrder, quantityYear: dataToYear.quantity, moneyYear: dataToYear.money, orderYear: dataToYear.orderr });
    }
  } catch (error) {
    console.log('Lỗi hệ thống:', error);
  }
});
router.get('/data', async function (req, res, next) {
  try {
    const listMenu = await menuModel.find().populate('category');
    if (!listMenu) {
      console.log('Lấy dữ liệu thất bại /data');
    } else {
      console.log('Lấy dữ liệu thành công /data');
      res.render('data', { menu: listMenu });
    }
  } catch (error) {
    console.log('Lỗi hệ thống:', error);
  }
});
router.get('/dataTable', async function (req, res, next) {
  try {
    const listTable = await tableModel.find().populate('timeline_id');
    if (!listTable) {
      console.log('Lấy dữ liệu thất bại /dataTable');
    } else {
      console.log('Lấy dữ liệu thành công /dataTable');
      res.render('dataTable', { table: listTable });
    }
  } catch (error) {
    console.log('Lỗi hệ thống:', error);
  }
});
router.get('/dataCategory', async function (req, res, next) {
  try {
    const listCategory = await categoryModel.find();
    if (!listCategory) {
      console.log('Lấy dữ liệu thất bại /dataCategory');
    } else {
      console.log('Lấy dữ liệu thành công /dataCategory');
      res.render('dataCategory', { category: listCategory });
    }
  } catch (error) {
    console.log('Lỗi hệ thống:', error);
  }
});
router.get('/dataTimeline', async function (req, res, next) {
  try {
    const listTimeline = await timelineModel.find();
    if (!listTimeline) {
      console.log('Lấy dữ liệu thất bại /dataTimeline');
    } else {
      console.log('Lấy dữ liệu thành công /dataTimeline');
      res.render('dataTimeline', { timeline: listTimeline });
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
router.get('/addTable', async function (req, res, next) {
  try {
    const listTimeline = await timelineModel.find();
    if (!listTimeline) {
      console.log('Lấy dữ liệu thất bại /addTable');
    } else {
      console.log('Lấy dữ liệu thành công /addTable');
      res.render('addTable', { timeline: listTimeline });
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
router.get('/booking', async function (req, res, next) {
  try {
    const currentDate = new Date();
    const today = currentDate.toLocaleDateString('vi-VN');

    const listBooking = await bookingModel.find()
      .populate({
        path: 'user_id',
        select: 'email name phoneNumber'
      })
      .populate({
        path: 'table_id',
        populate: {
          path: 'timeline_id',
          select: 'name'
        }
      });

    console.log(today);
    console.log(listBooking.dayBooking);
    res.render('booking', { booking: listBooking });
  } catch (error) {
    console.log('Lỗi hệ thống:', error);
  }
});
router.get('/rating', async function (req, res, next) {
  try {
    res.render('rating');
  } catch (error) {
    console.log('Lỗi hệ thống:', error);
  }
});
router.get('/ratingFood', async function (req, res, next) {
  try {
    res.render('ratingFood');
  } catch (error) {
    console.log('Lỗi hệ thống:', error);
  }
});


/* Add */
router.post('/addMenu', async function (req, res, next) {
  try {
    const { name, price, category, image } = req.body;
    const addNew = { name, price, image, category };
    if (!name | !price | !category) {
      console.log('Thêm món ăn thất bại /addMenu');
    } else {
      await menuModel.create(addNew);
      console.log('Thêm món ăn thành công /addMenu');
      res.redirect("/data");
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
      res.redirect("/dataTable");
    }
  } catch (error) {
    console.log('Lỗi hệ thống:', error);
  }

});
router.post('/addCategory', [upload_firebase.single("image")], async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!req.file) {
      console.log('Không có tập tin nào được tải lên');
    }

    const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      console.log('Loại file không được hỗ trợ !');
    }

    // Tạo tên file duy nhất
    const fileName = `${uuidv4()}.${req.file.mimetype.split("/")[1]}`;
    const file = bucket.file(fileName);

    // Upload tệp lên Firebase Storage
    const stream = file.createWriteStream({
      metadata: {
        contentType: req.file.mimetype,
      },
    });

    stream.on("error", (error) => {
      console.log(error);
      console.log('Không tải được hình ảnh lên');
    });

    stream.on("finish", async () => {
      try {
        //truy cập hình ảnh công khai
        await file.makePublic();
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
        console.log(publicUrl);
        if (!name || !publicUrl) {
          console.log('Nhập đầy đủ thông tin !');
        } else {
          const addNew = { name, image: publicUrl };
          await categoryModel.create(addNew);
          console.log('Thêm loại món ăn thành công /addCategory');
          res.redirect("/dataCategory");
        }
      } catch (error) {
        console.error("Make public error:", error);
        console.log("Nhập đầy đủ thông tin !");
        // return res.status(500).send("Không thể công khai file.");
      }
    });
    stream.end(req.file.buffer);
  } catch (error) {
    // res.send("<script>alert('Nhập đầy đủ thông tin!'); window.location.href = '/addDishes';</script>");
    console.log("Upload image error: ", error);
    console.log("Upload image error: ", { error: error.message });
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
      res.redirect("/dataTimeline");
    }
  } catch (error) {
    console.log('Lỗi hệ thống:', error);
  }

});
router.post('/addMenuFinal', [upload_firebase.single("image")], async (req, res, next) => {
  try {
    const { name, price, category } = req.body;

    if (!req.file) {
      console.log('Không có tập tin nào được tải lên');
    }

    const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      console.log('Loại file không được hỗ trợ !');
    }

    // Tạo tên file duy nhất
    const fileName = `${uuidv4()}.${req.file.mimetype.split("/")[1]}`;
    const file = bucket.file(fileName);

    // Upload tệp lên Firebase Storage
    const stream = file.createWriteStream({
      metadata: {
        contentType: req.file.mimetype,
      },
    });

    stream.on("error", (error) => {
      console.log(error);
      console.log('Không tải được hình ảnh lên');
    });

    stream.on("finish", async () => {
      try {
        //truy cập hình ảnh công khai
        await file.makePublic();
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
        console.log(publicUrl);
        if (!name || !price || !category || !publicUrl) {
          console.log('Nhập đầy đủ thông tin !');
        } else {
          const addNew = { name, price, image: publicUrl, category };
          await menuModel.create(addNew);
          return res.redirect("/data");
        }
      } catch (error) {
        console.error("Make public error:", error);
        console.log("Nhập đầy đủ thông tin !");
        // return res.status(500).send("Không thể công khai file.");
      }
    });
    stream.end(req.file.buffer);
  } catch (error) {
    // res.send("<script>alert('Nhập đầy đủ thông tin!'); window.location.href = '/addDishes';</script>");
    console.log("Upload image error: ", error);
    console.log("Upload image error: ", { error: error.message });
  }
}
);

/* Get */
router.get('/getMenuById/:id', async function (req, res, next) {
  try {
    const { id } = req.params;
    const listCategory = await categoryModel.find();
    const itemMenu = await menuModel.findById(id).populate('category');
    if (!listCategory | !itemMenu) {
      console.log('Lấy dữ liệu thất bại /getMenuById');
    } else {
      console.log('Lấy dữ liệu thành công /getMenuById');
      res.render('editMenu', { itemMenu: itemMenu, category: listCategory, _id: id });
    }
  } catch (error) {
    console.log('Lỗi hệ thống:', error);
  }
});
router.get('/getTableById/:id', async function (req, res, next) {
  try {
    const { id } = req.params;
    const listTimeline = await timelineModel.find();
    const itemTable = await tableModel.findById(id).populate('timeline_id');
    if (!listTimeline | !itemTable) {
      console.log('Lấy dữ liệu thất bại /getTableById');
    } else {
      console.log('Lấy dữ liệu thành công /getTableById');
      res.render('editTable', { itemTable: itemTable, timeline: listTimeline, _id: id });
    }
  } catch (error) {
    console.log('Lỗi hệ thống:', error);
  }
});
router.get('/getCategoryById/:id', async function (req, res, next) {
  try {
    const { id } = req.params;
    const itemCategory = await categoryModel.findById(id);
    if (!itemCategory) {
      console.log('Lấy dữ liệu thất bại /getCategoryById');
    } else {
      console.log('Lấy dữ liệu thành công /getCategoryById');
      res.render('editCategory', { itemCategory: itemCategory, _id: id });
    }
  } catch (error) {
    console.log('Lỗi hệ thống:', error);
  }
});
router.get('/getTimelineById/:id', async function (req, res, next) {
  try {
    const { id } = req.params;
    const itemTimeline = await timelineModel.findById(id);
    if (!itemTimeline) {
      console.log('Lấy dữ liệu thất bại /getTimelineById');
    } else {
      console.log('Lấy dữ liệu thành công /getTimelineById');
      res.render('editTimeline', { itemTimeline: itemTimeline, _id: id });
    }
  } catch (error) {
    console.log('Lỗi hệ thống:', error);
  }
});

/* Edit */
router.post('/editMenuById/:id', async function (req, res, next) {
  try {
    const { id } = req.params;
    const { name, price, category, isActive } = req.body;
    const itemEdit = await menuModel.findById(id);
    if (itemEdit) {
      itemEdit.name = name ? name : itemEdit.name;
      itemEdit.price = price ? price : itemEdit.price;
      itemEdit.category = category ? category : itemEdit.category;
      itemEdit.isActive = isActive ? isActive : itemEdit.isActive;
      await itemEdit.save();
      console.log('Cập nhật Menu thành công /editMenuById');
      res.redirect("/data");
    } else {
      console.log('Cập nhật Menu thất bại /editMenuById');
    }
  } catch (error) {
    console.log('Lỗi hệ thống:', error);
  }

});
router.post('/editTableById/:id', async function (req, res, next) {
  try {
    const { id } = req.params;
    const { timeline_id, isActive } = req.body;
    const itemEdit = await tableModel.findById(id);
    if (itemEdit) {
      itemEdit.timeline_id = timeline_id ? timeline_id : itemEdit.timeline_id;
      itemEdit.isActive = isActive ? isActive : itemEdit.isActive;
      await itemEdit.save();
      console.log('Cập nhật Bàn thành công /editTableById');
      res.redirect("/dataTable");
    } else {
      console.log('Cập nhật Bàn thất bại /editTableById');
    }
  } catch (error) {
    console.log('Lỗi hệ thống:', error);
  }

});
router.post('/editCategoryById/:id', async function (req, res, next) {
  try {
    const { id } = req.params;
    const { name, isActive } = req.body;
    const itemEdit = await categoryModel.findById(id);
    if (itemEdit) {
      itemEdit.name = name ? name : itemEdit.name;
      itemEdit.isActive = isActive ? isActive : itemEdit.isActive;
      await itemEdit.save();
      console.log('Cập nhật loại món ăn thành công /editCategoryId');
      res.redirect("/dataCategory");
    } else {
      console.log('Cập nhật loại món ăn thất bại /editCategoryId');
    }
  } catch (error) {
    console.log('Lỗi hệ thống:', error);
  }

});
router.post('/editTimelineById/:id', async function (req, res, next) {
  try {
    const { id } = req.params;
    const { name, isActive } = req.body;
    const itemEdit = await timelineModel.findById(id);
    if (itemEdit) {
      itemEdit.name = name ? name : itemEdit.name;
      itemEdit.isActive = isActive ? isActive : itemEdit.isActive;
      await itemEdit.save();
      console.log('Cập nhật thời gian thành công /editTimelineId');
      res.redirect("/dataTimeline");
    } else {
      console.log('Cập nhật thời gian thất bại /editTimelineId');
    }
  } catch (error) {
    console.log('Lỗi hệ thống:', error);
  }

});

/* Delete */
router.delete('/deleteMenuById/:id', async function (req, res, next) {
  try {
    const { id } = req.params;
    await menuModel.findByIdAndDelete(id);
    console.log('Xóa Menu thành công /deleteMenuById');
    res.render("/home");
  } catch (error) {
    console.log('Lỗi hệ thống:', error);
  }
});
router.delete('/deleteTableById/:id', async function (req, res, next) {
  try {
    const { id } = req.params;
    await tableModel.findByIdAndDelete(id);
    console.log('Xóa Bàn thành công /deleteTableById');
    res.render("/home");
  } catch (error) {
    console.log('Lỗi hệ thống:', error);
  }
});
router.delete('/deleteCategoryById/:id', async function (req, res, next) {
  try {
    const { id } = req.params;
    await categoryModel.findByIdAndDelete(id);
    console.log('Xóa loại món ăn thành công /deleteCategoryById');
    res.render("/home");
  } catch (error) {
    console.log('Lỗi hệ thống:', error);
  }
});
router.delete('/deleteTimelineById/:id', async function (req, res, next) {
  try {
    const { id } = req.params;
    await timelineModel.findByIdAndDelete(id);
    console.log('Xóa thời gian thành công /deleteTimelineById');
    res.render("/home");
  } catch (error) {
    console.log('Lỗi hệ thống:', error);
  }
});

module.exports = router;
