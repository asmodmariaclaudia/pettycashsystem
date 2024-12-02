'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Transactions', 'status', {
      type: Sequelize.ENUM('pending', 'approved', 'rejected'), // Adjust values as needed
      allowNull: false,
      defaultValue: 'pending', // Default value
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Transactions', 'status');
  }
};
