// README: https://github.com/oven-sh/bun/issues/4890
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import { createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { Component } from './component'

const root = createRoot(document.getElementById('root')!)
root.render(createElement(Component))
