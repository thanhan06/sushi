const path = require('path');

module.exports = {
  getIndex: (req, res) => {
    res.sendFile(path.join(__dirname, '../../UI/index.html'));
  },

  getAdmin: (req, res) => {
    res.sendFile(path.join(__dirname, '../../UI/admin.html'));
  },

  getNhanVien: (req, res) => {
    res.sendFile(path.join(__dirname, '../../UI/nhanvien.html'));
  },
};