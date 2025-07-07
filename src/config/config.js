require('dotenv').config();

// en este caso usamos solo db de development, ustedes pueden usar distintas para su proyecto

module.exports = {
  "development": {
    "username": process.env.DB_USER,
    "password": process.env.DB_PASSWORD,
    "database": process.env.DB_NAME,
    "host": process.env.DB_HOST,
    "dialect": "postgres",
    "dialectOptions": {
      ssl: {
        require: false,
        rejectUnauthorized: false 
      }
    },
  },
}
