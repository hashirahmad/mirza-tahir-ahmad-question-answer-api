/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   index.js                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: Hashir <hashir@coinmode.com>               +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/03/19 12:41:20 by Hashir            #+#    #+#             */
/*   Updated: 2023/03/19 19:45:11 by Hashir           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

const database = require('../../database/database')
const APIError = require('../../helpers/APIError')

/**
 * This will get the questions for specified category including
 * any subcategories questions.
 */
exports.getCategoryContent = ({ category }) => {
    if (!category) {
        throw new APIError({ userMessage: 'No category specified' })
    }
    const content = database.getCategorizedContent({
        category,
    })
    const response = content.map((o) => ({
        category: o.category,
        questions: o.questions.map((obj) => ({
            ...obj,
            url: undefined,
        })),
    }))
    return response
}

/**
 * This will get count of questions for each category and
 * subcategories within too. Optionally the count can be
 * narrowed down to particular category too.
 */
exports.getCount = ({ category }) => {
    const categories = database.getCategorizedContent({ category })
    const response = []
    for (let i = 0; i < categories.length; i += 1) {
        const categoryObj = categories[i]
        response.push({
            category: categoryObj.category,
            numberOfQuestions: categoryObj.questions.length,
        })
    }
    return response
}
