import { SQLSyncProvider } from '@orbitinghail/sqlsync-react'
import sqlSyncWasmUrl from '@orbitinghail/sqlsync-worker/sqlsync.wasm?url'
import workerUrl from '@orbitinghail/sqlsync-worker/worker.js?worker&url'
import { App } from './app'


console.log({
    sqlSyncWasmUrl,
    workerUrl,
})


export function Root() {
    return (
        <SQLSyncProvider wasmUrl={sqlSyncWasmUrl} workerUrl={workerUrl}>
            <App />
        </SQLSyncProvider>
    )
}   
