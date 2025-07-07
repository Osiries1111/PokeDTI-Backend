'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Report extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.UserInLobby, {as: "reportingUserInLobby", foreignKey: "reportingUserInLobbyId"});
      this.belongsTo(models.UserInLobby, {as: "reportedUserInLobby", foreignKey: "reportedUserInLobbyId"});
    }
  }
  Report.init({
    reportingUserInLobbyId: DataTypes.INTEGER,
    reportedUserInLobbyId: DataTypes.INTEGER,
    reason: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Report',
  });
  return Report;
};