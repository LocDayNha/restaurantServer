var express = require("express");
var router = express.Router();
var userModel = require("../../components/user/UserModel");
const JWT = require("jsonwebtoken");
const config = require("../utils/config");
const checkToken = require("../utils/checkToken");
var sendMail = require("../utils/mail");
const bcrypt = require("bcrypt");
var upload = require("../utils/upload");

const { validationRegister } = require("../validation/register");
const { validationLogin } = require("../validation/login");
const { validationProfile } = require("../validation/profile");

//localhost:3000/user/register
router.post("/register", [validationRegister], async function (req, res, next) {
  try {
    const { email, password, createAt } = req.body;

    const userMail = await userModel.findOne({ email: email });
    if (userMail) {
      console.log("Email đã được đăng ký");
      return res
        .status(400)
        .json({ result: false, message: "Email đã được đăng ký" });
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const register = { email, password: hash, createAt, isVerified: false };
    const user = new userModel(register);
    await user.save();
    return res
      .status(200)
      .json({ status: true, message: "Đăng ký thành công" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: "Loi he thong" });
  }
});

//localhost:3000/user/send-mail                              register
router.post("/send-mail", async function (req, res, next) {
  try {
    const { email } = req.body;

    const userMail = await userModel.findOne({ email: email });
    const verifyCode = Math.floor(1000 + Math.random() * 9000);

    if (userMail) {
      userMail.verifyCode = verifyCode ? verifyCode : userMail.verifyCode;
      await userMail.save();
    }

    try {
      const subject = "Phonex Restaurant Verification Code";
      const content = `
    <div
        style="font-family: Arial, sans-serif;background-color: #fff;padding: 20px;border-radius: 10px;box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);max-width: 600px;width: 50%;">
        <div class="email-content">
            <h1 style="color: #333;
        text-align: center;
        font-size: 24px;">Mã Xác Minh</h1>
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin: 20px 0; text-align: center;">
                Nhập mã này trên màn hình để xác minh danh tính:</p>
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin: 20px 0; text-align: center; display: block;
        background-color: #f0f0f0;font-size: 32px;font-weight: bold;text-align: center;padding: 10px;margin: 20px auto;width: 150px;border-radius: 8px;letter-spacing: 5px;">
                ${verifyCode}</p>
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin: 20px 0; text-align: center;">
                Mã này sẽ hết hạn trong thời gian ngắn. Hãy sử dụng nó sớm.</p>
        </div>
    </div>
        `;

      const mailOptions = {
        from: "Phonex Restaurant <phoenixrestaurant13@gmail.com>", // Người gửi
        to: email, // Người nhận
        subject: subject, // Tiêu đề
        html: content, // Nội dung HTML
      };

      await sendMail.transporter.sendMail(mailOptions);
      return res
        .status(200)
        .json({ status: true, message: "Gửi mã xác minh qua email" });
    } catch (err) {
      return res
        .status(400)
        .json({ status: false, message: "Gửi mail thất bại" });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: "Loi he thong" });
  }
});

//localhost:3000/user/verify
router.post("/verify", async function (req, res, next) {
  try {
    const { code, email } = req.body;

    const user = await userModel.findOne({ email: email });

    if (user.verifyCode === parseInt(code)) {
      user.isVerified = true;
      await user.save();
      return res
        .status(200)
        .json({ status: true, message: "Xác minh thành công" });
    } else {
      return res
        .status(400)
        .json({ status: true, message: "Xác minh thất bại" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: "Loi he thong" });
  }
});

//localhost:3000/user/login
router.post("/login", [validationLogin], async function (req, res, next) {
  try {
    const { email, password } = req.body;

    const userMail = await userModel.findOne({ email: email });

    if (!userMail) {
      return res
        .status(400)
        .json({ status: false, message: "Email không tồn tại" });
    } else if (userMail.isVerified !== true) {
      return res
        .status(400)
        .json({ status: false, message: "Email chưa được xác thực" });
    } else {
      const result = bcrypt.compareSync(password, userMail.password);

      if (result) {
        const { password, ...newUser } = userMail._doc;
        const token = JWT.sign({ newUser }, config.SECRETKEY, {
          expiresIn: "1h",
        });
        const returnData = {
          error: false,
          responseTimestamp: new Date(),
          statusCode: 200,
          data: {
            token: token,
            user: newUser,
          },
        };
        return res
          .status(200)
          .json({ status: true, message: "Dang Nhap Thanh Cong", returnData });
      } else {
        return res
          .status(400)
          .json({ status: false, message: "Nhap Lai Email hoac Password" });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: "Loi he thong" });
  }
});

//localhost:3000/user/loginGoogle
router.post("/loginGoogle", async function (req, res, next) {
  try {
    const { email, name, image } = req.body;

    if (!email || !name || !image) {
      return res
        .status(400)
        .json({ status: false, message: "Đăng nhập Google thất bại" });
    } else {
      const userMail = await userModel.findOne({ email: email });

      if (userMail) {
        return res.status(200).json({
          status: true,
          message: "Đăng nhập Google thành công",
          userMail,
        });
      } else {
        const newUser = { email, name, image };
        const userMail = new userModel(newUser);
        await userMail.save();
        return res.status(200).json({
          status: true,
          message: "Đăng nhập Google thành công",
          userMail,
        });
      }
    }
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "Loi he thong", error });
  }
});

