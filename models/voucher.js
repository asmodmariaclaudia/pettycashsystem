module.exports = (sequelize, DataTypes) => {
  const Voucher = sequelize.define('Voucher', {
    voucher_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    transaction_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Transactions',
        key: 'transaction_id',
      },
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'User',
        key: 'user_id',
      },
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
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
    report_id: { // Add foreign key for Reports
      type: DataTypes.INTEGER,
      allowNull: true, // Allow null if not all vouchers are associated with a report initially
      references: {
        model: 'Reports',
        key: 'report_id',
      },
    },
  });

  // Define associations
  Voucher.associate = (models) => {
    Voucher.belongsTo(models.Transactions, { foreignKey: 'transaction_id' });
    Voucher.belongsTo(models.User, { foreignKey: 'user_id' });
    Voucher.belongsTo(models.Reports, { foreignKey: 'report_id', as: 'report' }); // New association
    
  };

  return Voucher;
};
