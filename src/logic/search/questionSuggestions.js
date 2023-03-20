/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   questionSuggestions.js                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: Hashir <hashir@coinmode.com>               +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/03/20 21:04:04 by Hashir            #+#    #+#             */
/*   Updated: 2023/03/20 21:38:10 by Hashir           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

const database = require('../../database/database')
const APIError = require('../../helpers/APIError')

/**
 * It will get `question` search  suggestions for the specified search
 * term while also insuring that search term must be specified.
 * How many suggestions to be returned can be specified via
 * `limit` param.
 */
exports.get = ({ search = '', limit }) => {
    if (!search) {
        throw new APIError({ userMessage: 'Search term must be specified' })
    }
    const response = database.searchContent({
        field: 'question',
        limit,
        search,
    })
    return response
}
