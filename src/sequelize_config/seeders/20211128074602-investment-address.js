'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('InvestmentAddresses', [], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('InvestmentAddresses', {}, {});
  },
};
