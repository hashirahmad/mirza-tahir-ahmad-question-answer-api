const axios = require('axios')
const moment = require('moment')
const env = require('./Environment')

exports.bulk = {
    distanceInHours: 6,
    lastSent: moment(),
    logs: [],
}

function sendAlertToKeybase({ data, logs, url, asBulk }) {
    const webhookbot = url

    const errStack = (data && data.err && data.err.stack) || ''
    // eslint-disable-next-line no-unused-expressions, no-param-reassign
    data && delete data.err

    const now = new Date().toLocaleString()
    const envName = env.getEnvName()
    const array = [`\t\t\t\t\t\t\t\t\t\t\t\t ${now} ◉ **${envName}**`, ...logs]

    if (data) {
        array.push(
            '**`JSON` data**',
            '```',
            JSON.stringify(
                {
                    data,
                },
                null,
                4
            ),
            '```'
        )
    }
    if (errStack) {
        array.push('**Error Stack**', '```', errStack, '```')
    }

    if (asBulk) {
        exports.bulk.logs.push(array.join('\n'))
        const now2 = moment()
        const diff = now2.diff(exports.bulk.lastSent)
        const howLong = moment.duration(diff)
        const canSend = howLong.asHours() >= exports.bulk.distanceInHours
        if (canSend) {
            axios
                .post(webhookbot, exports.bulk.logs.join('\n'))
                .then(() => {
                    exports.bulk.logs.length = 0
                    exports.bulk.lastSent = moment()
                })
                .catch((error) => {
                    console.error(error)
                })
        }
    } else {
        axios.post(webhookbot, array.join('\n')).catch((error) => {
            console.error(error)
        })
    }
}

/**
 * It will log it in a pretty way or basically
 * better than plain `console.log`. Optionally
 * can send what was logged to keybase as well
 * so the admin can be notified. By default, if
 * no channel is specified, it will go to **info**
 * channel i.e. least priority.
 */
exports.pretty = function ({
    keybase = false,
    data,
    msg = [],
    channel = exports.keybase.info,
    asBulk = false,
    printToConsole = true,
}) {
    const logs = Array.isArray(msg) ? msg : [msg]
    const date = new Date().toLocaleString()

    if (printToConsole) {
        console.log(`              ${date}            \n`)
        if (data) console.dir(data, { depth: 10 })

        for (let i = 0; i < logs.length; i += 1) {
            console.log(`#${i + 1}\t`, logs[i])
        }

        console.log('\n______________________________\n')
    }

    if (keybase && !env.isLocal()) {
        sendAlertToKeybase({ data, logs, url: channel, asBulk })
    }
}

/**
 * Currently, only `financial` webhook url is
 * public i.e. on coinmode team. All others
 * for temporary basis are visible only to
 * Hashir. This is until CoinMode Admin on
 * keybase create relevant channels and create
 * appropriate webhook url(s).
 */
exports.keybase = {
    /** Not public */
    info: 'https://bots.keybase.io/webhookbot/VtnltgspTXKAnT4g1VkAQDIFZZ4',
}
