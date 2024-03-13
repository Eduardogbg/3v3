export type TeamSide = 'blue' | 'red'

export type TeamResult = 'v' | 'd'

type SqliteDocument<T> = T & { rowid: number }

export type Player = SqliteDocument<{
    id: string
    name: string
    mmr: number
}>

export type Game = SqliteDocument<{
    id: string
    winning_side: TeamSide
    date: Date
}>

export type Participant = SqliteDocument<{
    player_id: string
    game_id: string
    team: TeamResult
    champion: string | null
}>
