# @xkit-co/crm-link.js

## Installation

[Refer to documentation](https://xkit.co/docs/crm-link#install-crm-linkjs)

## Debugging

Under some very specific circumstances, you might run into issues with using this library. Some of these are known and are listed below:

- This library renders DOM elements at `z-index` values of `999` and `1000`. You might notice an issue if the `z-index` values in your application are the same or higher.
- This library uses the available height of the document window to determine where to render dropdown menus. If for some reason, the height of your application's `html` or `body` element is less than the viewport height, you might notice an issue.
- This library when consumed as a node package is built for ES5 and above. Make sure your build tool or bundler is up to date.
- When using the browser script, ensure `window.linkCRM` is not re-assigned.
- Ensure that no DOM elements in your application have an `id` attribute of `xkit-crm-link-scope`.

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
