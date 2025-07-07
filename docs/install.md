# Instala las dependencias 

```bash
yarn
```

Si no tienes `yarn` instalado, puedes instalarlo con:
```bash
npm install --global yarn
```

# Crea las credenciales que quieras en un .env

```bash
cp .env.example .env
```

El archivo `.env.example` tiene las variables necesarias para iniciar el servidor, puedes cambiarlas a tu gusto:
```dotenv
DB_USER = "aaossa"
DB_PASSWORD = "pwd"
DB_NAME = "demo_dev"
DB_HOST = "localhost"
JWT_SECRET = jwt_secret
```

# Inicializa PostgreSQL
Asumiendo que tienes psql instalado y con su servicio iniciado, crea un usuario con las mismas credenciales que en tu `.env`:
```
> sudo -i -u postgres
postgres@LAPTOP-C5PQL48R:~$ createuser aaossa
postgres@LAPTOP-C5PQL48R:~$ psql
psql (12.16 (Ubuntu 12.16-0ubuntu0.20.04.1))
Type "help" for help.

postgres=# alter user aaossa with encrypted password 'pwd';
ALTER ROLE
postgres=# alter user aaossa createdb;
ALTER ROLE
postgres=# exit
postgres@LAPTOP-C5PQL48R:~$ exit
logout
```

Si ya tienes un usuario con esos permisos, puedes usar sus credenciales en el archivo `.env` y saltarte este paso.

# Crear la base de datos
Permite que `sequelize` inicialize la base de datos local por ti:
```bash
yarn sequelize-cli db:create
```

# Ejecuta las migraciones
Una vez que la base de datos esté lista, puedes migrar los cambios hechos:
```bash
yarn sequelize-cli db:migrate
```

# Seedea la base de datos (opcional)
Puedes seedear la base de datos con los archivos que proporcionamos:
```bash
yarn sequelize-cli db:seed:all
```

# Inicia el servidor local
Vas a tener una instancia de un servidor hosteando el backend en tu computador.
```bash
yarn dev
```