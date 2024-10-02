const validationLogin = async (req, res, next) => {
    const { email, pass } = req.body;

    if (!email || !pass) {
        return res.status(400).json({ result: false, message: 'Vui lòng nhập đầy đủ thông tin' });
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ result: false, message: 'Email không hợp lệ' });
    }

    return next();
};

module.exports = { validationLogin };
