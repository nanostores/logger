# Nano Stores Logger

<img align="right" width="92" height="92" title="Nano Stores logo"
     src="https://nanostores.github.io/nanostores/logo.svg">

Logger of lifecycles and changes for **[Nano Stores]**, a tiny state manager
with many atomic tree-shakable stores.

[Nano Stores]: https://github.com/nanostores/nanostores/

## Install

```sh
npm install @nanostores/logger
```

## Usage

```js
import { logger } from '@nanostores/logger'

import { user, post } from './stores/index.js'

let destroy = logger({
  user,
  post
})
```

Also we have an option for `mapTemplate` (deprecated, but part of Logux Client)
to name different stores in logs:

```js
logger({
  …
}, {
  nameGetter: (store, templateName) => `${templateName}:${store.get().id}`
})
```
