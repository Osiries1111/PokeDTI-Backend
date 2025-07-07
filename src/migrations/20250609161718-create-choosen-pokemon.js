'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ChoosenPokemons', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userInlobbyId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {model: 'UserInLobbies', key: 'id'}
      },
      pokemonId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {model: 'Pokemons', key: 'id'}
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
    await queryInterface.dropTable('choosenPokemons');
  }
};