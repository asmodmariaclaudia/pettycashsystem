'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Reports', {
      report_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      startDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      endDate: {
        type: Sequelize.DATE,
        allowNull: true, // Null until the report ends
      },
      pettyCashStart: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      pettyCashEnd: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true, // Updated when funds are depleted
      },
      totalAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00, // Tracks total expenses
      },
      voucherNumbers: {
        type: Sequelize.TEXT,
        allowNull: true, // Stores voucher numbers as a comma-separated list
      },
      custodian_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Custodians', // Reference to the Custodian table
          key: 'user_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Reports');
  },
};
