/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   database.js                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: Hashir <hashir@coinmode.com>               +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/03/19 15:04:32 by Hashir            #+#    #+#             */
/*   Updated: 2023/03/19 18:32:24 by Hashir           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

const qaArray = require('./qaArray.json')

class Database {
    /**
     * This will get the entire question and answer
     * broken down by categories. If particular category
     * is specified, then it will get the content only
     * for that category
     */
    // eslint-disable-next-line class-methods-use-this
    getCategorizedContent({ category }) {
        const allCategories = []
        for (let i = 0; i < qaArray.length; i += 1) {
            const question = qaArray[i]
            if (category && question.category.includes(category)) {
                allCategories.push(question.category)
            } else if (!category) {
                allCategories.push(question.category)
            }
        }
        const uniqueCategories = [...new Set(allCategories)]
        const categories = []
        for (let i = 0; i < uniqueCategories.length; i += 1) {
            const uniqueCategory = uniqueCategories[i]
            const questions = qaArray.filter((o) =>
                o.category.includes(uniqueCategory)
            )
            categories.push({
                category: uniqueCategory,
                questions,
            })
        }
        return categories
    }
}

module.exports = new Database()
