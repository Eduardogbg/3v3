import { Flex, Paper, Text } from "@mantine/core"
import { Player, schemas } from "../../types"
import { useMemo } from "react"
import { calculateRatings } from "../../domain/rating"

export interface PlayerListProps {
    players: schemas.Player[]
    participants: schemas.Participant[]
}

export function PlayerList(props: PlayerListProps) {
    const ratings = useMemo(
        () => calculateRatings(props.players, props.participants),
        [props.players, props.participants]
    )

    return (
        <div style={{
            display: 'grid',
            gridTemplateRows: 'repeat(auto, 1fr)'
        }}>
            {props.players.map(p => (
                <Paper
                    withBorder
                    p='xs'
                    style={theme => ({})}
                >
                    <Text>
                        {p.name}
                    </Text>
                    <Text>
                        {ratings[p.id] ?? p.mmr}
                    </Text>
                </Paper>
            ))}
        </div>
    )
}