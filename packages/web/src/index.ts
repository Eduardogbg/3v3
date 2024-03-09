// README: https://github.com/oven-sh/bun/issues/4890
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import { createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { Root } from './root'

const root = createRoot(document.getElementById('root')!)
root.render(createElement(Root))
