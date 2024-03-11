import type { DocType } from '@orbitinghail/sqlsync-worker'
import { createDocHooks } from '@orbitinghail/sqlsync-react'
import { serializeMutationAsJSON } from '@orbitinghail/sqlsync-worker'
import type { GamePlayer, TeamSide } from './types'


const REDUCER_URL = new URL(
    '../../../target/wasm32-unknown-unknown/release/reducer.wasm',
    import.meta.url,
)


// Must match the Mutation type in the Rust Reducer code
export type Mutation = (
    | {
        tag: 'InitSchema'
    }
    | {
        tag: 'CreatePlayer'
        id: string
        name: string
        mmr: number
    }
    | {
        tag: 'AddGame'
        id: string
        date: string
        players: GamePlayer[]
        winning_team_side: TeamSide | null
    }
)

export const GameDocType: DocType<Mutation> = {
    reducerUrl: REDUCER_URL,
    serializeMutation: serializeMutationAsJSON,
}

export const { useMutate, useQuery, useSetConnectionEnabled } = createDocHooks(GameDocType)
