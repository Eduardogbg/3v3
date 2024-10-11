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

// TODO: think really hard about how to dedup stuff and whatnot
export module schemas {
    export type TeamSide = 'blue' | 'red'

    export type TeamResult = 'v' | 'd'

    // TODO: refactor stuff
    type SqliteDocument<T> = T // & { rowid: number }

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
}
