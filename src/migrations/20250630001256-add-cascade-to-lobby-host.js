'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Elimina el constraint existente (si existe)
    await queryInterface.removeConstraint('Lobbies', 'Lobbies_hostId_fkey');
    // Agrega el constraint con ON DELETE CASCADE
    await queryInterface.addConstraint('Lobbies', {
      fields: ['hostId'],
      type: 'foreign key',
      name: 'Lobbies_hostId_fkey',
      references: {
        table: 'Users',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('Lobbies', 'Lobbies_hostId_fkey');
  }
};
