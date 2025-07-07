'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PlacedAccessories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      choosenPokemonId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {model: 'ChoosenPokemons', key: 'id'}
      },
      accessoryId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {model: 'Accessories', key: 'id'}
      },
      x: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      y: {
        allowNull: false,
        type: Sequelize.INTEGER
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
    await queryInterface.dropTable('PlacedAccessories');
  }
};