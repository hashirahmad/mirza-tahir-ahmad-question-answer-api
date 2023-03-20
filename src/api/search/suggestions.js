/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   suggestions.js                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: Hashir <hashir@coinmode.com>               +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/03/20 20:59:12 by Hashir            #+#    #+#             */
/*   Updated: 2023/03/20 21:40:01 by Hashir           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

/**
 * @api {get} /v1/search/suggestions Questions Search Suggestions
 * @apiName /v1/search/suggestions
 * @apiGroup Search
 * @apiPermission none
 *
 * @apiDescription It will get `question` search  suggestions for the specified search
 * term while also insuring that search term must be specified.
 * How many suggestions to be returned can be specified via
 * `limit` param.
 * 
 * @apiParam {String}	search	   Search term to include in various questions.
 * @apiParam {Number}	[limit=10] How many suggestions to be returned.
 *
 * @apiSuccess {string}   status        ok

@apiSuccessExample {json} Success As an overall count
{
}
@apiSuccessExample {json} Success As a list
{
}
@apiErrorExample {json} EXAMPLE_ERR
{
    error: 'EXAMPLE_ERR',
    details: { hello: "world" },
    userMessage: `Hello there! Erm . . . something went wrong!!!`,
}
*/
const app = require('../../app')
const restify = require('../../helpers/restifyHelpers')
const suggestionsLogic = require('../../logic/search/questionSuggestions')

module.exports = (url) => {
    app.get(url, async (req, res, next) => {
        /** Get all params */
        const search = restify.getAsStringAlphanumeric(req, 'search', '', true)
        const limit = restify.getNumberInRange(req, 'limit', 10, 2, 20)

        const response = suggestionsLogic.get({ search, limit })
        restify.ok({ req, res, next, response })
    })
}
