export type TeamSide = 'blue' | 'red'

export type TeamResult = 'v' | 'd'

export type Player = {
    rowid: number
    name: string
    mmr: number
}

export type Game = {
    rowid: number
    winningSide: TeamSide
    date: Date
}

export type Participant = {
    rowid: number
    playerId: number
    gameId: number
    team: TeamResult
    champion: string | null
}
