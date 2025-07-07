'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class VotedFor extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.UserInLobby, {foreignKey: "votingUserId"});
      this.belongsTo(models.UserInLobby, {foreignKey: "votedUserId"});
    }
  }
  VotedFor.init({
    votingUserId: DataTypes.INTEGER,
    votedUserId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'VotedFor',
  });
  return VotedFor;
};