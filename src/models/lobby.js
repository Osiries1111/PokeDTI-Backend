'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Lobby extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.User, {foreignKey: "hostId"});
      this.hasMany(models.UserInLobby, {foreignKey: "lobbyId", onDelete: "CASCADE"});
    }
  }
  Lobby.init({
    hostId: DataTypes.INTEGER,
    name: DataTypes.STRING,
    maxPlayers: DataTypes.INTEGER,
    theme: DataTypes.STRING,
    status: DataTypes.ENUM(
      "waitingForPlayers",
      "finished",
      "dressing",
      "voting",
      "displayingResults"
    )
  }, {
    sequelize,
    modelName: 'Lobby',
  });
  return Lobby;
};