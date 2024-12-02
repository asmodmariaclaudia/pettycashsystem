// models/CashFund.js
module.exports = (sequelize, DataTypes) => {
    const CashFund = sequelize.define('CashFund', {
      cashF_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users', // Reference to the Users table
          key: 'user_id',
        },
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2), // Change as necessary for your needs
        allowNull: false,
      },
    });
  
    CashFund.associate = (models) => {
      CashFund.belongsTo(models.User, { foreignKey: 'user_id' });
      CashFund.hasMany(models.Custodian, { foreignKey: 'cashF_id'});
  };
  
    return CashFund;
  };
  