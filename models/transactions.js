module.exports = (sequelize, DataTypes) => {
    const Transactions = sequelize.define('Transactions', {
      transaction_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true, // Assuming transaction_id should auto-increment
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users', // Reference to the Users table
          key: 'user_id',
        },
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      oRNo: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      amountGiven: {
        type: DataTypes.DECIMAL(10, 2), // Amount with two decimal places
        allowNull: false,
      },
      custodianName: {
        type: DataTypes.STRING,
        allowNull: false, // Ensure this is always provided
      },
      receiptImg: {
        type: DataTypes.STRING, 
        allowNull: true,
      },
      purchaser: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      employeeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      personalContri: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      storeName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'pending',
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
      approvedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'Admin', // Ensure this matches your Users table name
          key: 'user_id',
        },
      }
    });
  
    Transactions.associate = (models) => {
      Transactions.belongsTo(models.User, { foreignKey: 'user_id' });
      Transactions.belongsTo(models.Custodian, { foreignKey: 'user_id' });

      Transactions.hasMany(models.Items, { foreignKey: 'transaction_id', as: 'items' });

      Transactions.hasOne(models.Voucher, { foreignKey: 'transaction_id', as: 'voucher' });

      Transactions.belongsTo(models.Admin, { foreignKey: 'approvedBy', as: 'approver' });
    };
  
    return Transactions;
  };
  