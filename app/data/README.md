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


## Questionnaires
Questionnaires are saved into three tables:
- `table_questionnaires` contains information about which questionnaires belongs to a table (a foreign reference to a `questionnaire`).
- `questionnaire` contain lists of questions: questions are organized in sections, each section have a list of questions. Questions are object with a key (id), these ids are unique across the entire section. These ids are the references for the `answers`. This table has another field, `validations` that lists the ids of whom have to sign the questionnaire. Each section contains the information about whom have to sign that section.
- `answers` contains the answers about a questionnaire. Each answer refers to a table slot of a table id.

Example:

```json5
 // table_questionnaires
{
  "table_id": 3,
  "questions_ref": 1
}
```

```json5
// Questionnaire
{
  "id": 1,
  "name": "Checklist Prechirurgica",
  "sections": {
    // questions are organized into sections
    "A": {
      "section_name": "Checklist pretrattamento",
      "validated_by": 1,
      // refers to the validations field
      "questions": [
        // questions are saved as an array of questions, each question must have an key field (unique within the section)
        {
          "key": 1,
          "text": "Gli esami radio...",
          "type": "boolean",
          "required": true,
          "position": 1 // position in the section
          // other information about the question 
          // (for example, a list of possible answers) goes here 
        },
        {
          "key": 2,
          "text": "Pianificato....",
          "type": "boolean",
          "required": true,
          "position": 1
        }
      ]
    },
    "B": {
      "section_name": "Checklist materiali",
      "validated_by": 2, // Segreteria
      "questions": [
        {
          "key": 1,
          "text": "Tutti i monouso sterili presenti?",
          "type": "boolean",
          "required": true,
          "position": 1
        },
      ]
    }
  },
  "validations": {
    "1": "ASO",
    "2": "Segreteria"
  }
}
```
```json5
// Answers (referred to a table slot)
// Each table slot can have multiple answers
{
  "name":"fefe",
  "questionnaire_ref":1,
  "table_id":3,
  "slot_number":1,
  "date":"2021-05-14T12:10:30.219+02:00",
  "note":"...",
  "sections":{
    "A":{
      "1":true,
      "2":true,
      "3":""
    },
    "B": {
      "3": true
    },
  },
  "validations": { // referred to validation_users table
    "1": 1234, // ASO
    "2": 2345  // Segreteria
  }
}
 ```

A new questionnaires can be added to the database with a `questionnaires.json` file palced into `%APPPATH%/data` folder.
This file contains a json list of questionnaire objects, like the one in the example above. There is only one main difference: **the questionnaire object must contain an additional root level field `table_ids`**. This field contains the table id (or the table ids list) of the tables the questionnaire refers to.
<br>
If the object contains the id field, and its value refers to an existing questionnaire into the database, so the object will replace the existing object.   
