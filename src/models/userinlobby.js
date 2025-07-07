'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserInLobby extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.User, {foreignKey: "userId"});
      this.belongsTo(models.Lobby, {foreignKey: "lobbyId"});
      this.hasMany(models.VotedFor, {foreignKey: "votingUserId"});
      this.hasMany(models.VotedFor, {foreignKey: "votedUserId"});
      this.hasMany(models.Report, {foreignKey: "reportingUserInLobbyId"});
      this.hasMany(models.Report, {foreignKey: "reportedUserInLobbyId"});
    }
  }
  UserInLobby.init({
    userId: DataTypes.INTEGER,
    lobbyId: DataTypes.INTEGER,
    //choosenPokemonId: DataTypes.INTEGER,
    status: DataTypes.ENUM(
      "inLobby",
      "exited",
      "dressing",
      "finishedDressing",
      "voting",
      "voted"
    ),
    dressImgUrl: DataTypes.STRING,
    choosenPokemon: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'UserInLobby',
  });
  return UserInLobby;
};