'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('UserInvestments', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        allowNull: false,
        primaryKey: true,
        unique: true,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      assetId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Assets',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      amount: {
        allowNull: false,
        type: Sequelize.STRING,
        defaultValue: '0',
      },
      status: {
        allowNull: false,
        type: Sequelize.ENUM,
        defaultValue: 'PENDING',
        values: ['PENDING', 'CONFIRMED', 'FAILED'],
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
    return queryInterface.dropTable('UserInvestments');
  },
};
