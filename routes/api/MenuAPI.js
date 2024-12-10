var express = require("express");
var router = express.Router();
var menuModel = require("../../components/menu/MenuModel");
var upload = require("../utils/upload");
var categoryModel = require("../../components/category/CategoryModel");
const { bucket } = require("../utils/firebase");
const upload_firebase = require("../utils/multerConfig");
const { v4: uuidv4 } = require("uuid"); // Để tạo tên tệp duy nhất

//localhost:3000/menu/add
router.post("/add", [upload.single("image")], async function (req, res, next) {
  try {
    const { name, price, category, image } = req.body;
    const addNew = { name, price, image, category };
    await menuModel.create(addNew);
    res.status(200).json({ status: true, message: "Thanh Cong" });
  } catch (error) {
    res.status(400).json({ status: false, message: "That Bai" });
  }
});

//localhost:3000/menu/upload-image
router.post(
  "/upload-image",
  [upload.single("image")],
  async (req, res, next) => {
    try {
      const { file } = req;
      if (!file) {
        return res.json({ status: 0, link: "" });
      } else {
        const url = `http://localhost:3000/images/${file.filename}`;
        return res.json({ status: 1, url: url });
      }
    } catch (error) {
      console.log("Upload image error: ", error);
      return res.json({ status: 0, link: "" });
    }
  }
);

//localhost:3000/menu/upload-image-firebase
router.post(
  "/upload-image-firebase",
  [upload_firebase.single("image")],
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).send("Không có tập tin nào được tải lên");
      }

      // Tạo tên file duy nhất và định dạng file
      const fileName = `${uuidv4()}.${req.file.mimetype.split("/")[1]}`;

      // Tạo một file trong bucket Firebase
      const file = bucket.file(fileName);

      // Upload tệp lên Firebase Storage
      const stream = file.createWriteStream({
        metadata: {
          contentType: req.file.mimetype,
        },
      });

      stream.on("error", (error) => {
        console.log(error);
        return res.status(400).send("Không tải được hình ảnh lên");
      });
      stream.on("finish", async () => {
        //truy cập hình ảnh công khai
        await file.makePublic();
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
        res.status(200).json({ imageUrl: publicUrl });
      });
      stream.end(req.file.buffer);
    } catch (error) {
      console.log("Upload image error: ", error);
      return res.json({ status: 0, link: "" });
    }
  }
);

//localhost:3000/menu/get
router.get("/get", async function (req, res, next) {
  try {
    const list = await menuModel.find({ isActive: true }).populate("category");
    res.status(200).json(list);
  } catch (error) {
    res.status(400).json({ status: false, message: "That Bai" });
  }
});

//localhost:3000/menu/getByCategory/
router.get("/getByCategory/:id", async function (req, res, next) {
  try {
    const category = await categoryModel.findOne({ _id: req.params.id });
    if (!category) {
      return res
        .status(400)
        .json({ status: false, message: "Danh mục không tồn tại" });
    }
    const list = await menuModel
      .find({ category: category._id, isActive: true })
      .populate("category");
    res.status(200).json(list);
  } catch (error) {
    res.status(400).json({ status: false, message: "That Bai" });
  }
});

//localhost:3000/menu/getByName
router.get("/getByName", async function (req, res, next) {
  try {
    const { name } = req.body;
    const list = await menuModel.find({ name: name }).populate("category");
    res.status(200).json(list);
  } catch (error) {
    res.status(400).json({ status: false, message: "That Bai" });
  }
});

//localhost:3000/menu/getById
router.get("/getById/:id", async function (req, res, next) {
  try {
    const { id } = req.params;

    const listData = await menuModel.findById(id);

    if (listData) {
      res.status(200).json({ status: true, message: "Thanh Cong", listData });
    } else {
      res.status(400).json({ status: false, message: "That Bai" });
    }
  } catch (error) {
    res.status(400).json({ status: false, message: "That Bai" });
  }
});

//localhost:3000/menu/editById
router.post("/editById/:id", async function (req, res, next) {
  try {
    const { id } = req.params;
    const { name, price, image, category, quantity } = req.body;
    const itemEdit = await menuModel.findById(id);
    if (itemEdit) {
      itemEdit.name = name ? name : itemEdit.name;
      itemEdit.price = price ? price : itemEdit.price;
      itemEdit.image = image ? image : itemEdit.image;
      itemEdit.category = category ? category : itemEdit.category;
      itemEdit.quantity = quantity ? quantity : itemEdit.quantity;
      itemEdit.description = description ? description : itemEdit.description;
      itemEdit.isActive = isActive ? isActive : itemEdit.isActive;
      await itemEdit.save();
      res.status(200).json({ status: true, message: "Thanh Cong" });
    } else {
      res.status(400).json({ status: false, message: "That Bai" });
    }
  } catch (error) {
    res.status(400).json({ status: false, message: "That Bai" });
  }
});

//localhost:3000/menu/deleteById
router.delete("/deleteById/:id", async function (req, res, next) {
  try {
    const { id } = req.params;
    await menuModel.findByIdAndDelete(id);
    res.status(200).json({ status: true, message: "Thanh Cong" });
  } catch (error) {
    res.status(400).json({ status: false, message: "That Bai" });
  }
});

//localhost:3000/menu/search?name=Hamburger&minPrice=10000&maxPrice=20000
router.get("/search", async function (req, res, next) {
  try {
    const { name, minPrice, maxPrice } = req.query;
    if (name && minPrice && maxPrice) {
      const list = await menuModel.find({
        name: { $regex: name, $options: "i" },
      });
      const filteredList = list.filter((item) => {
        const price = Number(item.price);
        return price >= minPrice && price <= maxPrice;
      });
      res.status(200).json(filteredList);
    } else if (name) {
      const list = await menuModel.find({
        name: { $regex: name, $options: "i" },
      });
      res.status(200).json(list);
    } else if (minPrice && maxPrice) {
      const list = await menuModel.find();
      const filteredList = list.filter((item) => {
        const price = Number(item.price);
        return price >= minPrice && price <= maxPrice;
      });
      res.status(200).json(filteredList);
    } else {
      res.status(400).json({ status: false, message: "Đã có lỗi xảy ra" });
    }
  } catch (error) {
    res.status(500).json({ status: false, message: "That Bai" });
  }
});

module.exports = router;
