'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Elimina el constraint existente (si existe)
    await queryInterface.removeConstraint('UserInLobbies', 'UserInLobbies_userId_fkey');

    // Agrega el constraint con ON DELETE CASCADE
    await queryInterface.addConstraint('UserInLobbies', {
      fields: ['userId'],
      type: 'foreign key',
      name: 'UserInLobbies_userId_fkey',
      references: {
        table: 'Users',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeConstraint('UserInLobbies', 'UserInLobbies_userId_fkey');
    // (Opcional) Puedes volver a agregar el constraint sin CASCADE si lo deseas
  }
};
