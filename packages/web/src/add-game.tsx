import { Button, Flex, Select, Text, Title, type OptionsFilter, Image, Container, Grid } from '@mantine/core'
import { DateTimePicker } from '@mantine/dates'
import type { Mutation } from './doctype'
import { useCallback } from 'react'
import { UseFormReturnType, useForm } from '@mantine/form'
import type { GamePlayer, Player, TeamResult } from './types'
import { CodeHighlight } from '@mantine/code-highlight'
import lolChampions from './champions.json'
import { SortEnd, SortableContainer, SortableElement } from 'react-sortable-hoc'


export interface AddGameProps {
    mutate: (m: Mutation) => Promise<void>
    players: Player[]
}

export function ChampionIcon(props: { size: string, championName: string }) {
    return (
        <div style={{ width: props.size, height: props.size }}>
            <Image
                src={`https://ddragon.leagueoflegends.com/cdn/14.5.1/img/champion/${props.championName}.png`}
            />
        </div>
    )
}

interface PlayerPreviewProps {
    player: Player
    gamePlayer: GamePlayer
}

const PlayerPreview = SortableElement<PlayerPreviewProps>((props: PlayerPreviewProps) => {
    const { player, gamePlayer } = props
    const { champion } = gamePlayer

    return (
        <li>
            {
                champion && (
                    <ChampionIcon size='32px' championName={champion} />
                )
            }
            <Text size='sm'>
                {player.name}
            </Text>
        </li>
    )
})

interface TeamPreviewProps {
    team: TeamResult
    players: Player[]
    gamePlayers: GamePlayer[]
}

const TeamPreview = SortableContainer<TeamPreviewProps>((props: TeamPreviewProps) => {
    const { team, players, gamePlayers } = props

    return (
        <ul>
            {gamePlayers.map((gamePlayer, index) => (
                gamePlayer.team !== team ? null : (
                    <PlayerPreview
                        index={index}
                        key={gamePlayer.player_id}
                        gamePlayer={gamePlayer}
                        player={players.find(p => p.id == gamePlayer.player_id)!} />
                )
            ))}
        </ul>
    )
})

interface GamePreviewProps {
    addGameForm: UseFormReturnType<{
        date: string,
        players: GamePlayer[],
        winning_team_side: string | null
    }>
    players: Player[]
}

// TODO: this code is AI generated, it's probably shit
function arrayMove<T>(array: T[], oldIndex: number, newIndex: number): T[] {
    console.log('arrayMove', oldIndex, newIndex)
    const newArray = [...array]
    const oldElement = newArray.splice(oldIndex, 1)[0]
    newArray.splice(newIndex, 0, oldElement)
    return newArray
}

const teamPreviewOnSortEnd = (
    team: TeamResult,
    addGameForm: UseFormReturnType<{
        date: string,
        players: GamePlayer[],
        winning_team_side: string | null
    }>
) => (sort: SortEnd) => {
    const { players } = addGameForm.values
    const { oldIndex, newIndex } = sort

    addGameForm.setValues({
        ...addGameForm.values,
        players: arrayMove(players, oldIndex, newIndex),
    })
}

export function GamePreview({ addGameForm, players }: GamePreviewProps) {
    /*
    Needs a column for each team, a row for each player preview
    This component will preview each player.
    */

    // const winningTeamPlayers = addGameForm.values.players.filter(p => p.team == 'v')
    // const losingTeamPlayers = addGameForm.values.players.filter(p => p.team == 'd')

    return (
        <Container size='xs' py='sm'>
            <Grid justify='space-around' align='center'>
                <Grid.Col span={3}>
                    <TeamPreview
                        onSortEnd={teamPreviewOnSortEnd('v', addGameForm)}
                        team='v'
                        players={players}
                        gamePlayers={addGameForm.values.players}
                    />
                </Grid.Col>
                <Grid.Col span={3}>
                    <TeamPreview
                        onSortEnd={teamPreviewOnSortEnd('d', addGameForm)}
                        team='d'
                        players={players}
                        gamePlayers={addGameForm.values.players}
                    />
                </Grid.Col>
            </Grid>
        </Container>
    )
}

