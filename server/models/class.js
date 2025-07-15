const pool = require("../db");

const getAllClasses = async () => {
    const { rows } = await pool.query("SELECT class_type FROM class ORDER BY class_id");
    return rows;
};

module.exports = {
    getAllClasses,
};