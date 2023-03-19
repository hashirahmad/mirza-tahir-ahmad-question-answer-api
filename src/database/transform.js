const axios = require('axios').default
const jsdom = require('jsdom')
const fs = require('fs').promises
const path = require('path')
const questionsObject = require('./qa-original.json')

const questionsObjectLive = questionsObject

/**
 * It will sleep for the specified seconds
 */
async function sleep(sec) {
    return new Promise((res) => {
        setTimeout(() => {
            res()
        }, sec * 1000)
    })
}

/**
 * It will for the specified array of the questions, go through
 * each question object and fetch relevant metadata from the
 * `url` and append the relevant metadata to the original
 * array which is returned back to the parent function. It will also
 * save afterwards so if the scripts halts or the webserver denies
 * service then we do not have to repeat all of the questions again, merely
 * from where we encountered the bug/error.
 */
async function fetchMetadataOfQuestions(questionsArray) {
    for (let i; i < questionsArray.length; i += 1) {
        const question = questionsArray[i]
        /**
         * So if we have already fetched metadata of that question
         * there is no need to do it again. Saves minutes of redoing.
         */
        if (!question.mp3) {
            // eslint-disable-next-line no-await-in-loop
            const response = await axios.get(question.url)
            const html = response.data
            const dom = new jsdom.JSDOM(html)
            const mp3 = dom.window.document.querySelector(
                '.d-inline-flex.flex-column.text-center.mr-3'
            ).firstElementChild.firstElementChild.href
            const metadata = dom.window.document
                .querySelector('.row.mt-3.mb-4')
                .querySelectorAll('.meta_value')
            const duration = metadata[0].textContent
            const location = metadata[1].textContent.replace(/\n/g, '').trim()
            const date = metadata[2].textContent
            const author = metadata[3].textContent.replace(/\n/g, '').trim()
            const audience = metadata[4].textContent
            const language = metadata[5].textContent.replace(/\n/g, '').trim()
            const obj = {
                ...question,
                mp3,
                duration,
                location,
                date,
                author,
                audience,
                language,
            }
            console.log(`Doing ${i} of ${questionsArray.length}`)
            // eslint-disable-next-line no-param-reassign
            questionsArray[i] = obj
            /** Sleep for 0.5 seconds so that we are DDOSing the server */
            // eslint-disable-next-line no-await-in-loop
            await sleep(0.5)
        }
    }
    const filePath = path.join(__dirname, `./qa.json`)
    await fs.writeFile(
        filePath,
        JSON.stringify(questionsObjectLive, null, 4),
        'utf8'
    )

    return questionsArray
}

/**
 * It will recursively go through the `qa-original` JSON
 * object and fetch relevant metadata for each set of questions
 * which can be inside a tree of categories.
 */
async function loopThroughCategoriesOfQuestions(
    originalQuestionsObject,
    stack
) {
    // eslint-disable-next-line no-restricted-syntax
    for (const key in originalQuestionsObject) {
        if (
            Object.prototype.hasOwnProperty.call(originalQuestionsObject, key)
        ) {
            if (
                typeof originalQuestionsObject[key] === 'object' &&
                originalQuestionsObject[key].push === undefined
            ) {
                /**
                 * i.e.its another categories within category
                 * so we simply just call it again and again
                 * until we eventually get to the depth of the
                 * JSON and there are only `questions`.
                 */
                // eslint-disable-next-line no-param-reassign
                originalQuestionsObject[key] =
                    // eslint-disable-next-line no-await-in-loop, no-param-reassign
                    await loopThroughCategoriesOfQuestions(
                        originalQuestionsObject[key],
                        `${stack} > ${key}`
                    )
            } else {
                /**
                 * So now we have found the depth of the category where there
                 * are only `questions` in the form of an array and we can then
                 * iterate over them to find the relevant metadata for each set
                 * of the question.
                 */
                // eslint-disable-next-line no-await-in-loop, no-param-reassign
                originalQuestionsObject[key] = await fetchMetadataOfQuestions(
                    originalQuestionsObject[key]
                )
                console.log(
                    'Extracted content for',
                    stack,
                    'and it had',
                    originalQuestionsObject[key].length,
                    'questions'
                )
            }
        }
    }
    return questionsObject
}

/** Run the one-off task */
async function run() {
    await loopThroughCategoriesOfQuestions(questionsObject, '')
    /**
     * The below code is for only rapid prototyping and
     * for isolation from the main code.
     */
    // const html = await axios.get('https://www.askislam.org/concepts/question_441.html')
    // const dom = new jsdom.JSDOM(html.data)
    // const mp3 = dom.window.document.querySelector('.d-inline-flex.flex-column.text-center.mr-3').firstElementChild.firstElementChild.href
    // const metadata = dom.window.document.querySelector('.row.mt-3.mb-4').querySelectorAll('.meta_value')
    // const duration = metadata[0].textContent
    // const location = metadata[1].textContent.replace(/\n/g, '').trim()
    // const date = metadata[2].textContent
    // const author = metadata[3].textContent.replace(/\n/g, '').trim()
    // const audience = metadata[4].textContent
    // const language = metadata[5].textContent.replace(/\n/g, '').trim()
    // console.log(mp3, duration, location, date, author, audience, language)
}

run()