export function AddGame({ mutate, players }: AddGameProps) {
    const addGameForm = useForm({
        initialValues: {
            date: '',
            players: [] as GamePlayer[],
            winning_team_side: null,
        }
    })

    const handleSubmitGame = addGameForm.onSubmit(useCallback(
        ({
            date,
            players,
            winning_team_side,
        }) => {
            let mutation = {
                tag: 'AddGame',
                id: crypto.randomUUID(),
                date,
                players,
                winning_team_side,
            }
            console.log('submitting game', { mutation })

            mutate({
                tag: 'AddGame',
                id: crypto.randomUUID(),
                date: date.toString(),
                players,
                winning_team_side,
            })
                .then(() => addGameForm.reset())
                .catch((err) => {
                    console.error('Failed to add message', err)
                })

            addGameForm.reset()
        },
        [mutate, addGameForm],
    ))

    const addPlayerForm = useForm<GamePlayer>({
        initialValues: {
            team: 'v',
            // TODO: standardize casing in web codebase
            player_id: '',
            champion: '',
        },
        // TODO: fix validation when form is resetted
        // validate: {
        //     team: value => value === 'v' || value === 'd',
        //     player: value => value !== null,
        //     champion: value => value !== null,
        // }
    })

    const handleSubmitPlayer = addPlayerForm.onSubmit(useCallback(
        gamePlayer => {
            console.log('submitting', gamePlayer)

            addGameForm.setValues({
                ...addGameForm.values,
                players: [
                    ...addGameForm.values.players,
                    gamePlayer,
                ]
            })

            addPlayerForm.reset()
        },
        [addPlayerForm]
    ))

    const filterPlayers: OptionsFilter = input => {
        const nonSelectedPlayers = input.options.filter(playerOption => {
            if ('items' in playerOption) {
                throw new Error('TODO: deal with this shitty type from mantine')
            }

            const playerId = playerOption.value

            return (
                !addGameForm
                    .values
                    .players
                    .map(p => p.player_id)
                    .includes(playerId)
            )
        })
        return nonSelectedPlayers.filter(playerOption => {
            if ('items' in playerOption) {
                throw new Error('TODO: deal with this shitty type from mantine')
            }

            const playerId = playerOption.value
            const player = players.find(p => p.id === playerId)

            return player?.name.startsWith(input.search)
        })
    }


    const playerData = players.map(p => ({ value: p.id, label: p.name }))

    return (
        <>
            <form onSubmit={handleSubmitPlayer}>
                <Title order={4}>Add Player</Title>
                <Flex direction='column' gap='xs'>
                    <Select
                        id='team'
                        label='Team'
                        data={[
                            { value: 'v', label: 'Victorious' },
                            { value: 'd', label: 'Defeated' },
                        ]}
                        {...addPlayerForm.getInputProps('team')}
                    />
                    <Select
                        id='player_id'
                        label='Player'
                        data={playerData}
                        searchable
                        filter={filterPlayers}
                        {...addPlayerForm.getInputProps('player_id')}
                    />
                    <Select
                        id='champion'
                        label='Champion'
                        searchable
                        data={lolChampions}
                        {...addPlayerForm.getInputProps('champion')}
                    />
                    <Button type='submit'>
                        +
                    </Button>
                </Flex>
            </form>
            <form onSubmit={handleSubmitGame}>
                <Title order={4}>Add Game</Title>
                <Flex direction='column' gap='xs'>
                    <Select
                        id='winning_team_side'
                        label='Winning Team Side'
                        data={[
                            { value: 'blue', label: 'Blue' },
                            { value: 'red', label: 'Red' },
                        ]}
                        {...addGameForm.getInputProps('winning_team_side')}
                    />
                    <DateTimePicker
                        id='date'
                        label='Date'
                        {...addGameForm.getInputProps('date')}
                    />
                    <Button type='submit'>
                        +
                    </Button>
                </Flex>
                {/* TODO: fix */}
                {<GamePreview addGameForm={addGameForm as any} players={players} />}
                <CodeHighlight code={JSON.stringify(addGameForm.values, null, 2)} language='json' />
            </form>
        </>
    )
}
