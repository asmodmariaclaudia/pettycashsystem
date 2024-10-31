// migrations/[timestamp]-add-status-to-custodians.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Custodians', 'status', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'active',  // New custodians will be active by default
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Custodians', 'status');
  },
};
