'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Pokemon extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasMany(models.User, {foreignKey: "favoritePokemonId"});
    }
  }
  Pokemon.init({
    name: DataTypes.STRING,
    sprite: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Pokemon',
  });
  return Pokemon;
};