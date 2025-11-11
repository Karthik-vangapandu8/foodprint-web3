const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    'User',
    {
      ID: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      firstName: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      middleName: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      lastName: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: 'email',
      },
      phoneNumber: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: 'phoneNumber',
      },
      role: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      user_role: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'User role for supply chain: farmer, wholesaler, distributor, retailer, admin',
        validate: {
          isIn: [['farmer', 'wholesaler', 'distributor', 'retailer', 'admin']]
        }
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      registrationChannel: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      nationalIdPhotoHash: {
        type: DataTypes.BLOB,
        allowNull: true,
      },
      user_identifier_image_url: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      wallet_address: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: 'wallet_address',
        comment: 'User\'s connected Web3 wallet address (MetaMask, WalletConnect, etc.)',
      },
    },
    {
      sequelize,
      tableName: 'user',
      timestamps: false,
      indexes: [
        {
          name: 'user_PRIMARY',
          unique: true,
          using: 'BTREE',
          fields: [{ name: 'ID' }],
        },
        {
          name: 'user_email',
          unique: true,
          using: 'BTREE',
          fields: [{ name: 'email' }],
        },
        {
          name: 'user_phoneNumber',
          unique: true,
          using: 'BTREE',
          fields: [{ name: 'phoneNumber' }],
        },
        {
          name: 'user_wallet_address',
          unique: true,
          using: 'BTREE',
          fields: [{ name: 'wallet_address' }],
        },
      ],
    }
  );
};
