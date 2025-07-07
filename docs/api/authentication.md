# Sign up / Log in routes

## POST /authentication/login
### Logs into the app
`https://mish-backend-25-1.onrender.com/authentication/login`

Request body example:
```json
{
    "email": "mish",
    "password": "mish"
}
```

Response body example:
```json
{
    "username": "mish",
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWd1bGFyUGxheWVyIl0sImlhdCI6MTc0OTg3NTE4OCwic3ViIjoiMCJ9.kNmFNHXyTXPAl5BtuGQE5lSDwnGEQzhsiCMBZzvIcSk",
    "token_type": "Bearer",
    "expires_in": "3h"
}
```

Returns a signed access token for authentication. 

### Status codes
- `200` on sucess.
- `400` on any user error. The error is detailed on the error message.

## POST /authentication/signup
### Signs a new account into the app
`https://mish-backend-25-1.onrender.com/authentication/signup`

Request body example:
```json
{
    "email": "mish",
    "username": "mish",
    "password": "mish",
    "profileDescription": "mish",
}
```

Response body example:
```json
{
    "id": 9,
    "email": "mish",
    "username": "mish",
    "profileDescription": "mish",
    "profileImgUrl": null,
    "favoritePokemonId": null,
    "type": "regularPlayer",
    "createdAt": "2025-06-14T04:47:52.350Z",
    "updatedAt": "2025-06-14T04:47:52.350Z"
}
```

Creates an user in the database using the parameters in the request body.

### Status codes
- `201` on sucess.
- `400` on any user error.