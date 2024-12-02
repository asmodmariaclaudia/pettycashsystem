'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Modify the columns to change the allowNull constraint
    await queryInterface.changeColumn('Transactions', 'oRNo', {
      type: Sequelize.STRING,
      allowNull: true, // Change this value to true or false as needed
    });

    await queryInterface.changeColumn('Transactions', 'receiptImg', {
      type: Sequelize.STRING,
      allowNull: true, // Change this value to true or false as needed
    });

    await queryInterface.changeColumn('Transactions', 'personalContri', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true, // Change this value to true or false as needed
    });

    await queryInterface.changeColumn('Transactions', 'storeName', {
      type: Sequelize.STRING,
      allowNull: true, // Change this value to true or false as needed
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert the columns back to their original allowNull settings
    await queryInterface.changeColumn('Transactions', 'oRNo', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.changeColumn('Transactions', 'receiptImg', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.changeColumn('Transactions', 'personalContri', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    });

    await queryInterface.changeColumn('Transactions', 'storeName', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  }
};
