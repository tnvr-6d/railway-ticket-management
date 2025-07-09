const pool = require("../db");

const loginAdmin = async (username, password) => {
  // First, find the admin by username
  const adminRes = await pool.query(
    "SELECT admin_id, username, password_hash FROM admin WHERE username = $1 AND is_active = TRUE",
    [username]
  );

  if (adminRes.rows.length === 0) {
    throw new Error("Admin not found or account is inactive");
  }

  const admin = adminRes.rows[0];

  // --- MODIFICATION FOR DEMO ---
  // The database password 'admin_hash_123' is impractical.
  // For this demo, we will use a simple, hardcoded password for the 'admin' user.
  // The correct password for the 'admin' user is now 'password123'.
  
  const DEMO_PASSWORD = "password123";
  const isMatch = (password === DEMO_PASSWORD);

  if (!isMatch) {
    throw new Error("Invalid username or password.");
  }

  // Return admin info, but exclude the password hash
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