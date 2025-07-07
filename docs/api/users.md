Any request that needs an user id may return the following status codes:
- `400` on invalid id format.
- `404` on user not found.

Any request that doesn't fulfill the authorization requirements returns:
- `403` Forbidden

`GET` requests return status code `200` on sucess.

# GET /users
## Lists all users
`https://mish-backend-25-1.onrender.com/users`

Response body example:
```json
[
    {
        "id": 0,
        "email": "mish@uc.cl",
        "username": "mish",
        "profileDescription": "mish",
        "profileImgUrl": null,
        "favoritePokemonId": null,
        "type": "regularPlayer",
        "createdAt": "2025-06-08T19:25:31.760Z",
        "updatedAt": "2025-06-08T19:25:31.760Z"
    }
]
```

Returns a list of current users. Requires admin permission.

# GET /users/public
## Lists all users (only public information)
`https://mish-backend-25-1.onrender.com/users/public?id=0`

Response body example:
```json
[
    {
        "id": 0,
        "username": "mish",
        "profileImgUrl": null,
    }
]
```

Returns a list of user only with publicly available information. Requires to be authenticated.

# GET /users/:id
## Retrieve an user
`https://mish-backend-25-1.onrender.com/users/0`

Response body example:
```json
{
    "id": 0,
    "email": "mish@uc.cl",
    "username": "mish",
    "password": "mish",
    "profileDescription": "mish",
    "favoritePokemonId": null,
    "type": "regularPlayer",
    "createdAt": "2025-06-08T19:25:31.760Z",
    "updatedAt": "2025-06-08T19:25:31.760Z"
}
```

Returns an user using the ID specified in the request path. Requires to be authenticated as the user or to have admin permissions.

# GET /users/count
## Retrieve user count
`https://mish-backend-25-1.onrender.com/users/count`

Response body example:
```json
1
```

Returns the amount of users registered in the app. Doesn't require any permission.

# PATCH /users/:id
## Update an user
`https://mish-backend-25-1.onrender.com/users/5`

Request body example:
```json
{
    "email": "mish@gmail.com",
}
```

Response body example:
```json
{
    "id": 5,
    "email": "mish@gmail.com",
    "username": "mish",
    "profileDescription": "mish",
    "favoritePokemonId": null,
    "type": "regularPlayer",
    "createdAt": "2025-06-07T17:49:40.083Z",
    "updatedAt": "2025-06-07T17:49:40.083Z"
}
```

Updates an user in the database using the parameters in the request body. Requires to be authenticated as the user or admin permissions.

# DELETE /users/:id
## Delete an user
`https://mish-backend-25-1.onrender.com/users/5`

Removes the user from the database. Requires to be authenticated as the same user or to have admin permissions.

