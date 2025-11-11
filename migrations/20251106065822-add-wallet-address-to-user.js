'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    // Add wallet_address column to user table
    await queryInterface.addColumn('user', 'wallet_address', {
      type: Sequelize.STRING(255),
      allowNull: true,
      unique: true,
      comment: 'User\'s connected Web3 wallet address (MetaMask, WalletConnect, etc.)'
    });
  },

  async down (queryInterface, Sequelize) {
    // Remove wallet_address column from user table
    await queryInterface.removeColumn('user', 'wallet_address');
  }
};
