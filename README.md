# @xkit-co/crm-link.js

## Installation

[Refer to documentation](https://xkit.co/docs/crm-link#install-crm-linkjs)

## API

`linkCRM()`

| Argument  | Type     | Description                                                                                                                                                                                       |
| --------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `domain`  | `string` | The domain string of your Xkit application. This can be viewed and configured in the [Xkit developer portal](https://app.xkit.co/).                                                               |
| `token`   | `string` | The Xkit context token that is fetched from your application's backend. Refer to the [Xkit documentation](https://xkit.co/docs/crm-link#context-token).                                           |
| `options` | `object` | The configuration object by which the user will map data from their CRM, and customize how CRM Link is launched. Refer to the [Xkit documentation](https://xkit.co/docs/crm-api#add-to-crm-link). |

| Return Type       | Description                                                                |
| ----------------- | -------------------------------------------------------------------------- |
| `Promise<string>` | A promise that either resolves to a connection ID or rejects with an error |

## Development

Run `npm run dev`. This will:

1. Build `dist/index.js` which can be imported into a React application.
2. Build `dist/browser.js` which can be injected as a script tag.
3. Watch for changes and rebuild the above when you edit and save the source code.
