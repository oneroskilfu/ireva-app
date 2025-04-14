const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// GET all users
router.get('/', userController.getUsers);

// GET specific user
router.get('/:id', userController.getUserById);

// POST create user
router.post('/', userController.createUser);

// PUT update user
router.put('/:id', userController.updateUser);

// DELETE user
router.delete('/:id', userController.deleteUser);

// GET user investments
router.get('/:id/investments', userController.getUserInvestments);

// GET user KYC status
router.get('/:id/kyc', userController.getUserKYCStatus);

// PUT update user KYC status
router.put('/:id/kyc', userController.updateUserKYCStatus);

module.exports = router;