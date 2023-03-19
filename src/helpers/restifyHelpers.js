/* eslint-disable no-useless-escape */
/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-restricted-globals */

const environment = require('./Environment')
const stringHelpers = require('./stringHelpers')
const APIError = require('./APIError')

exports.getBodyOrParam = function (req, key) {
    if (req != null) {
        if (req.body != null) {
            if (req.body[key] != null) {
                return req.body[key]
            }
            /**
             * apidocs fix for when type 'object' is used and valid JSON array is submitted it appends '[]' to the key name.
             * e.g. in hello/world paramWithObject with ["property a", "property b", "property c"]
             * req.body["paramWithObject[]"] gives
             *  > Array(3)["property a", "property b", "property c"]
             */
            if (req.body[`${key}[]`] != null) {
                return req.body[`${key}[]`]
            }
        }
        if (req.params != null) {
            if (req.params[key] != null) {
                return req.params[key]
            }
        }
        if (req.query != null) {
            if (req.query[key] != null) {
                return req.query[key]
            }
        }
    }
    return null
}

exports.fail = function ({
    req,
    res,
    errorCode,
    objectDetails,
    userMessage,
    e,
}) {
    const response = {
        status: 'error',
    }
    const duration = (new Date() - req._date) / 1000

    response.duration = duration
    response.error = errorCode
    response.userMessage = userMessage
    response.details = objectDetails

    if (!environment.isProduction()) {
        response.stack = e ? e.stack : undefined
    }

    res.status(400).send(response)
}

// eslint-disable-next-line consistent-return
exports.ok = function ({ req, res, next, response }) {
    let responseOut = response
    if (response === null) {
        /**
		 * If no data given we return an empty object like this
		{
			"duration":0.001,
			"status": "ok"
		}
		 */
        responseOut = {}
    }
    if (typeof response !== 'object') {
        /* For data that is a string or number we return
		{
			"string" : {{your data}},
			"duration":0.001,
			"status": "ok"
		}
		*/
        responseOut = {}
        responseOut[typeof response] = response
    } else if (Array.isArray(response)) {
        /* For arrays we return data as
		{
			"results": {{your data}}
			"duration":0.001,
			"status" : "ok"
		}
		*/
        responseOut = { results: response }
    }

    responseOut.status = 'ok'
    const duration = (new Date().getTime() - req._date.getTime()) / 1000
    responseOut.duration = duration

    res.status(200).send(responseOut)
    if (next != null) {
        return next()
    }
}

/**
 * Returns the IP address making the request call
 */
exports.getIP = function (req) {
    const ip =
        req.headers['cf-connecting-ip'] ||
        req.headers['x-original-forwarded-for'] ||
        req.headers['x-forwarded-for'] ||
        req.headers['X-FORWARDED-FOR'] ||
        req.headers['X-Forwarded-For'] ||
        req.headers['X-ProxyUser-Ip'] ||
        req.headers['X-REAL-IP'] ||
        req.connection.remoteAddress
    if (ip === '::1') {
        return '127.0.0.1'
    }
    return ip
}

exports.assertCharValidity = function (index, value, regex) {
    const invalidChars = value.match(regex)
    if (invalidChars) {
        throw new APIError({
            objectDetails: { index, invalid_chars: invalidChars },
            userMessage:
                'There were invalid characters found in the parameter {{index}}',
            internalDetails: { regex },
        })
    }
}

exports.assertIsNumber = function (value) {
    if (isNaN(value) || value === null || typeof value !== 'number') {
        throw new APIError({
            objectDetails: { value },
            userMessage: 'There were invalid integers found in the parameter',
            internalDetails: { value },
        })
    }
}

exports.getAsStringAlphanumeric = function (
    req,
    index,
    defaultvalue,
    required,
    max_length
) {
    const valueout = exports.getAsStringRaw(
        req,
        index,
        defaultvalue,
        required,
        max_length
    )
    if (valueout) {
        // Make sure we only use alphanumeric values
        // eslint-disable-next-line no-useless-escape
        exports.assertCharValidity(index, valueout, /[^A-Za-z0-9 \_\-\.\@\+]/g)
    }
    // Maximum character length allowed
    return valueout
}

