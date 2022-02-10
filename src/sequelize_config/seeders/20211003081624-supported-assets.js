'use strict';
const _ = require('lodash');
const { assets } = require('@liquality/cryptoassets');

module.exports = {
  up: (queryInterface, Sequelize) => {
    const assetsAsArr = _.values(assets);
    const dbValues = _.map(assetsAsArr, function (singleAsset) {
      const activatedChain = ['bitcoin', 'ethereum', 'bsc', 'internal'];
      return {
        ...singleAsset,
        createdAt: new Date(),
        updatedAt: new Date(),
        isEnable: activatedChain.includes(singleAsset.chain),
      };
    });
    return queryInterface.bulkInsert('Assets', dbValues, {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Assets', {}, {});
  },
};
