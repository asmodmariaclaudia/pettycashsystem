module.exports = (sequelize, DataTypes) => {
    const Items = sequelize.define('Items', {
      items_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true, // Assuming items_id should auto-increment
      },
      transaction_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Transactions', // Reference to the Transactions table
          key: 'transaction_id',
        },
      },
      itemName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      itemAmount: {
        type: DataTypes.DECIMAL(10, 2), // Assuming the amount has two decimal places
        allowNull: false,
      },
      itemQuantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
  
    Items.associate = (models) => {
      Items.belongsTo(models.Transactions, {
        foreignKey: 'transaction_id',
        as: 'transaction',
      });
    };
  
    return Items;
  };
  