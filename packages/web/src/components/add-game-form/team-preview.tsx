import { useDroppable } from '@dnd-kit/core'
import { Flex, Paper, Stack, getThemeColor } from '@mantine/core'

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

    const teamColor = team == 'v' ? 'blue' : 'red'

    return (
        <Paper
            ref={setNodeRef}
            style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,

                borderWidth: '2px',
                borderStyle: 'solid',
                borderRadius: '0.5em',
                backgroundColor: teamColor,
            }}
            p='xs'
            m='xs'
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
