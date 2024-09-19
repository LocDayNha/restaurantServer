const validationRegister = async (req, res, next) => {
    const { email, password, password2 } = req.body;

    if (!email || !password || !password2) {
        return res.status(400).json({ result: false, message: 'Vui lòng nhập đầy đủ thông tin' });
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ result: false, message: 'Email không hợp lệ' });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({
            result: false,
            message: 'Mật khẩu phải có ít nhất 6 ký tự, bao gồm cả chữ cái in hoa, chữ cái thường và số'
        });
    }

    if (password !== password2) {
        return res.status(400).json({ result: false, message: 'Mật khẩu và xác nhận mật khẩu không khớp' });
    }

    return next();
};

module.exports = { validationRegister };
