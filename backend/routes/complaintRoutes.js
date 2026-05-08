const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');

router.get('/complaints', complaintController.getAllComplaints);
router.post('/complaints', complaintController.createComplaint);
router.get('/complaints/buyer/:buyerId', complaintController.getComplaintsByBuyer);
router.post('/complaints/answer', complaintController.answerComplaint);

module.exports = router;
