'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Vouchers', 'approved_by', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Users', // Confirm the correct table name in your database
        key: 'user_id', // Ensure this matches the Users table's primary key
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL', // Adjust as needed
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Vouchers', 'approved_by');
  },
};
