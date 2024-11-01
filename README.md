# OXZOF DB
- It is a simple data processing module based on BSON.

## Functions
-  set(key, value)
Creates a new variable or modifies an existing variable.

- get(key)
Returns the dataset matching the variable key.

- push(key,value)
Adds a new value to the dataset whose value is list.

- unpush(key,value)
Deletes element(s) from the array.

- delete(key)
Deletes the matching dataset from the database.

- deleteAll()
Clears entire database

- all()
Returns all data in the database.

## Example
```javascript
const database = require('oxzof-db');
const db = database();
// const db = database("./oxzof-db/db.bson");

await db.set('potato','hello'); // Assign the value "hello" to the key "potato".
await db.get('potato'); // returns "hello"

await db.push('array','new element'); // Adds a new value named "new element" to the "array" list.
await db.unpush('array','new element'); // Deletes element(s) from the array.
//await db.unpush('array',['new element','another data']);

await db.all(); // Returns all data in the database.

await db.delete('key'); // Remove the object matching the "key" object in the data.
await db.deleteAll(); // clears entire database
```
