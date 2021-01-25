# KDUIDManager

##### v 1.1.0 | © Cadence Holmes 2020 | MIT License

Generate and manage RFC4122 version 4 compliant unique identifiers with associated objects. Checks internally to absolutely ensure all identifiers are unique.

[Fork on CodeSandbox](https://codesandbox.io/s/kduidmanager-1du5f?file=/src/index.js)

## Install

`src/dist/KDUIDManager.bundle.js` can be added to your project in multiple ways:

```
// CommonJS / ES / Node module
// add to your module file

import { KDUIDManager } from "KDUIDManager.bundle.js";
console.log( KDUIDManager );
```

```
// AMD / Require module
// add to your module file

require(["KDUIDManager.bundle.js"], function(KDUIDManager) {
  console.log( KDUIDManager );
});
```

```
// Non-module / CDN
// add to your html file

<script src="KDUIDManager.bundle.js"></script>
<script>
  const KDUIDManager = window.kd.KDUIDManager;
  console.log( KDUIDManager );
</script>
```

## Basic Use

```
const manager = KDUIDManager();

const entity = {
  name: 'kd',
};

manager.generateUIDFor(entity);

console.log( manager.entries() );
```

## Extended Use

Manage uniquely identified objects in a self-contained scope.

```
const manager = KDUIDManager();

const janesUID = manager.generateUIDFor({
  name: Jane,
});

const jane = manager.getKeyFor(janesUID);
```

Export and import a list of entries.

```
const manager = KDUIDManager();
const entities = [obj1, obj2, obj3];
entities.forEach(entity => manager.generateUIDFor(entity));
yourSaveToPersistentStorageFunc( manager.entries() );

// Maybe when a new session is loaded.
const data = yourLoadFromPersistentStorageFunc();
manager.setEntries( data );
```

## API

`KDUIDManager` returns an object holding the following public methods.

| Method            | Parameters                 | Returns                                                        | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ----------------- | -------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| generateUIDFor    | target: `any`              | `string`                                                       | Generate a unique identifier and associate it with the `target` entity. Internally, these associations are stored in a `new Map()`. The target entity is set as the key, and the UID string is set as the value. If the target entity already exists in the map the existing association is deleted and a new UID is mapped to that entity.                                                                                                                                                       |
| hasUIDFor         | target: `any`              | `boolean`                                                      | Check if there is an existing UID for the target object.                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| getUIDFor         | target: `any`              | `string \| undefined`                                          | Retrieve the UID string for the associated object or `undefined` if an association doesn't exist.                                                                                                                                                                                                                                                                                                                                                                                                 |
| hasKeyFor         | uid: `string`              | `boolean`                                                      | Check if there is an existing key for the associated UID string.                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| getKeyFor         | uid: `string`              | `any`                                                          | Retrieve the key for the associated UID string or `undefined` if an association doesn't exist.                                                                                                                                                                                                                                                                                                                                                                                                    |
| keys              |                            | `any[]`                                                        | Retrieve a new array containing all keys (entities) held in the map.                                                                                                                                                                                                                                                                                                                                                                                                                              |
| uids              |                            | `string[]`                                                     | Retrieve a new array containing all values (uids) held in the map.                                                                                                                                                                                                                                                                                                                                                                                                                                |
| entries           |                            | `[any, string][]`                                              | Retrieve a new array containing individual arrays `[entity, uid]` for each entry.                                                                                                                                                                                                                                                                                                                                                                                                                 |
| setEntries        | entries: `[any, string][]` | `{ changed: [any, string][]; invalid: [any, any][] } \| false` | Clear all existing entries and set to the given list. If there are any duplicate keys, this will replace the key entry with the latest UID. If a duplicate UID is found, a new one will be generated for the given key. Returns an object with properties `changed`, an array holding any entries where the UID had to be changed, and `invalid` an array holding any entries that were not able to be added to the manager. Returns `false` if unsuccessful the entire process was unsuccessful. |
| deleteEntryForUID | uid: `string`              | `boolean`                                                      | Delete an entry given a target UID.                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| deleteEntryForKey | target: `any`              | `boolean`                                                      | Delete an entry given a target entity.                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| reset             |                            |                                                                | Clear all currently held target:UID associations.                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
