'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.removeConstraint('UserInLobbies', 'UserInLobbies_lobbyId_fkey');

    await queryInterface.addConstraint('UserInLobbies', {
      fields: ['lobbyId'],
      type: 'foreign key',
      name: 'UserInLobbies_lobbyId_fkey',
      references: {
        table: 'Lobbies',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint('UserInLobbies', 'UserInLobbies_lobbyId_fkey');

    await queryInterface.addConstraint('UserInLobbies', {
      fields: ['lobbyId'],
      type: 'foreign key',
      name: 'UserInLobbies_lobbyId_fkey',
      references: {
        table: 'Lobbies',
        field: 'id',
      },
      onDelete: 'NO ACTION',
      onUpdate: 'CASCADE',
    });
  }
};
