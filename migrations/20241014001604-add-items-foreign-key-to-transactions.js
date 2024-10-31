'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Transactions', 'items_id', {
      type: Sequelize.INTEGER,
      allowNull: false, // Set based on your requirements
      references: {
        model: 'Items', // Name of the target table
        key: 'items_id', // Key in the Items table
      },
      onDelete: 'CASCADE', // Optional, ensures integrity
      onUpdate: 'CASCADE',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Transactions', 'items_id');
  }
};
