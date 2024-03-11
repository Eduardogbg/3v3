import { sql, type JournalId } from '@orbitinghail/sqlsync-worker'
import { CodeHighlight } from '@mantine/code-highlight'
import { Container, Paper, Stack } from '@mantine/core'
import { useMutate, useQuery } from './doctype'
import { CreatePlayer } from './create-player'
import { AddGame } from './add-game'


export function App(props: { docId: JournalId }) {
    // FIXME: bundler issue? JournalId is unique, and differs from src to dist
    const mutate = useMutate(props.docId as any)

    // TODO: import schema type from db
    const players = useQuery<{ id: string, name: string, mmr: number }>(
        props.docId as any,
        sql`select id, name, mmr from players`,
    ).rows ?? []

    const games = useQuery<{ id: string, date: string, winning_team_side: string }>(
        props.docId as any,
        sql`select id, date, winning_team_side from games`,
    ).rows ?? []

    const participants = useQuery<{ game_id: string, player_id: string, team: string, champion: string }>(
        props.docId as any,
        sql`select game_id, player_id, team, champion from participants`,
    ).rows ?? []

    console.log({ players, games, participants })

    const data = {
        players,
        games: games.map(g => ({
            ...g,
            participants: participants.filter(p => p.game_id === g.id),
        }))
    }

    return (
        <Container size='xs' py='sm'>
            <Stack>
                <Paper component={Stack} shadow='xs' p='xs'>
                    <CreatePlayer mutate={mutate} />
                </Paper>
                <Paper component={Stack} shadow='xs' p='xs'>
                    <AddGame mutate={mutate} players={players} />
                </Paper>
                <Paper component={Stack} shadow='xs' p='xs'>
                    <CodeHighlight code={JSON.stringify(data, null, 2)} language='json' />
                </Paper>
            </Stack>
        </Container>
    )
}
