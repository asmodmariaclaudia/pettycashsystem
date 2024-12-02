'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Admins', 'signature', {
      type: Sequelize.STRING, // Change to STRING
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Admins', 'signature', {
      type: Sequelize.BLOB, // Revert to BLOB if you need to undo
      allowNull: true,
    });
  }
};
