import { useForm } from '@mantine/form';
import { Button, Flex, NumberInput, Text, TextInput, Title } from '@mantine/core';
import { useCallback, useEffect } from 'react'
import type { Mutation } from '../../doctype'


export interface CreatePlayerFormProps {
    mutate: (m: Mutation) => Promise<void>
}

export function CreatePlayerForm({ mutate }: CreatePlayerFormProps) {
    useEffect(() => {
        mutate({ tag: 'InitSchema' }).catch((err) => {
            console.error('Failed to init schema', err);
        });
    }, [mutate])

    const form = useForm({
        initialValues: {
            playerName: '',
            mmr: 1600,
        },
        validate: {
            playerName: (value) => value.trim().length > 0 ? undefined : 'Player name is required',
            mmr: (value) => value > 0 ? undefined : 'MMR must be greater than 0',
        }
    });

    const handleSubmit = form.onSubmit(useCallback(
        ({ playerName, mmr }) => {
            mutate({
                tag: 'CreatePlayer',
                id: crypto.randomUUID(),
                name: playerName,
                mmr,
            })
                .then(() => form.reset())
                .catch((err) => {
                    console.error('Failed to add message', err);
                });
        },
        [mutate, form],
    ))

    return (
        <Flex>
            <form onSubmit={handleSubmit}>
                <Title order={4}>Create Player</Title>
                {/* TODO: standardize casing in web codebase */}
                <Flex direction='column' gap='xs'>
                    <label htmlFor='playerName'>Name</label>
                    <TextInput
                        styles={{ input: { fontSize: '16px' } }}
                        required
                        {...form.getInputProps('playerName')}
                    />
                    <label htmlFor='mmr'>MMR</label>
                    <NumberInput
                        styles={{ input: { fontSize: '16px' } }}
                        required
                        step={50}
                        {...form.getInputProps('mmr')}
                    />
                    <Button type='submit'>+</Button>
                </Flex>
            </form>
        </Flex>
    )
}