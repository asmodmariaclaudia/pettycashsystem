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
    full_name: {
      type: DataTypes.STRING, 
      allowNull: false,       
    },
    signature: {
      type: DataTypes.STRING,
      allowNull: true,
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
