var express = require('express');
var router = express.Router();

// Import ethers - handle both v5 and v6
let ethers;
try {
  ethers = require('ethers');
} catch (e) {
  console.log('Ethers library not available for server-side validation');
}

var initModels = require('../models/init-models');
var sequelise = require('../config/db/db_sequelise');
var models = initModels(sequelise);

// Helper function to validate Ethereum address format
function isValidAddress(address) {
  // Check if address is a valid Ethereum address (0x + 40 hex chars)
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * @swagger
 * /app/wallet/connect:
 *   post:
 *     summary: Connect wallet address to user account
 *     tags: [Wallet]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               walletAddress:
 *                 type: string
 *                 description: User's wallet address from MetaMask/WalletConnect
 *               signature:
 *                 type: string
 *                 description: Signed message to verify wallet ownership
 *     responses:
 *       200:
 *         description: Wallet connected successfully
 *       400:
 *         description: Invalid wallet address or signature
 *       401:
 *         description: User not authenticated
 */
router.post('/connect', async function (req, res) {
  try {
    const { walletAddress, signature, message, userRole } = req.body;

    // Validate wallet address format
    if (!walletAddress || !isValidAddress(walletAddress)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid wallet address format.',
      });
    }

    // Validate role
    const validRoles = ['farmer', 'wholesaler', 'distributor', 'retailer', 'admin'];
    if (!userRole || !validRoles.includes(userRole)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be one of: farmer, wholesaler, distributor, retailer, admin',
      });
    }

    // Map lowercase roles to application role format (capitalize first letter)
    const roleMap = {
      'farmer': 'Farmer',
      'wholesaler': 'Wholesaler',
      'distributor': 'Distributor',
      'retailer': 'Retailer',
      'admin': 'Admin',
    };
    const mappedRole = roleMap[userRole];

    // Verify signature if provided (optional for now, but recommended)
    if (signature && message && ethers && ethers.utils) {
      try {
        const recoveredAddress = ethers.utils.verifyMessage(message, signature);
        if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
          return res.status(400).json({
            success: false,
            message: 'Signature verification failed. Wallet address mismatch.',
          });
        }
      } catch (error) {
        console.error('Signature verification error:', error);
        return res.status(400).json({
          success: false,
          message: 'Invalid signature.',
        });
      }
    }

    // Check if wallet already exists
    let user = await models.User.findOne({
      where: {
        wallet_address: walletAddress.toLowerCase(),
      },
    });

    if (user) {
      // Update existing user's role (using old 'role' field for compatibility)
      await models.User.update(
        { 
          role: mappedRole,
          user_role: userRole,
        },
        {
          where: {
            ID: user.ID,
          },
        }
      );
      
      // Refetch user to get updated data
      user = await models.User.findOne({
        where: {
          wallet_address: walletAddress.toLowerCase(),
        },
      });
      
      console.log(`Wallet ${walletAddress} reconnected with role ${mappedRole}`);
      
      // Log user in by setting session (promisified)
      await new Promise((resolve, reject) => {
        req.login(user, (err) => {
          if (err) {
            console.error('Error logging in user:', err);
            reject(err);
          } else {
            resolve();
          }
        });
      });

      return res.status(200).json({
        success: true,
        message: 'Wallet connected successfully!',
        walletAddress: walletAddress.toLowerCase(),
        userRole: userRole,
      });
    } else {
      // Create new user account with wallet
      const phoneNumber = `wallet_${walletAddress.substring(2, 12)}`; // Generate unique phone from wallet
      
      const userData = {
        wallet_address: walletAddress.toLowerCase(),
        role: mappedRole,  // Use old 'role' field for compatibility
        user_role: userRole,  // Keep new field too
        phoneNumber: phoneNumber,
        email: `${walletAddress.toLowerCase()}@wallet.foodprint`,
        firstName: mappedRole, // Use capitalized role name
        registrationChannel: 'wallet',
      };
      
      console.log('Creating user with data:', userData);
      
      user = await models.User.create(userData);
      
      console.log(`New user created with wallet ${walletAddress} as ${mappedRole}`, user.toJSON());
      
      // Log user in by setting session (promisified)
      await new Promise((resolve, reject) => {
        req.login(user, (err) => {
          if (err) {
            console.error('Error logging in user:', err);
            reject(err);
          } else {
            resolve();
          }
        });
      });

      return res.status(200).json({
        success: true,
        message: 'Wallet connected successfully!',
        walletAddress: walletAddress.toLowerCase(),
        userRole: userRole,
      });
    }
  } catch (error) {
    console.error('Wallet connect error:', error);
    res.status(500).json({
      success: false,
      message: 'Error connecting wallet: ' + error.message,
    });
  }
});

/**
 * @swagger
 * /app/wallet/disconnect:
 *   post:
 *     summary: Disconnect wallet from user account
 *     tags: [Wallet]
 *     responses:
 *       200:
 *         description: Wallet disconnected successfully
 *       401:
 *         description: User not authenticated
 */
router.post('/disconnect', async function (req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated.',
      });
    }

    // Remove wallet address from user
    await models.User.update(
      { wallet_address: null },
      {
        where: {
          ID: req.user.id,
        },
      }
    );

    console.log(`Wallet disconnected from user ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Wallet disconnected successfully!',
    });
  } catch (error) {
    console.error('Wallet disconnect error:', error);
    res.status(500).json({
      success: false,
      message: 'Error disconnecting wallet: ' + error.message,
    });
  }
});

/**
 * @swagger
 * /app/wallet/status:
 *   get:
 *     summary: Get wallet connection status
 *     tags: [Wallet]
 *     responses:
 *       200:
 *         description: Wallet status retrieved
 *       401:
 *         description: User not authenticated
 */
router.get('/status', async function (req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated.',
      });
    }

    // Get user's wallet info
    const user = await models.User.findOne({
      attributes: ['ID', 'email', 'wallet_address', 'user_role'],
      where: {
        ID: req.user.id,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      walletConnected: !!user.wallet_address,
      walletAddress: user.wallet_address || null,
      userRole: user.user_role || null,
    });
  } catch (error) {
    console.error('Wallet status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting wallet status: ' + error.message,
    });
  }
});

module.exports = router;

