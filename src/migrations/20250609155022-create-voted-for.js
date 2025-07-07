'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('VotedFors', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      votingUserId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {model: "UserInLobbies", key: 'id'}
      },
      votedUserId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {model: "UserInLobbies", key: 'id'}
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
    await queryInterface.dropTable('VotedFors');
  }
};