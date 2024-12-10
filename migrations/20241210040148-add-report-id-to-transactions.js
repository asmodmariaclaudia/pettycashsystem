'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Transactions', 'report_id', {
      type: Sequelize.INTEGER,
      allowNull: true, // Allow NULL for existing transactions without reports
      references: {
        model: 'Reports', // Name of the referenced table
        key: 'report_id',        // Primary key in the Reports table
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL', // Set NULL if the associated report is deleted
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Transactions', 'report_id');
  }
};
