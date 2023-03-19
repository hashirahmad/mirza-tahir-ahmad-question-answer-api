/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   transformJsonTreeIntoAnArray.js                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: Hashir <hashir@coinmode.com>               +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/03/19 15:50:27 by Hashir            #+#    #+#             */
/*   Updated: 2023/03/19 19:47:06 by Hashir           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

const fs = require('fs').promises
const path = require('path')
const qaJson = require('./qa.json')

const questions = []

function loopThroughCategories(questionsObject = {}, previousKey = '') {
    // eslint-disable-next-line no-restricted-syntax
    for (const key in questionsObject) {
        if (Object.prototype.hasOwnProperty.call(questionsObject, key)) {
            if (Array.isArray(questionsObject[key])) {
                /**
                 * So now we have found the depth of the category where there
                 * are only `questions` in the form of an array and we can then
                 * iterate over them to find the relevant metadata for each set
                 * of the question.
                 */
                for (let i = 0; i < questionsObject[key].length; i += 1) {
                    const questionInsideQuestionsObject =
                        questionsObject[key][i]
                    questions.push({
                        ...questionInsideQuestionsObject,
                        category: previousKey.replace('.questions', ''),
                    })
                }
            } else {
                /**
                 * i.e.its another categories within category
                 * so we simply just call it again and again
                 * until we eventually get to the depth of the
                 * JSON and there are only `questions`.
                 */
                // eslint-disable-next-line no-param-reassign
                questionsObject[key] = loopThroughCategories(
                    questionsObject[key],
                    previousKey ? `${previousKey}.${key}` : key
                )
            }
        }
    }
    return questionsObject
}

async function run() {
    loopThroughCategories(qaJson)
    const filePath = path.join(__dirname, `./qaArray.json`)
    await fs.writeFile(filePath, JSON.stringify(questions, null, 4), 'utf8')
}

run()
