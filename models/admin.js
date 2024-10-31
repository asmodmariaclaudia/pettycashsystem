module.exports = (sequelize, DataTypes) => {
  const Admin = sequelize.define('Admin', {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Users', // Adjust to 'User' if necessary
        key: 'user_id',
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

  // Define association only once
  Admin.associate = (models) => {
    Admin.belongsTo(models.User, { foreignKey: 'user_id' });
  };

  return Admin;
};
