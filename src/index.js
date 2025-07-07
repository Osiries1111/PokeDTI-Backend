const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const router = require('./routes');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
const PokeSocket = require('./websocket/websocket');

class PokeApp {
  #app;
  #socket;
  
  constructor(){
    this.#app = express();
    this.#socket = new PokeSocket(this.#app);
  }

  start() {
    this.#setup();
    this.#socket.start();
    this.#listen();
  }

  #setup() {
    this.#setUpRouterAndMiddleware();
    this.#setUpCloudnary();
  }

  #setUpRouterAndMiddleware(){

    const corsOptions = {
      origin: ['https://poke-dti.netlify.app'],
      //origin: ['http://localhost:5173'],
      credentials: true,
  };

    const middlewareArray = [
      cors(corsOptions), 
      bodyParser.json(), 
      morgan('dev'),
      router
    ];
    middlewareArray.forEach((middleware) => this.#app.use(middleware));
  }

  #setUpCloudnary() {
    cloudinary.config({secure: true});
  }

  #listen() {
    const port = 3000;
    const callbackOnStart = () => {
      console.log('Servidor escuchando en el puerto 3000');
    }
    this.#app.listen(port, callbackOnStart);
  }
}

const pokeApp = new PokeApp();
pokeApp.start();