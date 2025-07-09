const adminModel = require("../models/admin");

const login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  try {
    const result = await adminModel.loginAdmin(username, password);
    res.json(result);
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
};

module.exports = {
  login,
};