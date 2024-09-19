const validationProfile = async (req, res, next) => {
    const { name, birth, address, phoneNumber, gender } = req.body;

    if (!name || !birth || !address || !phoneNumber || !gender) {
        return res.status(400).json({ result: false, message: 'Vui lòng nhập đầy đủ thông tin' });
    }

    const nameRegex = /^[a-zA-Z\s]{5,}$/;
    if (!nameRegex.test(name)) {
        return res.status(400).json({ result: false, message: 'Tên phải có ít nhất 5 ký tự và không chứa ký tự đặc biệt' });
    }

    const birthDateRegex = /^([0-2][0-9]|3[0-1])\/(0[1-9]|1[0-2])\/\d{4}$/; // 10/10/1010 dd/mm/yy
    if (!birthDateRegex.test(birth)) {
        return res.status(400).json({ result: false, message: 'Ngày sinh không hợp lệ' });
    }
    const [day, month, year] = birth.split('/').map(Number);
    if (!Number.isInteger(year) || year <= 0) {
        return res.status(400).json({ result: false, message: 'Năm sinh không hợp lệ' });
    }
    if (!Number.isInteger(month) || month < 1 || month > 12) {
        return res.status(400).json({ result: false, message: 'Tháng sinh không hợp lệ' });
    }
    if (!Number.isInteger(day) || day < 1 || day > 31) {
        return res.status(400).json({ result: false, message: 'Ngày sinh không hợp lệ' });
    }
    const daysInMonth = new Date(year, month, 0).getDate();
    if (day > daysInMonth) {
        return res.status(400).json({ result: false, message: 'Ngày sinh không hợp lệ' });
    }

    const phoneNumberRegex = /^(\+84|84|0)[35789][0-9]{8}$/;
    if (!phoneNumberRegex.test(phoneNumber)) {
        return res.status(400).json({ result: false, message: 'Số điện thoại không hợp lệ' });
    }

    const validGenders = ['nam', 'nữ', 'khác'];
    if (!validGenders.includes(gender.toLowerCase())) {
        return res.status(400).json({ result: false, message: 'Giới tính không hợp lệ' });
    }

    return next();
};

module.exports = { validationProfile };
