'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
   await queryInterface.bulkInsert('Lobbies', 
    [
      {
        id: 0,
        hostId: 0,
        name: "mish", 
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]
  );
  },

  async down (queryInterface) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    
    return queryInterface.bulkDelete('Lobbies', null, {});
  }
};
