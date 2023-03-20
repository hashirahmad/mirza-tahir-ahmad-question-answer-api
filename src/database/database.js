/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   database.js                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: Hashir <hashir@coinmode.com>               +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/03/19 15:04:32 by Hashir            #+#    #+#             */
/*   Updated: 2023/03/20 21:58:43 by Hashir           ###   ########.fr       */
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

    /**
     * It will search the specified content through `field`
     * i.e. `question` or if none provided then will search
     * anything and everything that can match the search query.
     * By default there is no `limit` however when necessary it will
     * get up to that much and also return how many matches there were
     * in total.
     */
    // eslint-disable-next-line class-methods-use-this
    searchContent({ search = '', limit = qaArray.length, field = '' }) {
        const content = []
        let found = 0
        for (let i = 0; i < qaArray.length; i += 1) {
            const entry = qaArray[i]
            const stringified = JSON.stringify(
                field ? entry[field] : entry
            ).toLowerCase()
            if (stringified.includes(search.toLowerCase())) {
                found += 1
                if (found < limit) {
                    content.push({
                        ...entry,
                        url: undefined,
                    })
                }
            }
        }
        return { found, content }
    }
}

module.exports = new Database()
