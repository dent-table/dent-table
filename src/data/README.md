# data_entry.js library specifications

## Introduction
The `data_entry.js` library contains all the operation related to the sqlite database. It creates the database (and its schema) if not found and exposes all the operation to interact with.
 
All the database related operation are sent to the database process by ipc messages with channel <i>database-op</i>.

All the messages sent on this channel must have two fields:
 - operation: the name of operation to perform (see Operations List)
 - parameters: the parameters required by the operation (see Operations List parameters)
 
The results are sent back into a channel named as the operation's name. If the operation is related to a specific table
(its name starts with 'table-' and must have a tableId parameter) the response channel name have '-' plus the tableId concatenated with an object that have the following fields:
 - result: operation' result (success or error)
 - response (only if result is success): the operation's return fields 
 - message (only if result is error): the error message
 
## Operations List
The <i>database-op</i> channel accepts the following operations:

| Operation name         | Description                               | Input parameters                                                                                                   | Return fields                                                                                                                                                                                                                                                                              |
|------------------------|-------------------------------------------|--------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `table-get-all`        | Get all the rows into a table             |  - tableId: the id of the table to fetch - limit?: number of row to fetch                                          | Array of the filelds taken from the table                                                                                                                                                                                                                                                  |
| `table-get-definition` | Get the definition of the specified table |  - tableId: the id of the table to define                                                                          |  { id: table's id, name: (schema) table's name, columns_def: table's columns definition as array of fowllowing objects (one for each column):    {       name: (schema) column's name,      type: column's type (string, number or date),      displayName: readable column's name     } } |
| `move-row`             | Move a row from a table to another        |  - fromTableId: source table id  - toTableId: target table id  - slotNumber: slot where the row to move is located | Same as `table-insert`                                                                                                                                                                                                                                                                     |
