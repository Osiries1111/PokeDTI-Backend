'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Reports', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      reportingUserInLobbyId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {model: "UserInLobbies", key: "id"}
      },
      reportedUserInLobbyId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {model: "UserInLobbies", key: "id"}
      },
      reason: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('Reports');
  }
};