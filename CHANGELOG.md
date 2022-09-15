### 2.10.7

- Mapping fields from the CRM are restricted by their properties of being readable, creatable, updatable and searchable in their appropriate context
- Fields that are marked as required for creating a CRM record are mandated to be mapped for `create` actions

![Preview](https://user-images.githubusercontent.com/110259385/190345050-1041f0c8-77d8-44fd-86d9-209dbd29e355.gif)

### 2.10.6

- Show API names for CRM fields in dropdowns
- Ability to search for a field in a dropdown by its API name

![Preview](https://user-images.githubusercontent.com/110259385/189930698-5ba875c1-f7ec-490e-aaf7-a039f1aeb9a2.png)

### 2.10.5

- Fixed a bug where the UI for adding a nested field was visible even when the user opted out from mapping that field

### 2.10.4

- Show option to opt-out from mapping entire object

![Preview](https://user-images.githubusercontent.com/110259385/188629778-e09c32ea-8c97-4685-87c0-3bdf7759d02f.gif)

### 2.10.3

- Fixes to enable selecting fields of `array` type

### 2.10.2

- Fix to not pass source_pointer for `empty` transformations

### 2.10.1

- Show picklist values while updating or creating fields with static data

![Preview](https://user-images.githubusercontent.com/110259385/186719311-37adfc75-45e9-481f-82cc-5e4e66d44d53.gif)

## 2.10.0

- Added ability to not take any action for an event
- Added ability to opt-out from selecting a field for data mapping

![Preview](https://user-images.githubusercontent.com/110259385/186135264-723b2042-1cd4-4357-a6ed-064c62bb1298.gif)

### 2.9.1

- Fix to allow only compatible fields to be selected in search filter field dropdown

![Preview](https://user-images.githubusercontent.com/110259385/186191234-f45fef6b-367e-4c04-8fb2-edf9a0a0a8b8.gif)

## 2.9.0

- Added support for static boolean values
- Added back button in object selection screen

![Preview](https://user-images.githubusercontent.com/110259385/185599998-d27c6640-a67b-446f-9723-7f70807f497f.gif)

## 2.8.0

- Added `contains` operator for search filters

### 2.7.3

- Fixed date transformations for `create` and `update` action handlers

### 2.7.2

- Fix to correctly handle the scenario where backend returns empty error response while fetching CRM Objects

### 2.7.1

- Fix to correctly handle the scenario where CRM Link is launched for a connection that is disconnected or broken

## 2.7.0

- Added support for creating named connections via `connectionID` flag

## 2.6.0

- Added suggested options while mapping
- Added back button in the top left corner for relevant screens

## 2.5.0

- Added ability to take actions for a `delete` event

### 2.4.2

- Added relevant tooltips within the UI

### 2.4.1

- Reorganized UI for 'Read' and 'Write' mappings
- Improved labels for action handlers when creating or updating records
- CRM fields in the dropdown are now sorted alphabetically at each level

## 2.4.0

- Added ability to navigate Combobox entries via up and down arrow keys
- Added ability to select a Combobox entry via Spacebar and Enter keys
- Fixed not being able to type spaces for static strings in a Combobox
