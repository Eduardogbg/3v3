// SQLSync
import { SQLSyncProvider } from '@orbitinghail/sqlsync-react'
import { journalIdFromString, journalIdToString } from '@orbitinghail/sqlsync-worker'
import sqlSyncWasmUrl from '@orbitinghail/sqlsync-worker/sqlsync.wasm?url'
import workerUrl from '@orbitinghail/sqlsync-worker/worker.js?worker&url'

// UI Libraries
import { StrictMode } from 'react'
import { RouterProvider, createBrowserRouter, redirect, useParams, useRouteError } from 'react-router-dom'
import { Alert, Container, MantineProvider, Stack } from '@mantine/core'

// Styles
import '@mantine/code-highlight/styles.css'
import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'

// App
import { App } from './app'
import { MANTINE_THEME } from './theme'


console.log({
    sqlSyncWasmUrl,
    workerUrl,
})

const isLocalhost = (
    location.hostname === 'localhost'
    || location.hostname.startsWith('192.168')
)

const COORDINATOR_URL = isLocalhost
    ? `${location.hostname}:8787`
    // TODO: use my own coordinator
    : 'sqlsync.orbitinghail.workers.dev'

const newDocumentId = async (name = '') => {
    // let url = `${location.protocol}//${COORDINATOR_URL}/new`
    // if (name.trim().length > 0) {
    //     url += `/${encodeURIComponent(name)}`
    // }
    // const response = await fetch(url, {
    //     method: 'POST',
    // })
    // if (!response.ok) {
    //     throw new Error(`Failed to create new document: ${response.status}`)
    // }
    // return journalIdFromString(await response.text())
    return journalIdFromString('VM7fC4gKxa52pbdtrgd9G9');
}

const DocRoute = () => {
    const { docId } = useParams()

    if (!docId) {
        console.error('doc id not found in params')
        return <pre style={{ color: 'red' }}>ERROR: doc id not found in params</pre>
    }

    return <App docId={journalIdFromString(docId)} />
}


const ErrorBoundary = () => {
    const error = useRouteError()
    console.error(error)
    return (
        <Container size='xs' py='sm'>
            <Stack>
                <Alert variant='light' color='red' title='Error'>
                    Failed to load document
                    {Object.prototype.hasOwnProperty.call(error, 'message')
                        ? `: ${(error as { message: unknown }).message}`
                        : ''}
                </Alert>
            </Stack>
        </Container >
    )
}

const router = createBrowserRouter([
    {
        path: '/',
        errorElement: <ErrorBoundary />,
        loader: async () => {
            const docId = await newDocumentId()
            return redirect(`/${journalIdToString(docId)}`)
        },
    },
    {
        path: '/named/:name',
        errorElement: <ErrorBoundary />,
        loader: async ({ params }) => {
            const docId = await newDocumentId(params.name)
            return redirect(`/${journalIdToString(docId)}`)
        },
    },
    {
        path: '/:docId',
        element: <DocRoute />,
        errorElement: <ErrorBoundary />,
    },
])


export function Root() {
    return (
        <StrictMode>
            <MantineProvider theme={MANTINE_THEME}>
                <SQLSyncProvider wasmUrl={sqlSyncWasmUrl} workerUrl={workerUrl}>
                    <RouterProvider router={router} />
                </SQLSyncProvider>
            </MantineProvider>
        </StrictMode>
    )
}   
