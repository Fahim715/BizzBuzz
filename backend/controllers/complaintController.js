const pool = require('../db');

const getAllComplaints = async (req, res) => {
  try {
    const [results] = await pool.promise().query('SELECT * FROM COMPLAINT');
    res.json(results);
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json('Error fetching complaints from the database.');
  }
};

const createComplaint = async (req, res) => {
  const { question, buyerId } = req.body;

  if (!question || !buyerId) {
    return res.status(400).json({ message: 'Question and buyerId are required.' });
  }

  try {
    const [result] = await pool
      .promise()
      .query('INSERT INTO COMPLAINT (QUESTION, BUYER_ID) VALUES (?, ?)', [question, buyerId]);
    res.status(201).json({ message: 'Complaint submitted.', complaintId: result.insertId });
  } catch (error) {
    console.error('Error creating complaint:', error);
    res.status(500).json('Error creating complaint.');
  }
};

const getComplaintsByBuyer = async (req, res) => {
  const { buyerId } = req.params;

  try {
    const [results] = await pool
      .promise()
      .query('SELECT * FROM COMPLAINT WHERE BUYER_ID = ?', [buyerId]);
    res.json(results);
  } catch (error) {
    console.error('Error fetching complaints by buyer:', error);
    res.status(500).json('Error fetching complaints by buyer.');
  }
};

const answerComplaint = async (req, res) => {
  const { complaintId, answer, adminId } = req.body;

  if (!complaintId || !answer || !adminId) {
    return res.status(400).json({ message: 'complaintId, answer, and adminId are required.' });
  }

  try {
    await pool
      .promise()
      .query('UPDATE COMPLAINT SET ANSWER = ?, ADMIN_ID = ? WHERE COMPLAINT_ID = ?', [
        answer,
        adminId,
        complaintId
      ]);
    res.status(200).json({ message: 'Complaint answered.' });
  } catch (error) {
    console.error('Error answering complaint:', error);
    res.status(500).json('Error answering complaint.');
  }
};

module.exports = {
  getAllComplaints,
  createComplaint,
  getComplaintsByBuyer,
  answerComplaint
};
