export type TeamSide = 'blue' | 'red'

export type TeamResult = 'v' | 'd'

export type Player = {
    id: string
    name: string
    mmr: number
}

export type Game = {
    id: string
    winning_side: TeamSide
    date: Date
}

export type Participant = {
    player_id: string
    game_id: string
    team: TeamResult
    champion: string | null
}
