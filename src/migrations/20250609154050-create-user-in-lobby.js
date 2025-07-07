'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('UserInLobbies', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {model: "Users", key: "id"}
      },
      lobbyId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {model: "Lobbies", key: "id"}
      },
      choosenPokemonId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {model: "Pokemons", key: "id"}
      },
      status: {
        allowNull: false,
        type: Sequelize.ENUM(
          "inLobby",
          "exited",
          "dressing",
          "finishedDressing",
          "voting",
          "voted"
        ),
        defaultValue: "inLobby"
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
    await queryInterface.dropTable('UserInLobbies');
  }
};