'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('user', 'user_role', {
      type: Sequelize.STRING(50),
      allowNull: true,
      comment: 'User role for supply chain: farmer, wholesaler, distributor, retailer, admin'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('user', 'user_role');
  }
};
