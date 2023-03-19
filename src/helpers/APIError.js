module.exports = class APIError extends Error {
    constructor({ errorCode = 'INVALID_PARAM', objectDetails, userMessage }) {
        super(userMessage)
        this.isBusinessError = true
        this.errorCode = errorCode
        this.objectDetails = objectDetails
        if (!objectDetails) {
            // eslint-disable-next-line no-param-reassign
            objectDetails = {}
        }
        this.userMessage = userMessage
    }
}
