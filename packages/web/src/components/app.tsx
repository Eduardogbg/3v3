import { sql, type JournalId } from '@orbitinghail/sqlsync-worker'
import { CodeHighlight } from '@mantine/code-highlight'
import { AppShell, Card, Container, Flex, Grid, Paper, Stack, useMantineColorScheme, useMantineTheme } from '@mantine/core'
import { useMutate, useQuery } from '../doctype'
import { CreatePlayerForm } from './create-player-form/create-player-form'
import { AddGameForm } from './add-game-form/add-game-form'

import appClasses from './app.module.css'
import { PlayerList } from './create-player-form/player-list'
import { schemas } from '../types'

export function App(props: { docId: JournalId }) {
    const { colorScheme } = useMantineColorScheme()

    // FIXME: bundler issue? JournalId is unique, and differs from src to dist
    const mutate = useMutate(props.docId as any)

    // TODO: import schema type from db
    const players = useQuery<{ id: string, name: string, mmr: number }>(
        props.docId as any,
        sql`select id, name, mmr from players`,
    ).rows ?? []

    // const players = [
    //     {
    //         id: '71b73848-95a6-4da0-8b12-bbb63dc6df84',
    //         name: 'TGod',
    //         mmr: 1600,
    //     },
    //     {
    //         id: 'e3afdc90-3c7e-42ec-bb0c-f7bf78c2c1a9',
    //         name: 'ZZ',
    //         mmr: 2000,
    //     },
    //     {
    //         id: '1a53279c-55ed-4913-b8b3-512132133cc7',
    //         name: 'Leleko',
    //         mmr: 2000,
    //     },
    //     {
    //         id: '4d8ef08f-d6ad-4a91-a226-a4ba45ae8869',
    //         name: 'Gomão',
    //         mmr: 1600,
    //     }
    // ]


    const games = useQuery<{ id: string, date: string, winning_team_side: string }>(
        props.docId as any,
        sql`select id, date, winning_team_side from games`,
    ).rows ?? []

    // TODO: is there a point to using zod to parse types? I guess only makes
    // sense after we start synching stuff...
    const participants = (
        useQuery<{ game_id: string, player_id: string, team: string, champion: string }>(
            props.docId as any,
            sql`select game_id, player_id, team, champion from participants`,
        ).rows
        ?? []
    ) as schemas.Participant[]

    console.log({ players, games, participants })

    // TODO: remember to put this code in some utils or whatevs
    // const data = {
    //     players,
    //     games: games.map(g => ({
    //         ...g,
    //         participants: participants.filter(p => p.game_id === g.id),
    //     }))
    // }

    return (
        <AppShell
            // TODO: this in more places
            style={theme => ({
                backgroundColor: colorScheme === 'dark'
                    ? theme.colors.dark[6]
                    : theme.colors.white
            })}
        >
            <AppShell.Main>
                <Flex
                    p='md'
                    align={'start'}
                    justify={'space-around'}
                    wrap={'wrap'}

                >
                    <Paper
                        component={Stack}
                        shadow='xs'
                        p='md'
                        h='min-content'
                        style={{ minWidth: '30%' }}
                        withBorder
                    >
                        <AddGameForm mutate={mutate} players={players} />
                    </Paper>
                    <Paper
                        component={Stack}
                        shadow='xs'
                        p='md'
                        h='min-content'
                        withBorder
                    >
                        <CreatePlayerForm mutate={mutate} />
                        <PlayerList
                            players={players}
                            participants={participants}
                        />
                    </Paper>
                </Flex>
            </AppShell.Main>
        </AppShell>
    )
}
