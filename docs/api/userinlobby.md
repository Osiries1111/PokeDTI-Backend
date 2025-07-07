Any request that needs an id of an user in a lobby may return the following status codes:
- `400` on invalid id format.
- `404` on user in lobby not found.

Any request that doesn't fulfill the authorization requirements return:
- `403` Forbidden

`GET` requests return status code `200` on sucess.

[Vote routes](votes.md)

[Report routes](reports.md)

# GET /userinlobby
## Lists all users and lobbies
`https://mish-backend-25-1.onrender.com/userinlobby`

Response body example:
```json
[
    {
        "id": 57,
        "userId": 3,
        "lobbyId": 19,
        "status": "dressing",
        "dressImgUrl": "https://res.cloudinary.com/dn2ezugwb/image/upload/v1751204524/dress/lobby_22/3.png",
        "choosenPokemon": null,
        "createdAt": "2025-06-29T13:13:30.811Z",
        "updatedAt": "2025-06-29T13:42:04.723Z"
    },
    {
        "id": 60,
        "userId": 3,
        "lobbyId": 18,
        "status": "exited",
        "dressImgUrl": "https://res.cloudinary.com/dn2ezugwb/image/upload/v1751204524/dress/lobby_22/3.png",
        "choosenPokemon": null,
        "createdAt": "2025-06-29T13:23:35.374Z",
        "updatedAt": "2025-06-29T13:42:04.723Z"
    }
]
```

Returns a list of current users and the lobbies they're in or have played in. Requires admin permission.

# GET /userinlobby/:id
## Retrieve an user in a lobby
`https://mish-backend-25-1.onrender.com/userinlobby/75`

Response body example:
```json
{
    "id": 75,
    "userId": 2,
    "lobbyId": 23,
    "status": "inLobby",
    "dressImgUrl": null,
    "choosenPokemon": null,
    "createdAt": "2025-06-29T20:19:17.978Z",
    "updatedAt": "2025-06-29T20:19:17.978Z"
}
```

Returns a user in lobby with the specified id. Requires authenticaction.

# GET /userinlobby/me/:userId
## Retrieves the user in lobby record of the current user
`https://mish-backend-25-1.onrender.com/userinlobby/me/2`

Request body example:
```json{
    "lobbyId":23
```

Response body example:
```json
{
    "id": 75,
    "userId": 2,
    "lobbyId": 23,
    "status": "inLobby",
    "dressImgUrl": null,
    "choosenPokemon": null,
    "createdAt": "2025-06-29T20:19:17.978Z",
    "updatedAt": "2025-06-29T20:19:17.978Z"
}
```

Returns an active user in lobby using the user ID specified in the request path and a lobby id in the request body. Requires to be authenticated as the user or admin permissions.

# POST /userinlobby/:id
## Join a user with a lobby
`https://mish-backend-25-1.onrender.com/userinlobby/3`
Request body example:
```json
{
    "lobbyId": 24,
}
```
Response body example:
```json
{
    "id": 76,
    "userId": 3,
    "lobbyId": 24,
    "updatedAt": "2025-06-29T21:24:59.381Z",
    "createdAt": "2025-06-29T21:24:59.381Z",
    "status": "inLobby",
    "dressImgUrl": null,
    "choosenPokemon": null
}
```

Adds the user to the lobby userlist. Returns status code `201` on success.

If room is full, or if lobby status is different from "waitingForUsers", returns status code `403`.
If user already joined a different lobby, returns status code `400`.

# PATCH /userinlobby/leave/:id
## Kicks user from lobby or leaves a lobby
`https://mish-backend-25-1.onrender.com/userinlobby/leave/5`

Response body example:
```json
{
    "message": "User 5 has left the lobby 7 succesfully"
}
```

Kicks user in lobby (if request is made by the room host or an admin) or leaves the room if the request is made by the user. Returns status code `200`.
Requires to be the host of the lobby, admin o the request user.

# DELETE /userinlobby/:id
## Delete an user in lobby record
`https://mish-backend-25-1.onrender.com/users/5`

Removes the user from the database. Returns status code `204`.

