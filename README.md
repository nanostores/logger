# Nano Stores Logger

<img align="right" width="92" height="92" title="Nano Stores logo"
     src="https://nanostores.github.io/nanostores/logo.svg">

Logger of lifecycles, actions and changes for **[Nano Stores]**,
a tiny state manager with many atomic tree-shakable stores.

[Nano Stores]: https://github.com/nanostores/nanostores/

## Install

```sh
npm install @nanostores/logger
```

## Usage

```js
import { logger } from '@nanostores/logger'

import { $profile, $users } from './stores/index.js'

let destroy = logger({
  'Profile Store': $profile,
  'Users Store': $users
})
```
