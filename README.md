# @xkit-co/crm-link.js

## Installation

### With React

**npm**

```bash
npm install @xkit-co/crm-link.js
```

**yarn**

```bash
yarn add @xkit-co/crm-link.js
```

**Usage example**

```js
import linkCRM from '@xkit-co/crm-link.js'

export default function App() {
  return (
    <button
      onClick={async () => {
        // Call your backend route to fetch a context token, see: https://docs.xkit.co/docs/xkit-contexts
        const { token } = await fetch('/xkit/token')
        try {
          const connection = await linkCRM('example.xkit.co', token)
          // ...
        } catch (error) {
          // ...
        }
      }}
    >
      Connect CRM
    </button>
  )
}
```

### With other web frameworks

You will need to add `react` and `react-dom` along with `@xkit-co/crm-link.js`.

From our testing, this adds no more than 45 KB to your final browser bundle.

**npm**

```bash
npm install react react-dom @xkit-co/crm-link.js
```

**yarn**

```bash
yarn add react react-dom @xkit-co/crm-link.js
```

**Usage example**

The process is similar to the example above for React, but where you call `linkCRM()` might change depending on your framework.

The example that follows is for Vue:

```vue
<template>
  <button @click="handleClick">Connect CRM</button>
</template>

<script>
import linkCRM from '@xkit-co/crm-link.js'

export default {
  name: 'App',
  methods: {
    handleClick: async () => {
      // Call your backend route to fetch a context token, see: https://docs.xkit.co/docs/xkit-contexts
      const { token } = await fetch('/xkit/token')
      try {
        const connection = await linkCRM('example.xkit.co', token)
        // ...
      } catch (error) {
        // ...
      }
    }
  }
}
</script>

<style></style>
```

### Without a web framework

You can use the browser script hosted through any public npm CDN. The example that follows uses UNPKG.

Within your document's `<head>`:

```html
<script src="https://unpkg.com/@xkit-co/crm-link.js@^1/dist/browser.js"></script>
<script>
  const handleClick = async () => {
    // Call your backend route to fetch a context token, see: https://docs.xkit.co/docs/xkit-contexts
    const { token } = await fetch('/xkit/token')
    try {
      const connection = await linkCRM('example.xkit.co', token)
      // ...
    } catch (error) {
      // ...
    }
  }
</script>
```

Within your document's `<body>`:

```html
<button onclick="handleClick()">Connect CRM</button>
```

## API

`linkCRM()`

| Argument | Type     | Description                                                                                                                                                     |
| -------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `domain` | `string` | The domain string of your Xkit application. This can be viewed and configured in the [Xkit dev portal](https://app.xkit.co/).                                   |
| `token`  | `string` | The Xkit context token that is fetched from your application's backend. Refer to the [Xkit documentation on Contexts](https://docs.xkit.co/docs/xkit-contexts). |

| Return Type           | Description                                                                                                                 |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `Promise<Connection>` | A promise that either resolves to a [Connection object](https://docs.xkit.co/reference/connection) or rejects with an error |

## Development

Run `npm run dev`. This will:

1. Build `dist/index.js` which can be imported into a React application.
2. Build `dist/browser.js` which can be injected as a script tag.
3. Watch for changes and rebuild the above when you edit and save the source code.
