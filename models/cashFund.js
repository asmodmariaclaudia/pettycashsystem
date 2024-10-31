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
      custodian_no: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      custodian_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2), // Change as necessary for your needs
        allowNull: false,
      },
    });
  
    CashFund.associate = (models) => {
      CashFund.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
      });

      CashFund.belongsTo(models.Custodian, {
            foreignKey: 'custodian_no',
            as: 'custodian',
        });
    };
  
    return CashFund;
  };
  