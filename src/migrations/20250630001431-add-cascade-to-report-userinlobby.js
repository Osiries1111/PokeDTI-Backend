'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Elimina los constraints existentes (si existen)
    await queryInterface.removeConstraint('Reports', 'Reports_reportingUserInLobbyId_fkey');
    await queryInterface.removeConstraint('Reports', 'Reports_reportedUserInLobbyId_fkey');
    // Agrega los constraints con ON DELETE CASCADE
    await queryInterface.addConstraint('Reports', {
      fields: ['reportingUserInLobbyId'],
      type: 'foreign key',
      name: 'Reports_reportingUserInLobbyId_fkey',
      references: {
        table: 'UserInLobbies',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
    await queryInterface.addConstraint('Reports', {
      fields: ['reportedUserInLobbyId'],
      type: 'foreign key',
      name: 'Reports_reportedUserInLobbyId_fkey',
      references: {
        table: 'UserInLobbies',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('Reports', 'Reports_reportingUserInLobbyId_fkey');
    await queryInterface.removeConstraint('Reports', 'Reports_reportedUserInLobbyId_fkey');
    // (Opcional) Puedes volver a agregar los constraints sin CASCADE si lo deseas
  }
};
