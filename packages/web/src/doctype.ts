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
        gamePlayers: GamePlayer[]
        winningTeamSide: TeamSide | null
    }
)

function convertCamelToSnake(str: string) {
    return str.replace(/([a-zA-Z])(?=[A-Z])/g, '$1_').toLowerCase()
}

export const GameDocType: DocType<Mutation> = {
    reducerUrl: REDUCER_URL,
    serializeMutation: mutation => {
        // TODO: do this for deeper properties
        const caseCorrectedMutation = Object.fromEntries(Object.entries(mutation).map(([k, v]) => [convertCamelToSnake(k), v]))

        return serializeMutationAsJSON(caseCorrectedMutation)
    },
}

export const { useMutate, useQuery, useSetConnectionEnabled } = createDocHooks(GameDocType)