exports.getAsStringNoHtml = function (
    req,
    index,
    defaultvalue,
    required,
    max_length
) {
    const valueout = exports.getAsStringRaw(
        req,
        index,
        defaultvalue,
        required,
        max_length
    )
    if (valueout) {
        // Make sure we only use alphanumeric values
        // exports.assertValidity( index, valueout, /[[^*<\\"\'$#>&;]]/g );
        // eslint-disable-next-line no-useless-escape
        exports.assertCharValidity(index, valueout, /[\[^*<>&;\]]/g)
    }
    // Maximum character length allowed
    return valueout
}

// Gets the parameter but has no character stripping
exports.getAsURL = function (req, index, defaultvalue, required) {
    const max_length = 256 // Database size is set to 256

    let item = exports.getAsStringRaw(
        req,
        index,
        defaultvalue,
        required,
        max_length
    )

    // Allow empty string
    if (item === '') {
        return item
    }
    // For null values return the defaultvalue
    if (!item) {
        return defaultvalue
    }
    let validURL
    try {
        validURL = new URL(item)
    } catch (err) {
        throw new APIError({
            objectDetails: { index, item },
            userMessage: `The parameter${index} URL is invalid, perhaps missing https:// at start?  E.g. use https://google.com instead of google.com`,
        })
    }

    // If null or 0 we can use the default value
    if (!validURL) {
        item = defaultvalue
    }
    return item
}

// Gets the parameter but has no character stripping
exports.getAsPassword = function (req, index, defaultvalue, required) {
    const max_length = 256 // Database size is set to 256
    return exports.getAsStringRaw(
        req,
        index,
        defaultvalue,
        required,
        max_length
    )
}

// Returns a string or null if null or undefined.
exports.getAsStringRaw = function (
    req,
    index,
    defaultvalue,
    required,
    maxLength,
    getUpToMaxLength
) {
    let valueout = exports.getBodyOrParam(req, index)

    if (valueout === null || valueout === undefined) {
        if (required) {
            throw new APIError({
                objectDetails: {
                    [index]: valueout,
                },
                userMessage: [
                    `The parameter '${index}' is required`,
                    `for ${req.originalUrl} API.`,
                    `Currently it is: '${valueout}'`,
                ].join(' '),
            })
        }
        valueout = defaultvalue
    }
    // Default to max 256 characters unless we say otherwise
    if (!maxLength) {
        maxLength = 256
    }

    // If the value is NOT required we allow for returning null.
    if (!required) {
        if (valueout === undefined || valueout === null) {
            return null
        }
    } else {
        if (valueout === undefined) {
            throw new APIError({
                objectDetails: {
                    [index]: valueout,
                },
                userMessage: [
                    `The required parameter '${index}' was not supplied`,
                ].join(' '),
            })
        }
        if (valueout === null) {
            throw new APIError({
                objectDetails: {
                    [index]: valueout,
                },
                userMessage: [
                    `The required parameter '${index}' was found to be null but should be a string \"\"`,
                ].join(' '),
            })
        }
    }

    if (valueout !== null) {
        // Make sure we are dealing with strings here
        if (typeof valueout === 'number') {
            // Convert the number to a string
            valueout = valueout.toString()
        } else if (typeof valueout !== 'string') {
            throw new APIError({
                objectDetails: {
                    [index]: valueout,
                },
                userMessage: [
                    `The parameter '${index}' was found but is not a string`,
                ].join(' '),
            })
        }
        if (getUpToMaxLength && valueout.length > maxLength) {
            /**
             * This will get string right up to the
             * maximum length we have allowed for e.g.
             * HELLO WORLD and we allow maximum length
             * up to 5, then only HELLO will be
             * retrieved and WORLD will be stripped off.
             */
            valueout = valueout.substr(0, maxLength - 4)
            valueout = `${valueout} ...`
        }
        if (valueout.length > maxLength) {
            throw new APIError({
                objectDetails: {
                    [index]: valueout,
                    length: valueout.length,
                    max_length: maxLength,
                },
                userMessage: [
                    `The parameter '${index}' is too long with '${valueout}'`,
                ].join(' '),
            })
        }
        // Remove leading and trailing spaces
        valueout = valueout.trim()
    }
    return valueout
}

