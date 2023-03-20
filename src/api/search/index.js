/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   index.js                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: Hashir <hashir@coinmode.com>               +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/03/20 20:59:12 by Hashir            #+#    #+#             */
/*   Updated: 2023/03/20 22:00:30 by Hashir           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

/**
 * @api {get} /v1/search Search Entire Content
 * @apiName /v1/search
 * @apiGroup Search
 * @apiPermission none
 *
 * @apiDescription It will search the entire content for whatever
 * specified `search` term and `limit` the number of entries to
 * a reasonable number.
 * 
 * @apiParam {String}	search	   Search term to include in the content.
 * @apiParam {Number}	[limit=25] How many entries to be returned.
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
const searchLogic = require('../../logic/search')

module.exports = (url) => {
    app.get(url, async (req, res, next) => {
        /** Get all params */
        const search = restify.getAsStringNoHtml(req, 'search', '', true)
        const limit = restify.getNumberInRange(req, 'limit', 25, 25, 100)

        const response = searchLogic.search({ search, limit })
        restify.ok({ req, res, next, response })
    })
}
