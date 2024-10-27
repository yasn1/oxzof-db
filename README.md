# OXZOF DB
- It is a simple JSON-based data processing module.

## Functions
-  set(key, value)
Creates a new variable or modifies an existing variable.

- get(key)
Returns the dataset matching the variable key.

- push(key,value)
Adds a new value to the dataset whose value is list.

## Example
```javascript
const database = require('oxzof-db');
const db = database()
// const db = database("./oxzof-db/db.json") <---- another using
await db.set('potato','hello') // Assign the value "hello" to the key "potato".
await db.get('potato') // returns "hello"
await db.push('array',"new element") // Adds a new value named "new element" to the "array" list
```
