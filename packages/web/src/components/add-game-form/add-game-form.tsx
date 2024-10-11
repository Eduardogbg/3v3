import { useCallback } from 'react'
import { CodeHighlight } from '@mantine/code-highlight'
import { Button, Flex, Select, Title, type OptionsFilter } from '@mantine/core'
import { DateTimePicker } from '@mantine/dates'
import { useForm } from '@mantine/form'
import classNames from 'classnames'

import type { Mutation } from '../../doctype'
import type { GamePlayer, Player, TeamSide } from '../../types'

import lolChampions from '../../assets/champions.json'
import { GamePreview } from './game-preview'
import classes from './add-game-form.module.css'


type AddGameForm = {
    date: string
    gamePlayers: GamePlayer[]
    winningTeamSide: TeamSide | null
}


export interface AddGameFormProps {
    mutate: (m: Mutation) => Promise<void>
    players: Player[]
}

export function AddGameForm({ mutate, players }: AddGameFormProps) {
    const addGameForm = useForm<AddGameForm>({
        initialValues: {
            date: '',
            gamePlayers: [
                // {
                //     player_id: '71b73848-95a6-4da0-8b12-bbb63dc6df84',
                //     champion: 'Akali',
                //     team: 'v',
                // },
                // {
                //     player_id: 'e3afdc90-3c7e-42ec-bb0c-f7bf78c2c1a9',
                //     champion: 'Varus',
                //     team: 'v',
                // },
                // {
                //     player_id: '1a53279c-55ed-4913-b8b3-512132133cc7',
                //     champion: 'Orianna',
                //     team: 'v',
                // },
                // {
                //     player_id: '4d8ef08f-d6ad-4a91-a226-a4ba45ae8869',
                //     champion: 'Amumu',
                //     team: 'd',
                // },
            ] as GamePlayer[],
            winningTeamSide: null,
        }
    })

    const handleSubmitGame = addGameForm.onSubmit(useCallback(
        ({
            date,
            gamePlayers,
            winningTeamSide: winning_team_side,
        }) => {
            let mutation = {
                tag: 'AddGame',
                id: crypto.randomUUID(),
                date,
                gamePlayers,
                winning_team_side,
            }
            console.log('submitting game', { mutation })

            mutate({
                tag: 'AddGame',
                id: crypto.randomUUID(),
                date: date.toString(),
                gamePlayers,
                winningTeamSide: winning_team_side,
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
                gamePlayers: [
                    ...addGameForm.values.gamePlayers,
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
                    .gamePlayers
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
        <div className={classNames(classes.container)}>
            <form
                onSubmit={handleSubmitPlayer}
                className={classNames(classes['add-participant'])}
            >
                <Title order={4}>Add Participant</Title>
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
            </form>
            <form
                onSubmit={handleSubmitGame}
                className={classNames(classes['submit-game'])}
            >
                <Title order={4}>Submit Game</Title>
                <Select
                    id='winningTeamSide'
                    label='Winning Team Side'
                    data={[
                        { value: 'blue', label: 'Blue' },
                        { value: 'red', label: 'Red' },
                    ]}
                    {...addGameForm.getInputProps('winningTeamSide')}
                />
                <DateTimePicker
                    id='date'
                    label='Date'
                    {...addGameForm.getInputProps('date')}
                />
                <Button type='submit'>
                    +
                </Button>
                {/* <CodeHighlight code={JSON.stringify(addGameForm.values, null, 2)} language='json' /> */}
            </form>
            <GamePreview
                className={classes['game-preview']}
                players={players}
                gamePlayers={addGameForm.values.gamePlayers}
                setGamePlayers={gps => (
                    addGameForm.setValues({
                        ...addGameForm.values,
                        gamePlayers: gps
                    })
                )}
            />
        </div>
    )
}
