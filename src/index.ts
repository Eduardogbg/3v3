import { getDbInstance } from './db'
import { calculateRatings } from './rating'

const db = await getDbInstance();

const players = db.query('select rowid, * from players').all()
const games = db.query('select rowid, * from games').all()
const participants = db.query('select rowid, * from participants').all()


console.log({ participants })

console.log({ ratings: calculateRatings(players, participants) })

