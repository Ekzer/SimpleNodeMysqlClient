# Global





* * *

## Class: SimpleNodeMysqlClient
You can pass a filename or directly an object containing the informations.
It is simply an overload of the official node-mysql.

### SimpleNodeMysqlClient.end(options, callback) 

Closes mysql connexion

**Parameters**

**options**: `Object | Null`, optional

**callback**: `function | Null`, optional


### SimpleNodeMysqlClient.getMysqlInstance() 

Returns mysql's instance.

**Returns**: `Connection`

### SimpleNodeMysqlClient.getDbHost() 

Returns mysql's hostname

**Returns**: `string | string`

### SimpleNodeMysqlClient.getDbUser() 

Returns mysql's user

**Returns**: `string | string`

### SimpleNodeMysqlClient.getDbPassword() 

Returns mysql's password

**Returns**: `string | string | boolean | * | string`

### SimpleNodeMysqlClient.getDbName() 

Returns database's name

**Returns**: `* | string | string`

### SimpleNodeMysqlClient.isSingleQuery(str) 

Check if it is a single query.

**Parameters**

**str**: , Check if it is a single query.

**Returns**: `boolean`

**Example**:
```js
"SELECT * FROM `user` WHERE `id` = 49;" -> {true}
"SELECT * FROM `user` WHERE `id` = 49; SELECT `description` FROM `articles` WHERE `author` = foo;" -> {false}
```

### SimpleNodeMysqlClient.query(queryObject, process, callback) 

Execute mysql query recursively. It can take an array of queries or simply a queryObject. As you want !
You need to pass a queryObject.
It uses async to execute synchronously queries.

**Parameters**

**queryObject**: `Array | Object`

**process**: `Object | Null`

**callback**: `function`

**Returns**: `RowDataPacket`

**Example**:
```js
var queryObject = {query : "SELECT * FROM `account` WHERE `id` = ?", parameters : [id]};
```



* * *










