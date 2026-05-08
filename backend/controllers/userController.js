const bcrypt = require('bcrypt');
const pool = require('../db'); 

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getAllUsers = async (req, res) => {
  try {
    const [results] = await pool.promise().query('SELECT * FROM USER');
    res.json(results);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json('Error fetching users from the database.');
  }
};

const signUpUser = async (req, res) => {
  const { email, password, name, phone_no, address, user_type } = req.body;

  if (!email || !password || !name || !user_type) {
    return res.status(400).json({ message: 'Email, password, name, and user type are required.' });
  }
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO USER (EMAIL, PASSWORD, NAME, PHONE_NO, ADDRESS, USER_TYPE) VALUES (?, ?, ?, ?, ?, ?)';
    const values = [email, hashedPassword, name, phone_no || null, address || null, user_type];
    await pool.promise().query(query, values);
    res.status(201).json({ message: 'User created successfully!' });
  } catch (error) {
    console.error('Error creating new user:', error);
    res.status(500).json('Error creating new user.');
  }
};

const signInUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format.' });
  }

  try {
    const [results] = await pool.promise().query('SELECT * FROM USER WHERE EMAIL = ?', [email]);
    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user = results[0];
    const match = await bcrypt.compare(password, user.PASSWORD);
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    res.status(200).json({ message: 'Sign-in successful!', user });
  } catch (error) {
    console.error('Error signing in:', error);
    res.status(500).json('Error signing in.');
  }
};

const getUserProfile = async (req, res) => {
  const userId = req.params.id; 

  try {
    const [results] = await pool.promise().query('SELECT * FROM USER WHERE USER_ID = ?', [userId]);
    if (results.length > 0) {
      res.status(200).json(results[0]);
    } else {
      res.status(404).json('User not found.');
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json('Error fetching user profile.');
  }
};

const updateUserProfile = async (req, res) => {
  const userId = req.params.id; 
  const { EMAIL, PASSWORD, NAME, PHONE_NO, ADDRESS, USER_TYPE } = req.body;

  try {
    const query = 'UPDATE USER SET EMAIL = ?, PASSWORD = ?, NAME = ?, PHONE_NO = ?, ADDRESS = ?, USER_TYPE = ? WHERE USER_ID = ?';
    const values = [EMAIL, PASSWORD, NAME, PHONE_NO, ADDRESS, USER_TYPE, userId];
    await pool.promise().query(query, values);
    res.status(200).json('User profile updated successfully!');
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json('Error updating user profile.');
  }
};

const deleteUserProfile = async (req, res) => {
  const userId = req.params.id; 

  try {
    await pool.promise().query('DELETE FROM USER WHERE USER_ID = ?', [userId]);
    res.status(200).json('User profile deleted successfully!');
  } catch (error) {
    console.error('Error deleting user profile:', error);
    res.status(500).json('Error deleting user profile.');
  }
};

module.exports = {
  getAllUsers,
  signUpUser,
  signInUser,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile
};
