'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Vouchers', 'report_id', {
      type: Sequelize.INTEGER,
      allowNull: true, // Allow null if not all vouchers will be associated with a report initially
      references: {
        model: 'Reports', // Reference the Reports table
        key: 'report_id',
      },
      onUpdate: 'CASCADE', // Update on changes to the referenced key
      onDelete: 'SET NULL', // Set to NULL if the referenced report is deleted
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Vouchers', 'report_id');
  },
};
