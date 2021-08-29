
import fetch from 'node-fetch'
import _ from 'lodash'
import assert from 'assert'
import fs from 'fs'
import {sleep} from 'modern-async'

const res = await fetch('https://steamspy.com/api.php?request=all&page=0')
assert(res.ok)
const json = await res.json()

const apps = _.sortBy(Object.values(json), 'appid')

const napps = apps

if (! fs.existsSync('./results.json')) {
    await fs.promises.writeFile('./results.json', JSON.stringify([]), 'utf8')
}

const results = JSON.parse(await fs.promises.readFile('./results.json'))

let i = 0

for (const app of napps) {
    const appid = app.appid
    if (results.find((el) => el.appid === appid)) {
        console.log(i + ' Skipping ' + appid)
        i += 1
        continue
    }
    while (true) {
        try {
            console.log(i + ' Fetching ' + appid)
            const res = await fetch('https://store.steampowered.com/api/appdetails?appids=' + appid)
            console.log(res)
            assert(res.ok)
            const json = await res.json()
            console.log(json)
            assert(json[appid].success)
            const data = json[appid].data.name
            results.push({
                appid,
                data
            })
            await fs.promises.writeFile('./results.json', JSON.stringify(results, null, 2), 'utf8')
            break
        } catch (e) {
            console.log(e)
            await sleep(30 * 1000)
            continue
        }
    }
    i += 1
}


