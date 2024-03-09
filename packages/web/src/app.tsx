import { journalIdFromString, sql } from '@orbitinghail/sqlsync-worker'
import { useCallback, useEffect, type FormEvent, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useMutate, useQuery } from './reducer'


const DOC_ID = journalIdFromString('VM7fC4gKxa52pbdtrgd9G9');


export function App() {
    const mutate = useMutate(DOC_ID);

    useEffect(() => {
        mutate({ tag: 'InitSchema' }).catch((err) => {
            console.error('Failed to init schema', err);
        });
    }, [mutate]);

    const [playerName, setPlayerName] = useState<string>('');
    const [mmr, setMmr] = useState<number>(1600);

    const handleSubmit = useCallback(
        (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();

            const id = crypto.randomUUID ? crypto.randomUUID() : uuidv4();

            if (playerName.trim() !== '') {
                mutate({
                    tag: 'AddPlayer',
                    id,
                    name: playerName,
                    mmr,
                }).catch((err) => {
                    console.error('Failed to add message', err);
                });

                setPlayerName('');
            }
        },
        [mutate, playerName, mmr, setPlayerName],
    );

    // TODO: import schema type from db
    const { rows } = useQuery<{ id: string, name: string, mmr: number }>(
        DOC_ID,
        sql`select id, name, mmr from players`,
    );

    return (
        <div>
            <pre>
                {JSON.stringify(rows, null, 2)}
            </pre>
            <form onSubmit={handleSubmit}>
                <label htmlFor="playerName">Player Name</label>
                <input
                    id="playerName"
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                />
                <label htmlFor="mmr">MMR</label>
                <input
                    id="mmr"
                    type="number"
                    value={mmr}
                    onChange={(e) => setMmr(Number(e.target.value))}
                />
                <button type="submit">Add Player</button>
            </form>
        </div>
    )
}
