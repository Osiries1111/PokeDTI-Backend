Any request that needs an id of an user in lobby may return the following status codes:
- `400` on invalid id format.
- `404` on user in lobby not found.

Any request that doesn't fulfill the authorization requirements returns:
- `403` Forbidden

`GET` requests return status code `200` on sucess.

# GET /userinlobby/reports
## Retrieve all user reports
`https://mish-backend-25-1.onrender.com/userinlobby/reports`

Response body example:
```json
[
    {
        "id": 5,
        "reportingUserInLobbyId": 54,
        "reportedUserInLobbyId": 55,
        "reason": "No me gustó su estilo",
        "createdAt": "2025-06-29T12:54:46.877Z",
        "updatedAt": "2025-06-29T12:54:46.877Z",
        "reportingUserInLobby": {
            "dressImgUrl": "https://res.cloudinary.com/dn2ezugwb/image/upload/v1751204672/dress/lobby_21/2.png",
            "User": {
                "id": 2,
                "username": "Pepino"
            }
        },
        "reportedUserInLobby": {
            "dressImgUrl": "https://res.cloudinary.com/dn2ezugwb/image/upload/v1751204523/dress/lobby_22/1.png",
            "User": {
                "id": 1,
                "username": "Papapleto"
            }
        }
    },
    {
        "id": 6,
        "reportingUserInLobbyId": 54,
        "reportedUserInLobbyId": 54,
        "reason": "me quedó feo",
        "createdAt": "2025-06-29T13:03:39.267Z",
        "updatedAt": "2025-06-29T13:03:39.267Z",
        "reportingUserInLobby": {
            "dressImgUrl": "https://res.cloudinary.com/dn2ezugwb/image/upload/v1751204672/dress/lobby_21/2.png",
            "User": {
                "id": 2,
                "username": "Pepino"
            }
        },
        "reportedUserInLobby": {
            "dressImgUrl": "https://res.cloudinary.com/dn2ezugwb/image/upload/v1751204672/dress/lobby_21/2.png",
            "User": {
                "id": 2,
                "username": "Pepino"
            }
        }
    }
]
```

Returns a list of current reports of the app. Includes userInLobby records in the response.
Requires admin privileges.

# POST /userinlobby/:reporterId/reports/:reporteeId
## Create a report
`https://mish-backend-25-1.onrender.com/userinlobby/0/reports/1`

Response body example:
```json
{
    "id": 0,
    "reportedUserInLobbyId": 1,
    "reportingUserInLobbyId": 0,
    "createdAt": "2025-06-08T19:25:31.760Z",
    "updatedAt": "2025-06-08T19:25:31.760Z"
}
```

Files a report to a player in the same lobby. Returns status code `201` on success.
Returns status code `400` if no "reason" is provided.
Requires authentication.

# DELETE /userinlobby/:reporterId/reports/:reporteeId
## Delete a report
`https://mish-backend-25-1.onrender.com/reports/1`

Removes the report from the database. Returns status code `204` on success.
Requieres Admin privileges.
