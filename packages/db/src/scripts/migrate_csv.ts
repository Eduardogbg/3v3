import { Database } from 'bun:sqlite'
import type { Player } from '../schemas'
import { randomUUID } from 'node:crypto'

const db = Database.open('test.db')

// TODO
const GAMES_CSV_PATH = 'data.csv'

async function migrateCsvToDb() {
    // parse the csv file, V are wins D are loses
    const gamesFile = (await Bun.file(GAMES_CSV_PATH).text()).split('\n').map(line => line.split(','))

    type PlayerFromFile = {
        rowid: number
        name: string
        mmr: number
        index: number
    }

    const playersFromDb = db.query('select rowid, name, mmr from players').all() as Player[]
    const playersFromFile: PlayerFromFile[] = gamesFile[0].map((name, index) => {
        const player = playersFromDb.find(p => p.name.toLowerCase() === name.toLowerCase())
        if (!player) {
            throw new Error(`Player ${name} not found`)
        }

        return {
            rowid: player.rowid,
            name,
            mmr: player.mmr,
            index,
        }
    })

    // a list of list of results, every 3 lines theres one line for game results,
    // one for champions (from march onwards) and another empty line
    // each column is for a player
    // the game results are encoded as V for wins and D for losses
    type CsvLineGroup = {
        results: string[]
        champions: string[]
    }

    const playerResultAndChamps = gamesFile
        .slice(1)
        .filter((line, index) => index % 3 != 2)
        .reduce((acc, line, index) => {
            if (index % 2 == 0) {
                acc.push({
                    results: line,
                    champions: [],
                });
            } else {
                acc[acc.length - 1].champions = line;
            }

            return acc
        }, [] as CsvLineGroup[]);

    console.log({ playerResultAndChamps });

    for (const { results, champions } of playerResultAndChamps) {
        // TODO: input game date
        const febDate = '2024-02-01'
        const marDate = '2024-03-01'

        // TODO: eventually make some type-safe wrapper on top of sqlite?? maybe not...
        const { gameId } = db
            .query('insert into games (id, date) values (?, ?) returning id as gameId')
            .get(
                randomUUID(),
                champions.every(c => c.length === 0)
                    ? febDate
                    : marDate
            ) as unknown as { gameId: number };

        for (const [index, result] of results.entries()) {
            if (!result) {
                continue;
            }

            const player = playersFromFile.find(p => p.index === index)

            if (!player) {
                throw new Error(`Player ${index} not found`)
            }

            console.log({ player });
            const playerId = (db.query('select id from players where name = ?').get(player.name.toLocaleLowerCase()) as unknown as any).id;

            db.run(
                'insert into participants (player_id, game_id, team, champion) values (?, ?, ?, ?)',
                [
                    playerId,
                    gameId,
                    result.toLowerCase(),
                    champions[index],
                ]
            )
        }
    }
}

await migrateCsvToDb()
