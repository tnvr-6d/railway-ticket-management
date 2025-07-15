const pool = require("../db");

const loginAdmin = async (email, password) => {
  const adminRes = await pool.query(
    "SELECT admin_id, username, email, password_hash FROM admin WHERE email = $1 AND is_active = TRUE",
    [email]
  );

  if (adminRes.rows.length === 0) {
    throw new Error("Admin with this email not found or account is inactive");
  }

  const admin = adminRes.rows[0];
  
  // Using a simple password for the demo.
  const DEMO_PASSWORD = "password123";
  const isMatch = (password === DEMO_PASSWORD);

  if (!isMatch) {
    throw new Error("Invalid admin credentials.");
  }

  return {
    success: true,
    user: {
      admin_id: admin.admin_id,
      username: admin.username,
      email: admin.email,
    },
  };
};

module.exports = {
  loginAdmin,
};