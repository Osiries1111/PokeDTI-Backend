'use strict';
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface) {
    return queryInterface.bulkInsert('Users', [
      {
        id: 0,
        email: "mish@uc.cl",
        username: "mish",
        password: await bcrypt.hash("mish", 4),
        profileDescription: "mish",
        type: "regularPlayer",
        // agregar seeds de lobby 
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
              id: 99,
              email: "admin@mish.cl",
              username: "mish_admin",
              password: await bcrypt.hash("mish", 4),
              profileDescription: "Tengo el poder",
              type: "admin", // Asegúrate de que el modelo User tenga un campo 'type'
              // agregar seeds de lobby 
              createdAt: new Date(),
              updatedAt: new Date()
            }
    ])
  },

  async down (queryInterface) {
    return queryInterface.bulkDelete('Users', null, {})
  }
};
