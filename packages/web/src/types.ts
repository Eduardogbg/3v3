// TODO: import schema type from db
export type Player = {
    id: string
    name: string
    mmr: number
}

// TODO: deal with casing
export type Game = {
    id: string
    date: string
    winning_side: TeamSide | null
    winning_team_players: Array<[string, string | null]>
    losing_team_players: Array<[string, string | null]>
}

export type GamePlayer = {
    player_id: string
    team: TeamResult
    champion: string | null
}

export type TeamSide = 'blue' | 'red'

export type TeamResult = 'v' | 'd'