// Remember defaultvalue can be null so that
exports.getNumberInRange = function (req, index, defaultvalue, min, max) {
    const value = exports.getAsNumber(req, index, defaultvalue)
    if (min) {
        if (value < min) {
            throw new APIError({
                objectDetails: { min, max, index },
                userMessage: 'value of {{index}} is below {{min}}',
            })
        }
    }
    if (max) {
        if (value > max) {
            throw new APIError({
                objectDetails: { min, max, index },
                userMessage: 'value of {{index}} is above {{max}}',
            })
        }
    }
    return value
}

exports.getAsNumber = function (req, index, defaultvalue, required) {
    let valueout = exports.getBodyOrParam(req, index)
    let finalValue
    try {
        if (valueout === null || valueout === '') {
            if (defaultvalue != null) {
                valueout = defaultvalue
            } else {
                // Just return nothing
                finalValue = null
            }
        }

        let result = parseInt(valueout, 10)
        if (isNaN(result)) {
            result = defaultvalue
        }
        exports.assertIsNumber(result)

        finalValue = result
    } catch (e) {
        // debug.warning("Invalid integer value provided to API for index:" + index);
        if (defaultvalue != null) {
            finalValue = defaultvalue
        }

        finalValue = 0
    }
    if (required && !finalValue) {
        throw new APIError({
            objectDetails: { index, value: finalValue },
            userMessage: [
                `The parameter '${index}' is required`,
                `for ${req.originalUrl} API.`,
                `Currently it is: '${valueout}'`,
            ].join(' '),
        })
    }
    return finalValue
}

exports.getFloatInRange = function (req, index, defaultvalue, min, max) {
    const value = exports.getAsFloat(req, index, defaultvalue)
    if (min) {
        if (value < min) {
            throw new APIError({
                objectDetails: { min, max, index },
                userMessage: 'value of {{index}} is below {{min}}',
            })
        }
    }
    if (max) {
        if (value > max) {
            throw new APIError({
                objectDetails: { min, max, index },
                userMessage: 'value of {{index}} is above {{max}}',
            })
        }
    }
    return value
}

exports.getAsFloat = function (req, index, defaultvalue) {
    let valueout = exports.getBodyOrParam(req, index)
    if (valueout === null) {
        valueout = defaultvalue
    }
    valueout = parseFloat(valueout)
    if (isNaN(valueout)) {
        valueout = defaultvalue
    }
    if (defaultvalue != null) {
        exports.assertIsNumber(valueout)
    }
    return valueout
}

// This will read in the result and output the JSON object from the input parameter.
// If the input parameter is missing the defaultvalue is used
// If the input parameter is not valid JSON it will instead return a single item array of the text e.g. ["hello"]
exports.getAsJson = function (req, index, defaultvalue) {
    let string_to_process = exports.getBodyOrParam(req, index)

    if (string_to_process === null) {
        string_to_process = defaultvalue
    }
    let jsonresult = {}
    try {
        jsonresult = JSON.parse(string_to_process)
    } catch (e) {
        if (string_to_process != null) {
            jsonresult = string_to_process
        } else {
            jsonresult = defaultvalue
        }
    }
    return jsonresult
}

exports.getAsBoolean = function (req, index, defaultvalue) {
    const parsed = exports.getBodyOrParam(req, index)

    let result = defaultvalue

    if (parsed === '1') {
        result = true
    } else if (parsed === 'yes') {
        result = true
    } else if (parsed > 0) {
        result = true
    } else if (parsed === 'YES') {
        result = true
    } else if (parsed === 'true') {
        result = true
    } else if (parsed === 'TRUE') {
        result = true
    } else if (parsed === true) {
        result = true
    } else if (parsed === '0') {
        result = false
    } else if (parsed === 'no') {
        result = false
    } else if (parsed === 0) {
        // For some reason we are getting 0 passed in on defaults so ignore this one (from api docs REST calls)
        // result = false;
    } else if (parsed === 'NO') {
        result = false
    } else if (parsed === 'false') {
        result = false
    } else if (parsed === 'FALSE') {
        result = false
    } else if (parsed === false) {
        result = false
    }
    return result
}

