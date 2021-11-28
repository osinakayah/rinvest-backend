'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Transactions', {
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
      transactionType: {
        allowNull: false,
        type: Sequelize.ENUM,
        values: ['WITHDRAWAL', 'DEPOSIT'],
        comment:
          'Transaction type to represent if it is a withdrawal or deposit',
      },
      amount: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      destinationAddress: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      txHash: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      transactionStatus: {
        allowNull: false,
        type: Sequelize.ENUM,
        values: ['CONFIRMING', 'FAILED', 'CONFIRMED'],
        comment: 'The status of the transaction,',
      },
      network: {
        allowNull: false,
        type: Sequelize.ENUM,
        values: ['BTC', 'ETH', 'BSC', 'INTERNAL'],
        comment: 'The network on which this transaction was made',
      },
      metaData: {
        type: Sequelize.JSON,
        defaultValue: {},
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
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Transactions');
  },
};
