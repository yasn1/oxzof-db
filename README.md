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

- unpushByIndex(key,index)
Removes the index element from the list

- delete(key)
Deletes the matching dataset from the database.

- deleteAll()
Clears entire database

- all()
Returns all data in the database.

## Examples
```javascript
const database = require('oxzof-db');

// const db = database(" FILE PATH ",{ OPTIONS });
const db = database(); // default path
/* 
const db = database("./oxzof-db/db.bson",{
    logMessages:true, // writes function errors to the console.
    autoUpdate:true // if update available: will be updated automatically when the project is restarted.
});
*/

await db.set('potato','hello'); // Assign the value "hello" to the key "potato".
await db.get('potato'); // returns "hello"

await db.push('array','new element'); // Adds a new value named "new element" to the "array" list.
//  await db.push('array',['new element','another data']); // Push list to list
await db.unpush('array','new element'); // Deletes element from the array.
//  await db.unpush('array',['new element','another data']); // Remove specific elements from the list.
await db.unpushByIndex("array",0) // Removes element 0 from the list "array".

await db.all(); // Returns all data in the database.

await db.delete('key'); // Remove the object matching the "key" object in the data.
await db.deleteAll(); // clears entire database
```

# Example Usages

## Import Module

```javascript
const database = require('oxzof-db');
const db = database(null,{ // default file path
    logMessages:true, // writes function errors to the console.
    autoUpdate:true // if update available: will be updated automatically when the project is restarted.
});
```


## Set & Get Functions
```javascript
(async()=>{
    const d = await db.get("dog","dogs flying")
    console.log(d) // returns: dogs flying
                   // returns false if there is an error
})()
```

```javascript
(async()=>{
    const d = await db.get("dog")
    console.log(d) // returns: dogs flying

    const a = await db.get("dogs")
    console.log(a) // returns: null
})()
```

## Push Function
```javascript
(async()=>{
    const d = await db.push("items",["money", "flashlight", "phone", "bag"])
    console.log(d) // returns: [ 'money', 'flashlight', 'phone', 'bag' ]
})()
```

## Unpush Function
```javascript
(async()=>{
    const d = await db.unpush("items",["money","phone"])
    console.log(d) // returns: [ 'flashlight', 'bag' ]
})()
```

## UnpushByIndex Function
```javascript
(async()=>{
    const d = await db.unpushByIndex("items",0)
    console.log(d) // returns: [ 'bag' ]
})()
```

## All Function
```javascript
(async()=>{
    const d = await db.all()
    console.log(d) // returns: [ { items: [ 'bag' ] }, { dog: 'dogs flying' } ]
})()
```

## Delete Function
```javascript
(async()=>{
    const d = await db.delete("items")
    console.log(d) // returns: true (Returns false if there is no key)
})()
```

## DeleteAll Function
```javascript
(async()=>{
    const d = await db.deleteAll()
    console.log(d) // returns: true
})()
```
