'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Assets', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        allowNull: false,
        primaryKey: true,
        unique: true,
      },
      asset: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      assetCode: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      assetType: {
        allowNull: false,
        type: Sequelize.ENUM,
        values: ['native', 'erc20', 'bep20'],
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('UserAddresses');
  },
};
