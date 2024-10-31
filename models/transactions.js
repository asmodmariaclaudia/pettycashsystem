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
        allowNull: false,
      },
      amountGiven: {
        type: DataTypes.DECIMAL(10, 2), // Amount with two decimal places
        allowNull: false,
      },
      receiptImg: {
        type: DataTypes.STRING, // Path or URL of the receipt image
        allowNull: false,
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
        allowNull: false,
      },
      storeName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      voucherNo: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // Ensures voucherNo is unique
      },
      items_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Items', // Reference to the Items table
          key: 'items_id',
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
  
    Transactions.associate = (models) => {
      Transactions.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
      });
  
      Transactions.belongsTo(models.Items, {
        foreignKey: 'items_id',
        as: 'items',
      });
    };
  
    return Transactions;
  };
  