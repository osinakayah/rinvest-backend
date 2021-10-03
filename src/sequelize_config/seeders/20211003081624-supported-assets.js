'use strict';
const _ = require('lodash');
const { assets } = require('@liquality/cryptoassets');

module.exports = {
  up: (queryInterface, Sequelize) => {
    const assetsAsArr = _.values(assets);
    const dbValues = _.map(assetsAsArr, function (singleAsset) {
      return {
        ...singleAsset,
        createdAt: new Date(),
        updatedAt: new Date(),
        isEnable: false,
      };
    });
    return queryInterface.bulkInsert('Assets', dbValues, {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Assets', {}, {});
  },
};
