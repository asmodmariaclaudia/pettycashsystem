// migrations/[timestamp]-create-cash-fund-table.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Code to create the CashFund table
    await queryInterface.createTable('CashFunds', {
      cashF_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'user_id',
        },
      },
      custodian_no: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      custodian_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      amount: {
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

  async down(queryInterface, Sequelize) {
    // Code to drop the CashFund table
    await queryInterface.dropTable('CashFunds');
  },
};
