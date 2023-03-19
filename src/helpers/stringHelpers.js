/* eslint-disable camelcase */

const APIError = require('./APIError')

/**
 * Takes a string in that describes a JSON object.  If not NULL this will convert it into the JSON object to return.  If null, null is returned.
 * If invalid JSON is found it returns the string exception
 */
exports.convertStringToJsonIfNotNull = function (obj) {
    let finalObj = null
    if (obj != null && obj !== undefined && obj !== '') {
        if (typeof obj === 'string') {
            try {
                finalObj = JSON.parse(obj)
            } catch (e) {
                throw new APIError({
                    errorCode: 'INVALID_PARAM',
                    objectDetails: {
                        stringIn: obj,
                    },
                    userMessage:
                        'The JSON string supplied could not be converted into a JSON object',
                    internalDetails: { e },
                })
            }
        } else if (typeof obj === 'object') {
            // Already an object
            finalObj = obj
        } else {
            throw new Error(`Unexpected type ${typeof obj}`)
        }
    }
    return finalObj
}
