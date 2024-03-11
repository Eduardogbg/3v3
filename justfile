RANKED_ARAM_PROD_URL := "https://sqlsync.eduardogbg.workers.dev"

wasm-reducer *FLAGS:
    cargo build --target wasm32-unknown-unknown --package reducer {{FLAGS}}

upload-demo-reducer mode='release' target='local':  
    #!/usr/bin/env bash
    set -euo pipefail
    cd crates/cloudflare-backend

    if [[ '{{mode}}' = 'release' ]]; then
        just wasm-reducer '--release'
        REDUCER_PATH="../../target/wasm32-unknown-unknown/release/reducer.wasm"
    else
        REDUCER_PATH="../../target/wasm32-unknown-unknown/debug/reducer.wasm"
    fi

    if [[ '{{target}}' = 'remote' ]]; then
        echo "Uploading $REDUCER_PATH to rankedaram prod"
        curl -X PUT --data-binary @$REDUCER_PATH {{RANKED_ARAM_PROD_URL}}/reducer
        echo
    else
        echo "Uploading $REDUCER_PATH to localhost:8787"
        curl -X PUT --data-binary @$REDUCER_PATH http://localhost:8787/reducer
        echo
    fi
