'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Alter the column type of receiptImg to STRING
    await queryInterface.changeColumn('Transactions', 'receiptImg', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert the column type of receiptImg to BLOB
    await queryInterface.changeColumn('Transactions', 'receiptImg', {
      type: Sequelize.BLOB,
      allowNull: false,
    });
  },
};
