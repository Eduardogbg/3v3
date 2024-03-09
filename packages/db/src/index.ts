import { getDbInstance } from './db'
import { calculateRatings } from './rating'
import type { Game, Participant, Player } from './schemas';

const db = await getDbInstance();

const players = db.query('select rowid, * from players').all() as Player[]
const games = db.query('select rowid, * from games').all() as Game[]
const participants = db.query('select rowid, * from participants').all() as Participant[]


console.log({ participants })

console.log({ ratings: calculateRatings(players, participants) })

