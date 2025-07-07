Any request that needs an id of an user in lobby may return the following status codes:
- `400` on invalid id format.
- `404` on user in lobby not found.

`GET` requests return status code `200` on sucess.

# GET /userinlobby/votes
## Retrieve all votes ever made
`https://mish-backend-25-1.onrender.com/userinlobby/votes`

Response body example:
```json
[
    {
        "id": 2,
        "votingUserId": 12,
        "votedUserId": 11,
        "createdAt": "2025-06-28T07:01:10.928Z",
        "updatedAt": "2025-06-28T07:01:10.928Z"
    },
    {
        "id": 3,
        "votingUserId": 11,
        "votedUserId": 12,
        "createdAt": "2025-06-28T07:01:31.014Z",
        "updatedAt": "2025-06-28T07:01:31.014Z"
    },
    {
        "id": 4,
        "votingUserId": 11,
        "votedUserId": 11,
        "createdAt": "2025-06-28T07:01:34.211Z",
        "updatedAt": "2025-06-28T07:01:34.211Z"
    },
```
Returns a list of all the votes ever made in the app.
Requires admin privileges.

# GET /userinlobby/:id/votes
## Retrieve user votes in a lobby
`https://mish-backend-25-1.onrender.com/userinlobby/:id/votes`

Response body example:
```json
{
    "votesFor": [],
    "votesBy": []
}
```

Returns the list of votes that the user voted for and the list of users that voted for the user in question.
Requires admin privileges or to be the vote creator.

# POST /userinlobby/:idVoter/votesFor/:idVotee
## Vote for a user in the same lobby
`https://mish-backend-25-1.onrender.com/userinlobby/0/votesFor/1`

Response body example:
```json
{
    "id": 0,
    "votedUserInLobbyId": 1,
    "votingUserInLobbyId": 0,
    "createdAt": "2025-06-08T19:25:31.760Z",
    "updatedAt": "2025-06-08T19:25:31.760Z"
}
```

Declares a vote made from a player to a player in the same lobby. Returns status code `201` on success.
Requires for both users to be in the same lobby.

# DELETE /userinlobby/:voterId/votesFor/:voteeId
## Delete a vote
`https://mish-backend-25-1.onrender.com/userinlobby/0/votesFor/1`

Removes the vote from the database. Returns status code `204` on success.
Requires admin privileges or to be the vote creator.
