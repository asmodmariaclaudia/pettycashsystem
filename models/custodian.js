module.exports = (sequelize, DataTypes) => {
    const Custodian = sequelize.define('Custodian', {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'Users', // Reference to the Users table
          key: 'user_id',
        },
      },
      custodian_no: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // Ensures custodian_no is unique
      },
      custodian_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'active', // Default status as 'active'
      },
      cashF_id: {
        type: DataTypes.INTEGER,
        allowNull: false, 
        references: {
          model: 'CashFunds', // Reference to the CashFund table
          key: 'cashF_id',
        },
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });
  
    Custodian.associate = (models) => {
      Custodian.belongsTo(models.User, { foreignKey: 'user_id' });
      Custodian.belongsTo(models.CashFund, { foreignKey: 'cashF_id' });
      Custodian.hasMany(models.Transactions, { foreignKey: 'user_id' }); // Link via user_id
  };
  
    return Custodian;
  };
  