exports.getAsObject = function (req, index, defaultvalue, required) {
    let parsed = exports.getBodyOrParam(req, index)

    if (parsed === null) {
        parsed = defaultvalue
    }
    if (parsed === null && required) {
        throw new APIError({
            userMessage: [
                `The parameter '${index}' is required`,
                `for ${req.originalUrl} API.`,
                `Currently it is: '${parsed}'`,
            ].join(' '),
        })
    }
    parsed = stringHelpers.convertStringToJsonIfNotNull(parsed)
    return parsed
}

exports.validateEmail = function (email) {
    // var re = /\S+@\S+\.\S+/;
    // var re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()\.,;\s@\"]+\.{0,1})+[^<>()\.,;:\s@\"]{2,})$/;
    const re =
        // eslint-disable-next-line no-control-regex
        /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
    const result = re.test(email)
    if (result === true) {
        // Check for common false emails
        if (email.indexOf('example.com') >= 0) {
            return false
        }
        if (email.indexOf('example.org') >= 0) {
            return false
        }
        if (email.indexOf('satoshin@gmx.com') >= 0) {
            return false
        }
        /**
         * Prevents "gmail" email ending with anything
         * other than "com" is false. Catches typos.
         */
        if (
            String(email).includes('@gmail') &&
            !String(email).endsWith('com')
        ) {
            return false
        }
    }
    return result
}

// Make sure the mobile number is allowed
// @return - Returns true if valid otherwise returns a text string as to why it's invalid
exports.validateMobile = function (mobile) {
    /**
     * This is so that if the player wants to detach their
     * recently requested to add mobile number - for what
     * ever reason they have changed their mind for.
     */
    if (mobile === '') {
        return false
    }

    const isValidRegex = /^[\+]?[(]?[0-9\ \-\(\)]{10,24}$/
    const isValidNumber = isValidRegex.test(mobile)
    if (isValidNumber === true) {
        // Check for common false mobiles
        if (
            [
                '911',
                '999',
                '00000000000',
                '11111111111',
                '88888888888',
                '99999999999',
            ].indexOf(mobile) >= 0
        ) {
            return false // "Banned number entered";
        }
    } else {
        return false // "This is not a valid number. Please ensure correct format.";
    }

    return true
}

// Make sure only currency types are allowed and assert if wrong
exports.getAsEmail = function (req, index, defaultvalue, required) {
    const max_length = 256
    let valueout = exports.getAsStringRaw(
        req,
        index,
        defaultvalue,
        required,
        max_length
    )
    if (valueout) {
        valueout = valueout.toLowerCase()
        valueout = valueout.trim()

        // Make sure we only use alphanumeric values
        exports.assertCharValidity(index, valueout, /[^a-z\+\.\@\-0-9\_]/g)

        // Verify a valid email.
        if (!exports.validateEmail(valueout)) {
            throw new APIError({
                objectDetails: {},
                userMessage: 'The email provided is invalid',
            })
        }
    }
    return valueout
}
// Make sure only currency types are allowed and assert if wrong
exports.getAsMobile = function (req, index, defaultvalue, required) {
    const maxLength = 32
    let valueout = exports.getAsStringRaw(
        req,
        index,
        defaultvalue,
        required,
        maxLength
    )
    if (valueout) {
        valueout = valueout.trim()

        // Make sure we only use alphanumeric values
        exports.assertCharValidity(index, valueout, /[^0-9\+\-\ ]/g)

        // Verify a valid email.
        if (!exports.validateMobile(valueout)) {
            throw new APIError({
                objectDetails: {},
                userMessage: 'The mobile number provided is invalid',
            })
        }
    }
    return valueout
}

exports.getAsArray = function (req, index, required, max) {
    const object = exports.getAsObject(req, index, '') || []
    if (!Array.isArray(object)) {
        throw new APIError({
            objectDetails: { object },
            userMessage: `The parameter '${index}' must be submitted as an array`,
        })
    }
    if (required && object && object.length === 0) {
        throw new APIError({
            objectDetails: { object },
            userMessage: `The parameter '${index}' is required. It is currently empty array`,
        })
    }
    if (max && object && object.length > max) {
        throw new APIError({
            objectDetails: { object },
            userMessage: `The parameter '${index}' is capped to ${max} items. It has currently ${object.length} items`,
        })
    }
    return object
}
