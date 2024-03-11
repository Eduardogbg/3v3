import { Button, Flex, MultiSelect, NumberInput, Select, Title, type OptionsFilter } from '@mantine/core'
import { DateInput, DateTimePicker } from '@mantine/dates'
import type { Mutation } from './doctype'
import { useCallback } from 'react'
import { useForm } from '@mantine/form'
import type { GamePlayer, Player } from './types'
import { CodeHighlight } from '@mantine/code-highlight'
import lolChampions from './champions.json'


export interface AddGameProps {
    mutate: (m: Mutation) => Promise<void>
    players: Player[]
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
                <CodeHighlight code={JSON.stringify(addGameForm.values, null, 2)} language='json' />
            </form>
        </>
    )
}
