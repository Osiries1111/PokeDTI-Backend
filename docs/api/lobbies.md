Any request that needs a lobby id may return the following status codes:
- `400` on invalid id format.
- `404` on lobby not found.

Any lobby request that doesn't fulfill the authorization requirements returns:
- `403` Forbidden
`GET` requests return status code `200` on sucess.

# GET /lobbies
## Lists all lobbies
`https://mish-backend-25-1.onrender.com/lobbies`

Response body example:
```json
[
    {
        "id": 2,
        "hostId": 0,
        "name": "mish",
        "maxPlayers": 8,
        "theme": "formal",
        "status": "waitingForPlayers",
        "createdAt": "2025-06-08T19:28:10.293Z",
        "updatedAt": "2025-06-08T19:28:10.293Z"
    }
]
```

Returns a list of all lobbies ever made, even those that already finished. Requires admin permissions.

# GET /lobbies/:id
## Retrieve a lobby
`https://mish-backend-25-1.onrender.com/lobbies/2`

Response body example:
```json
{
    "id": 2,
    "hostId": 0,
    "name": "mish",
    "maxPlayers": 8,
    "theme": "formal",
    "status": "waitingForPlayers",
    "createdAt": "2025-06-08T19:28:10.293Z",
    "updatedAt": "2025-06-08T19:28:10.293Z"
}
```

Returns a lobby using the ID specified in the request path. Requires the user to be in the lobby or to have admin permissions.
If lobby status is "finished" returns status code `400`.
# GET /lobbies/active
## Retrieve active lobbies
`https://mish-backend-25-1.onrender.com/lobbies/active`

Response body example:
```json
[
    {
        "id": 2,
        "hostId": 0,
        "name": "mish",
        "maxPlayers": 8,
        "theme": "formal",
        "status": "waitingForPlayers",
        "createdAt": "2025-06-08T19:28:10.293Z",
        "updatedAt": "2025-06-08T19:28:10.293Z"
    }
]
```

Returns all lobbies where status is not "finished". Requires to be authenticated.

# GET /lobbies/count
## Retrieve lobby count
`https://mish-backend-25-1.onrender.com/lobbies/count`

Response body example:
```json
1
```

Returns the total number of lobbies. Public entrypoint.

# GET /lobbies/count-users
## Retrieve Users in lobbies
`https://mish-backend-25-1.onrender.com/lobbies/count-users/ids?=0,1`

Response body example:
```json
[
    {
        "lobbyId": "0",
        "count": 0
    },
    {
        "lobbyId": "1",
        "count": 3
    },
]
```

Returns the total number users connected to lobbies specified in query params. Requires to be authenticated.

# GET /lobbies/:id/users
## Retrieve Users in lobby
`https://mish-backend-25-1.onrender.com/lobbies/18/users`

Response body example:
```json
[
    {
        "id": 54,
        "userId": 2,
        "lobbyId": 18,
        "status": "voted",
        "dressImgUrl": "https://res.cloudinary.com/dn2ezugwb/image/upload/v1751202199/dress/lobby_18/2.png",
        "choosenPokemon": 16,
        "createdAt": "2025-06-29T12:23:15.520Z",
        "updatedAt": "2025-06-29T13:03:45.793Z"
    },
    {
        "id": 55,
        "userId": 1,
        "lobbyId": 18,
        "status": "voted",
        "dressImgUrl": "https://res.cloudinary.com/dn2ezugwb/image/upload/v1751202198/dress/lobby_18/1.png",
        "choosenPokemon": 8,
        "createdAt": "2025-06-29T12:24:19.341Z",
        "updatedAt": "2025-06-29T13:03:43.622Z"
    }
]
```

Returns the users connected to the requested lobby. Requires to be a lobby member or admin permissions.

# POST /lobbies
## Create a lobby
`https://mish-backend-25-1.onrender.com/lobbies`

Request body example:
```json
{
    "hostId": 0,
    "name": "example name",
    "maxPlayers": 4,
    "theme": "my theme",
}
```

Response body example:
```json
{
    "id": 3,
    "hostId": 0,
    "name": "example name",
    "maxPlayers": 4,
    "theme": "my theme",
    "updatedAt": "2025-06-08T19:51:22.170Z",
    "createdAt": "2025-06-08T19:51:22.170Z",
    "status": "waitingForPlayers"
}
```

Creates a lobby in the database using the parameters in the request body. Returns status code `201`. Requires to be authenticated.

# PATCH /lobbies/:id
## Update a lobby
`https://mish-backend-25-1.onrender.com/lobby/3`

Request body example:
```json
{
    "name": "nuevo nombre para lobby"
}
```

Updates a lobby in the database using the parameters in the request body. Returns status code `200`. Requires to be lobby host or have admin permissions.

# DELETE /lobbies/:id
## Delete a lobby
`https://mish-backend-25-1.onrender.com/lobbies/3`

Removes the lobby from the database. Returns status code `204`. Requires admin permissions.
