const pool = require('../db');

const getAllProducts = async (req, res) => {
  try {
    const [results] = await pool.promise().query('SELECT * FROM PRODUCT');
    const products = results.map((product) => ({
      ...product,
      PICTURE: product.PICTURE
        ? `data:image/jpeg;base64,${product.PICTURE.toString('base64')}`
        : null
    }));
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json('Error fetching products from the database.');
  }
};

const insertProduct = async (req, res) => {
  const { quantity, description, price, available, name, picture, seller_id } = req.body;

  if (!name || !price || Number(price) <= 0 || !quantity || Number(quantity) <= 0) {
    return res.status(400).json({ message: 'Name, price, and quantity are required with valid values.' });
  }
  if (!Number.isInteger(Number(quantity)) || Number(quantity) <= 0) {
    return res.status(400).json({ message: 'Quantity must be a positive integer.' });
  }
  if (available !== undefined && available !== null && Number(available) < 0) {
    return res.status(400).json({ message: 'Available must be a non-negative number.' });
  }

  try {
    const pictureBuffer = picture ? Buffer.from(picture.split(',')[1], 'base64') : null;
    const query = 'INSERT INTO PRODUCT (QUANTITY, DESCRIPTION, PRICE, AVAILABLE, NAME, PICTURE, SELLER_ID) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const values = [quantity, description, price, available, name, pictureBuffer, seller_id];
    await pool.promise().query(query, values);
    res.status(201).json('Product inserted successfully!');
  } catch (error) {
    console.error('Error inserting new product:', error);
    res.status(500).json('Error inserting new product into the database.');
  }
};

const getProductsBySeller = async (req, res) => {
  const { sellerId } = req.params;

  try {
    const [results] = await pool.promise().query('SELECT * FROM PRODUCT WHERE SELLER_ID = ?', [sellerId]);
    const products = results.map((product) => ({
      ...product,
      PICTURE: product.PICTURE
        ? `data:image/jpeg;base64,${product.PICTURE.toString('base64')}`
        : null
    }));
    res.json(products);
  } catch (error) {
    console.error('Error fetching products by seller:', error);
    res.status(500).json('Error fetching products by seller from the database.');
  }
};

const getProductById = async (req, res) => {
  const { id } = req.params; 

  try {
    const [results] = await pool.promise().query('SELECT * FROM PRODUCT WHERE PRODUCT_ID = ?', [id]);
    if (results.length > 0) {
      const product = results[0];
      res.json({
        ...product,
        PICTURE: product.PICTURE
          ? `data:image/jpeg;base64,${product.PICTURE.toString('base64')}`
          : null
      });
    } else {
      res.status(404).json('Product not found.');
    }
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    res.status(500).json('Error fetching product from the database.');
  }
};

const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { NAME, DESCRIPTION, PRICE, QUANTITY, AVAILABLE, PICTURE } = req.body;

  try {
    const pictureBuffer = PICTURE ? Buffer.from(PICTURE.split(',')[1], 'base64') : null;
    const query = `
      UPDATE PRODUCT
      SET NAME = ?, DESCRIPTION = ?, PRICE = ?, QUANTITY = ?, AVAILABLE = ?, PICTURE = ?
      WHERE PRODUCT_ID = ?
    `;
    const values = [NAME, DESCRIPTION, PRICE, QUANTITY, AVAILABLE, pictureBuffer, id];
    await pool.promise().query(query, values);
    res.status(200).json('Product updated successfully!');
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json('Error updating product in the database.');
  }
};

const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.promise().query('DELETE FROM PRODUCT WHERE PRODUCT_ID = ?', [id]);
    res.status(200).json({ message: 'Product deleted.' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json('Error deleting product from the database.');
  }
};

module.exports = {
  getAllProducts,
  insertProduct,
  getProductsBySeller,
  getProductById,
  updateProduct,
  deleteProduct
};
