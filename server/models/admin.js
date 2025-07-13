const pool = require("../db");

const loginAdmin = async (username, password) => {

  const adminRes = await pool.query(
    "SELECT admin_id, username, password_hash FROM admin WHERE username = $1 AND is_active = TRUE",
    [username]
  );

  if (adminRes.rows.length === 0) {
    throw new Error("Admin not found or account is inactive");
  }

  const admin = adminRes.rows[0];


  
  const DEMO_PASSWORD = "password123";
  const isMatch = (password === DEMO_PASSWORD);

  if (!isMatch) {
    throw new Error("Invalid username or password.");
  }


  return {
    success: true,
    user: {
      admin_id: admin.admin_id,
      username: admin.username,
    },
  };
};

module.exports = {
  loginAdmin,
};