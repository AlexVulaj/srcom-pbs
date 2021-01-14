const tableHeaders = ['Game', 'Category', 'Time', 'Rank'],
    pbTable = document.querySelector('table'),
    fetchPBData = function fetchPBData(userId) {
        const pbData = []
        fetch(`https://www.speedrun.com/api/v1/users/${userId}/personal-bests?embed=game.variables,category,level`)
            .then(data => data.json())
            .then(res => {
                res.data.forEach(entry => {
                    const runValues = entry.run.values,
                        pb = {
                            leaderboardPosition: entry.place,
                            gameName: entry.game.data.names.international,
                            categoryName: entry.level.data.name || entry.category.data.name,
                            runTime: formatRunTime(entry.run.times.primary_t),
                            imageUri: entry.game.data.assets.icon.uri
                        }

                    for (const runValue in runValues) {
                        const subCategoryVariable = entry.game.data.variables.data.find(variable => runValue === variable.id && variable['is-subcategory'])
                        if (subCategoryVariable) {
                            pb.subCategory = subCategoryVariable.values.values[runValues[runValue]].label
                            break
                        }
                    }

                    pbData.push(pb)
                })

                generateTable(pbData.reduce((grouping, pb) => {
                    if (!grouping.hasOwnProperty(pb.gameName)) {
                        grouping[pb.gameName] = []
                    }
                    grouping[pb.gameName].push(pb)
                    return grouping
                }, {}))
            })
    },
    generateTable = function generateTable(pbData) {
        for (const [gameName, gamePBs] of Object.entries(pbData)) {
            let currentTableRow = pbTable.insertRow()

            const gameCell = currentTableRow.insertCell(),
                gameImage = document.createElement('img'),
                gameNameDiv = document.createElement('span')

            gameCell.rowSpan = gamePBs.length

            gameNameDiv.innerHTML = gameName
            gameCell.appendChild(gameNameDiv)

            gameImage.src = gamePBs[0].imageUri
            gameImage.width = 32
            gameImage.height = 32
            gameCell.appendChild(gameImage)

            for (let i = 0; i < gamePBs.length; i++) {
                const pb = gamePBs[i]
                currentTableRow.insertCell().appendChild(document.createTextNode(`${pb.categoryName} ${pb.subCategory ? ` (${pb.subCategory})` : ''}`))

                currentTableRow.insertCell().appendChild(document.createTextNode(pb.runTime))
                currentTableRow.insertCell().appendChild(document.createTextNode(pb.leaderboardPosition))
                if (i < gamePBs.length - 1) {
                    currentTableRow = pbTable.insertRow()
                }
            }
        }

        const pbTableHeaderRow = pbTable.createTHead().insertRow()
        for (const header of tableHeaders) {
            const th = document.createElement('th')
            th.appendChild(document.createTextNode(header))
            pbTableHeaderRow.appendChild(th)
        }
    },
    formatRunTime = function formatRunTime(totalSecondsAndMillis) {
        const totalSecondsAndMillisWithoutHours = totalSecondsAndMillis % 3600,
            hours = Math.floor(totalSecondsAndMillis / 3600),
            minutes = Math.floor(totalSecondsAndMillisWithoutHours / 60),
            minutesString = hours ? String(minutes).padStart(2, 0) : minutes,
            seconds = Math.floor(totalSecondsAndMillisWithoutHours % 60),
            secondsString = (hours || minutes) ? String(seconds).padStart(2, 0) : seconds,
            millis = `${totalSecondsAndMillis}`.split('.')[1]

        return `${hours ? `${hours}:` : ''}${minutesString > 0 ? `${minutesString}:` : ''}${secondsString > 0 ? `${secondsString}` : ''}${millis ? `.${millis}` : ''}`
    }