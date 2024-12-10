module.exports = (sequelize, DataTypes) => {
    const Reports = sequelize.define('Reports', {
      report_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      pettyCashStart: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      pettyCashEnd: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
      },
      voucherNumbers: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    });
  
    Reports.associate = (models) => {
      Reports.belongsTo(models.Custodian, { foreignKey: 'custodian_id' });
      Reports.hasMany(models.Transactions, { foreignKey: 'report_id', as: 'transactions' });
      Reports.hasMany(models.Voucher, { foreignKey: 'report_id', as: 'vouchers' });
    };
  
    return Reports;
  };
  