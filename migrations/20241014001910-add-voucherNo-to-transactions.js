'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Transactions', 'voucherNo', {
      type: Sequelize.STRING,
      allowNull: false, // Adjust this based on your requirements
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Transactions', 'voucherNo');
  }
};
