const pool = require("../database");

async function addTestDrive(user_id, inv_id, name, phone, email, test_date) {
  try {
    const sql = `
      INSERT INTO test_drive (
        user_id, inv_id, name, phone, email, test_date, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`;
    const result = await pool.query(sql, [
      user_id,
      inv_id,
      name,
      phone,
      email,
      test_date,
      "pendiente"
    ]);
    return result.rows[0];
  } catch (error) {
    console.error("Error adding test drive:", error);
    throw new Error("Database error adding test drive");
  }
}

module.exports = { addTestDrive };