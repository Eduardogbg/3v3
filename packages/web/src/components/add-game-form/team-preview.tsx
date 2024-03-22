import { useDroppable } from '@dnd-kit/core'
import { Flex, Paper, Stack } from '@mantine/core'

import { GamePlayer, Player, TeamResult } from '../../types'
import { PlayerPreview } from './player-preview'


interface TeamPreviewProps {
    team: TeamResult
    players: Player[]
    gamePlayers: GamePlayer[]
}


export function TeamPreview(props: TeamPreviewProps) {
    const { team, players, gamePlayers } = props

    const { setNodeRef } = useDroppable({ id: team })

    const getPlayerPreviewData = (gamePlayer: GamePlayer) => ({
        gamePlayer,
        player: players.find(p => p.id == gamePlayer.player_id)!
    })

    return (
        // <Paper
        //     ref={setNodeRef}
        //     component={Stack}
        //     p='md'
        //     m='md'
        <Paper
            ref={setNodeRef}
            style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                // minWidth: '40%',
                borderColor: team == 'v' ? 'blue' : 'red',
                borderWidth: '2px',
                borderStyle: 'solid',
                borderRadius: '0.5em',
            }}
        >
            {gamePlayers.map(gamePlayer => (
                gamePlayer.team !== team ? null : (
                    <PlayerPreview
                        key={gamePlayer.player_id}
                        data={getPlayerPreviewData(gamePlayer)}
                    />
                )
            ))}
            {/* </Paper> */}
        </Paper>
    )
}