//localhost:3000/user/loginFacebook
router.post("/loginFacebook", async function (req, res, next) {
  try {
    const { email, name, image } = req.body;

    if (!email || !name || !image) {
      return res
        .status(400)
        .json({ status: false, message: "Đăng nhập Facebook thất bại" });
    } else {
      const userMail = await userModel.findOne({ email: email });

      if (userMail) {
        return res.status(200).json({
          status: true,
          message: "Đăng nhập Facebook thành công",
          userMail,
        });
      } else {
        const newUser = { email, name, image };
        const userMail = new userModel(newUser);
        await userMail.save();
        return res.status(200).json({
          status: true,
          message: "Đăng nhập Facebook thành công",
          userMail,
        });
      }
    }
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "Loi he thong", error });
  }
});

//localhost:3000/user/sent-code                              forgotpass
router.post("/sent-code", async function (req, res, next) {
  try {
    const { email } = req.body;

    const userMail = await userModel.findOne({ email: email });
    const verifyCode = Math.floor(1000 + Math.random() * 9000);

    if (!userMail) {
      return res
        .status(400)
        .json({ status: false, message: "Email không tồn tại" });
    } else if (userMail.isVerified !== true) {
      return res
        .status(400)
        .json({ status: false, message: "Email chưa được xác thực" });
    } else {
      if (userMail) {
        userMail.verifyCode = verifyCode ? verifyCode : userMail.verifyCode;
        await userMail.save();

        try {
          const subject = "Phonex Restaurant Verification Code";
          const content = `
            <div
                style="font-family: Arial, sans-serif;background-color: #fff;padding: 20px;border-radius: 10px;box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);max-width: 600px;width: 50%;">
                <div class="email-content">
                    <h1 style="color: #333;
                text-align: center;
                font-size: 24px;">Mã Xác Minh</h1>
                    <p style="color: #555; font-size: 16px; line-height: 1.5; margin: 20px 0; text-align: center;">
                        Nhập mã này trên màn hình để xác minh danh tính:</p>
                    <p style="color: #555; font-size: 16px; line-height: 1.5; margin: 20px 0; text-align: center; display: block;
                background-color: #f0f0f0;font-size: 32px;font-weight: bold;text-align: center;padding: 10px;margin: 20px auto;width: 150px;border-radius: 8px;letter-spacing: 5px;">
                        ${verifyCode}</p>
                    <p style="color: #555; font-size: 16px; line-height: 1.5; margin: 20px 0; text-align: center;">
                        Mã này sẽ hết hạn trong thời gian ngắn. Hãy sử dụng nó sớm.</p>
                </div>
            </div>
                `;

          const mailOptions = {
            from: "Phonex Restaurant <phoenixrestaurant13@gmail.com>", // Người gửi
            to: email, // Người nhận
            subject: subject, // Tiêu đề
            html: content, // Nội dung HTML
          };

          await sendMail.transporter.sendMail(mailOptions);
          return res
            .status(200)
            .json({ status: true, message: "Gửi mã xác minh qua email" });
        } catch (err) {
          return res
            .status(400)
            .json({ status: false, message: "Gửi mail thất bại" });
        }
      } else {
        return res
          .status(200)
          .json({ status: true, message: "Gui ma that bai" });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: "That bai" });
  }
});

//localhost:3000/user/forgotpass
router.post("/forgotpass", async function (req, res, next) {
  try {
    const { email, password, password2 } = req.body;

    const userMail = await userModel.findOne({ email: email });

    if (userMail && password === password2) {
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(password, salt);

      userMail.password = hash;
      await userMail.save();
      return res
        .status(200)
        .json({ status: true, message: "Cap nhat thanh cong" });
    } else {
      return res
        .status(200)
        .json({ status: true, message: "Cap nhat that bai" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: "Loi" });
  }
});

//localhost:3000/user/getInfoUser
router.get("/getInfoUser/:id", async function (req, res, next) {
  try {
    const { id } = req.params;
    const infoUser = await userModel.findById(id);
    return res
      .status(200)
      .json({ status: true, message: "Lay thanh cong", infoUser });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: "Loi he thong" });
  }
});

//localhost:3000/user/profileUpdate
router.post(
  "/profileUpdate/:id",
  [validationProfile],
  async function (req, res, next) {
    try {
      const { id } = req.params;
      const { name, birth, address, phoneNumber, gender, image } = req.body;
      const update = await userModel.findById(id);
      console.log(update);
      if (update) {
        update.name = name ? name : update.name;
        update.birth = birth ? birth : update.birth;
        update.phoneNumber = phoneNumber ? phoneNumber : update.phoneNumber;
        update.address = address ? address : update.address;
        update.gender = gender ? gender : update.gender;
        update.image = image ? image : update.image;
        await update.save();
        return res.status(200).json({
          status: true,
          message: "Cap Nhat Profile Thanh Cong",
          update: update,
        });
      } else {
        return res
          .status(400)
          .json({ status: false, message: "Cap Nhat Profile That Bai" });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({ status: false, message: "Loi he thong" });
    }
  }
);

//localhost:3000/user/upload-image
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

module.exports = router;
