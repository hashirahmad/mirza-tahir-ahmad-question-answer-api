/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   content.js                                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: Hashir <hashir@coinmode.com>               +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/03/19 18:33:25 by Hashir            #+#    #+#             */
/*   Updated: 2023/03/19 19:40:06 by Hashir           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

/**
 * @api {get} /v1/category/content Questions For Category
 * @apiName /v1/category/content
 * @apiGroup Category
 * @apiPermission none
 *
 * @apiDescription This will get the questions for specified category including
 * any subcategories questions.
 * 
 * 
 * @apiParam {String}	category	   A category to narrow down to. Will also include those subcategories within.
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
const categoryLogic = require('../../logic/category')

module.exports = (url) => {
    app.get(url, async (req, res, next) => {
        /** Get all params */
        const category = restify.getAsStringAlphanumeric(
            req,
            'category',
            '',
            true
        )

        const response = categoryLogic.getCategoryContent({ category })
        restify.ok(req, res, next, response)
    })
}
