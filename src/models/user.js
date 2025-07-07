'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasMany(models.Lobby, {foreignKey: "hostId", onDelete: "CASCADE"});
      this.belongsTo(models.Pokemon, {foreignKey: "favoritePokemonId" });
      this.hasMany(models.UserInLobby, {foreignKey: "userId", onDelete: "CASCADE"});
    }
  }
  User.init({
    email: {
      type: DataTypes.STRING,
      unique: true
    },
    username: DataTypes.STRING,
    password: DataTypes.TEXT,
    profileDescription: DataTypes.TEXT,
    favoritePokemonId: DataTypes.INTEGER,
    type: DataTypes.ENUM("regularPlayer", "admin"),
    profileImgUrl: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};