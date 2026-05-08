const pool = require('../db');

const getAllReviews = async (req, res) => {
  try {
    const [results] = await pool.promise().query('SELECT * FROM REVIEWS');
    res.json(results);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json('Error fetching reviews from the database.');
  }
};

const getReviewsByProduct = async (req, res) => {
  const { productId } = req.params;

  try {
    const [results] = await pool
      .promise()
      .query(
        `SELECT R.*, U.NAME as BUYER_NAME 
         FROM REVIEWS R JOIN USER U ON R.BUYER_ID = U.USER_ID 
         WHERE R.PRODUCT_ID = ?`,
        [productId]
      );
    res.json(results);
  } catch (error) {
    console.error('Error fetching reviews by product:', error);
    res.status(500).json('Error fetching reviews by product.');
  }
};

const createReview = async (req, res) => {
  const { starRating, reviewText, buyerId, productId } = req.body;

  if (!starRating || !buyerId || !productId) {
    return res.status(400).json({ message: 'starRating, buyerId, and productId are required.' });
  }
  const ratingNumber = Number(starRating);
  if (Number.isNaN(ratingNumber) || ratingNumber < 1 || ratingNumber > 5) {
    return res.status(400).json({ message: 'starRating must be between 1 and 5.' });
  }

  try {
    const reviewDate = new Date().toISOString().split('T')[0];
    await pool
      .promise()
      .query(
        'INSERT INTO REVIEWS (REVIEW_DATE, STAR_RATING, REVIEW_TEXT, BUYER_ID, PRODUCT_ID) VALUES (?, ?, ?, ?, ?)',
        [reviewDate, ratingNumber, reviewText || null, buyerId, productId]
      );
    res.status(201).json({ message: 'Review submitted.' });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json('Error creating review.');
  }
};

const deleteReview = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.promise().query('DELETE FROM REVIEWS WHERE REVIEW_ID = ?', [id]);
    res.status(200).json({ message: 'Review deleted.' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json('Error deleting review.');
  }
};

module.exports = {
  getAllReviews,
  getReviewsByProduct,
  createReview,
  deleteReview
};
