import type { Participant, Player } from './schemas'

type Ratings = { [playerName: string]: number }

const teamAverage = (team: Player[]) => team.reduce((acc, curr) => acc + curr.mmr, 0) / team.length


export const k = 40
export const σ = 400
export const μ = 1600

// =k*(-1/(1+EXP(-(rating_próprio_antigo-(média_rating_inimigos)/sigma)))
/*
    the rating formula uses a sigmoid function, like elo, to compute the rating delta,
    but since it's a player game, it compares the player rating to the average of the
    opposing team
*/
const eloDelta = (playerRating: number, opposingTeamRating: number) => {
    const delta = playerRating - opposingTeamRating
    return k / (1 + Math.exp(-delta / σ))
};

export function calculateRatings(
    players: Player[],
    participants: Participant[],
): Ratings {
    const ratings: Ratings = {}

    for (const player of players) {
        ratings[player.name] = player.mmr
    }

    type GameTeams = { winningTeam: Player[]; losingTeam: Player[] }

    const gameIds = participants
        .map(p => p.game_id)
        .filter((value, index, array) => array.indexOf(value) === index)

    console.log({ gameIds })


    const gameTeams = gameIds.map(gameId => ({
        winningTeam: participants
            .filter(p => p.game_id === gameId && p.team === 'v')
            .map(participant => players.find(player => player.id === participant.player_id)!),
        losingTeam: participants
            .filter(p => p.game_id === gameId && p.team === 'd')
            .map(participant => players.find(player => player.id === participant.player_id)!),
    }))

    console.log({ gameTeams })


    for (const { winningTeam, losingTeam } of gameTeams) {
        const winningTeamRating = teamAverage(winningTeam);
        const losingTeamRating = teamAverage(losingTeam);

        for (const player of winningTeam) {
            ratings[player.name] += eloDelta(player.mmr, losingTeamRating)
        }

        for (const player of losingTeam) {
            ratings[player.name] -= eloDelta(player.mmr, winningTeamRating);
        }
    }

    return ratings;
}
