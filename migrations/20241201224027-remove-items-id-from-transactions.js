'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove the items_id column from Transactions table
    await queryInterface.removeColumn('Transactions', 'items_id');
  },

  async down(queryInterface, Sequelize) {
    // Re-add the items_id column to Transactions table (in case we need to rollback)
    await queryInterface.addColumn('Transactions', 'items_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Items', // Reference to the Items table
        key: 'items_id',
      },
    });
  }
};
