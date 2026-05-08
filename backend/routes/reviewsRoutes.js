const express = require('express');
const router = express.Router();
const reviewsController = require('../controllers/reviewsController');

router.get('/reviews', reviewsController.getAllReviews);
router.get('/reviews/product/:productId', reviewsController.getReviewsByProduct);
router.post('/reviews', reviewsController.createReview);
router.delete('/reviews/:id', reviewsController.deleteReview);

module.exports = router;
