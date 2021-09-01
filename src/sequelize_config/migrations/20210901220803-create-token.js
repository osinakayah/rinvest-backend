'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Tokens', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        allowNull: false,
        primaryKey: true,
        unique: true,
      },
      userId: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      token: {
        allowNull: false,
        type: Sequelize.STRING,
        unique: true,
      },
      purpose: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      expiration: {
        allowNull: false,
        type: Sequelize.DATE,
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
    return queryInterface.dropTable('Users');
  },
};
