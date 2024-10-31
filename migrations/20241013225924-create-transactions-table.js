'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Transactions', {
      transaction_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users', // Ensure this matches the actual table name
          key: 'user_id', // Ensure this matches the column in Users table
        },
        onDelete: 'CASCADE', // Optional, but good for referential integrity
        onUpdate: 'CASCADE',
      },
      description: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      oRNo: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      amountGiven: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      receiptImg: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      purchaser: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      employeeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      personalContri: { // Fixed typo here
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      storeName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      total: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Transactions'); // Ensure consistent casing
  }
};
