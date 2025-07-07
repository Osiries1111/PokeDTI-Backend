class ReportsController {
    #userInLobbyId; // eslint-disable-line no-unused-private-class-members

    /**
     * 
     * @param {number} userInLobbyId 
     */
    constructor(userInLobbyId) {
        this.#userInLobbyId = userInLobbyId;
    }
}

module.exports = ReportsController;