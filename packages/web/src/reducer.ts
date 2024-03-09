import type { DocType } from '@orbitinghail/sqlsync-worker'
import { createDocHooks } from '@orbitinghail/sqlsync-react'
import { serializeMutationAsJSON } from '@orbitinghail/sqlsync-worker'

const REDUCER_URL = new URL(
    '../../target/wasm32-unknown-unknown/release/reducer.wasm',
    import.meta.url,
)

// Must match the Mutation type in the Rust Reducer code
export type Mutation = (
    | {
        tag: 'InitSchema'
    }
    | {
        tag: 'AddPlayer'
        id: string
        name: string
        mmr: number
    }
    | {
        tag: 'AddGame'
        id: string
        date: string
        winning_team_players: Array<[string, string | null]>
        losing_team_players: Array<[string, string | null]>
        winning_team_side: string | null
    }
)

export const TaskDocType: DocType<Mutation> = {
    reducerUrl: REDUCER_URL,
    serializeMutation: serializeMutationAsJSON,
}

export const { useMutate, useQuery, useSetConnectionEnabled } = createDocHooks(TaskDocType)
