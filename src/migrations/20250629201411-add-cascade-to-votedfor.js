'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Elimina las foreign keys existentes (si ya existen)
    await queryInterface.removeConstraint('VotedFors', 'VotedFors_votingUserId_fkey');
    await queryInterface.removeConstraint('VotedFors', 'VotedFors_votedUserId_fkey');

    // Agrega las foreign keys con ON DELETE CASCADE
    await queryInterface.addConstraint('VotedFors', {
      fields: ['votingUserId'],
      type: 'foreign key',
      name: 'VotedFors_votingUserId_fkey',
      references: {
        table: 'UserInLobbies',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addConstraint('VotedFors', {
      fields: ['votedUserId'],
      type: 'foreign key',
      name: 'VotedFors_votedUserId_fkey',
      references: {
        table: 'UserInLobbies',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('VotedFors', 'VotedFors_votingUserId_fkey');
    await queryInterface.removeConstraint('VotedFors', 'VotedFors_votedUserId_fkey');

  }
};
