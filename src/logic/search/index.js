/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   index.js                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: Hashir <hashir@coinmode.com>               +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/03/20 21:04:04 by Hashir            #+#    #+#             */
/*   Updated: 2023/03/20 21:57:25 by Hashir           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

const database = require('../../database/database')
const APIError = require('../../helpers/APIError')

/**
 * It will search the entire content for whatever specified `search` term and
 * `limit` the number of entries to a reasonable number.
 */
exports.search = ({ search = '', limit }) => {
    if (!search) {
        throw new APIError({ userMessage: 'Search term must be specified' })
    }
    const response = database.searchContent({
        search,
        limit,
    })
    return response
}
