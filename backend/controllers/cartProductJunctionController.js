const pool = require('../db');

const getAllCartProducts = async (req, res) => {
  try {
    const [results] = await pool.promise().query('SELECT * FROM CART_PRODUCT_JUNCTION');
    res.json(results);
  } catch (error) {
    console.error('Error fetching cart products:', error);
    res.status(500).json('Error fetching cart products from the database.');
  }
};

module.exports = {
  getAllCartProducts,
};
