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
      name: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      code: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      decimals: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      contractAddress: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      matchingAsset: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      color: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      coinGeckoId: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      chain: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      type: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      isEnable: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: false,
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
    return queryInterface.dropTable('Assets');
  },
};
