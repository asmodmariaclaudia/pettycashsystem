// migrations/[timestamp]-make-voucherNo-unique.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Transactions', 'voucherNo', {
      type: Sequelize.STRING,
      allowNull: false,  // Ensure that voucherNo is not null
      unique: true,      // Add the unique constraint
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Transactions', 'voucherNo', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: false,      // Remove the unique constraint in case of rollback
    });
  },
};
