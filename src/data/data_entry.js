let winston = require('winston');
let remote = require('electron').remote;
let ipc = require('electron').ipcRenderer;
let path = require('path');
let fs = require('fs');
let Database = require('better-sqlite3');

const appPath = remote.app.getPath('userData');
const logPath = appPath + path.sep + 'logs';
const dbPath = appPath + path.sep + 'database.db';
const dbExists = fs.existsSync(dbPath);
let tableNames;

let logger = winston.createLogger({
  transports: [
    new winston.transports.Console({level: 'debug', format: winston.format.simple()}),
    new winston.transports.File({dirname: logPath, filename: 'data_entry.js.log'})
  ]
});

function createDatabase() {
  let createStatements = [
    db.prepare("CREATE TABLE to_do ( " +
      "id INTEGER PRIMARY KEY AUTOINCREMENT," +
      "name TEXT," +
      "type TEXT," +
      "date INTEGER" +
      ")"),
    db.prepare("CREATE TABLE to_deliver (" +
      "id INTEGER PRIMARY KEY AUTOINCREMENT," +
      "name TEXT," +
      "type TEXT," +
      "date INTEGER" +
      ")"),
    db.prepare("CREATE TABLE outgoing (" +
      "id INTEGER PRIMARY KEY AUTOINCREMENT," +
      "name TEXT," +
      "type TEXT," +
      "lab TEXT," +
      "date INTEGER" +
      ")"),
    db.prepare("CREATE TABLE chir (" +
      "id INTEGER PRIMARY KEY AUTOINCREMENT," +
      "name TEXT," +
      "type TEXT," +
      "lab TEXT," +
      "date INTEGER" +
      ")"),
    db.prepare("CREATE TABLE planning (" +
      "id INTEGER PRIMARY KEY AUTOINCREMENT," +
      "name TEXT," +
      "type TEXT," +
      "orto TEXT," +
      "date INTEGER" +
      ")"),
    db.prepare("CREATE TABLE table_ids (" +
      "id INTEGER PRIMARY KEY," +
      "name TEXT NOT NULL" +
      ")"),
    db.prepare("CREATE TABLE tables_slots (" +
      "slot_number INTEGER NOT NULL," +
      "table_id INTEGER NOT NULL," +
      "table_ref INTEGER DEFAULT NULL," +
      "PRIMARY KEY (slot_number, table_id)," +
      "FOREIGN KEY (table_id) REFERENCES table_ids (id)" +
      ")")
  ];

  let createTransaction = db.transaction(() => {
      logger.info('Executing create transaction');
      logger.info('Creating tables');
      for(const createStatement of createStatements) {
        createStatement.run();
      }
    }
  );
  createTransaction();

  let tableIdsInsertStatement = db.prepare("INSERT INTO table_ids(id, name) VALUES (1, 'to_do'), (2, 'to_deliver'), (3, 'outgoing'), (4, 'chir'), (5, 'planning')");

  let tablesSlotsPopulateStatement = db.prepare("INSERT INTO tables_slots(slot_number, table_id) values(?, ?)");


  let populateTransaction = db.transaction(() => {
    logger.info('Populating table_ids table');
    tableIdsInsertStatement.run();

    logger.info('Populating tables_slots table');
    for (let i = 1; i <= 5; i++) { // table ids
      for (let j = 1; j <= 50; j++) { //slot numbers
        tablesSlotsPopulateStatement.run(j, i);
      }
    }

    //TODO: remove this
    let queries = [db.prepare("insert into to_do(name, type, date) values ('Nome1', 'Tipo1', 123456), ('Nome2', 'Tipo2', 123456), ('Nome3', 'Tipo3', 123456), ('Nome4', 'Tipo4', 123456), ('Nome5', 'Tipo5', 123456)"),
      db.prepare("update tables_slots set table_ref = 1 where table_id = 1 and slot_number = 1"),
      db.prepare("update tables_slots set table_ref = 2 where table_id = 1 and slot_number = 2"),
      db.prepare("update tables_slots set table_ref = 3 where table_id = 1 and slot_number = 4"),
      db.prepare("update tables_slots set table_ref = 4 where table_id = 1 and slot_number = 6"),
      db.prepare("update tables_slots set table_ref = 5 where table_id = 1 and slot_number = 10"),
      db.prepare("update tables_slots set table_ref = null where table_id = 1 and slot_number = 10"),
      db.prepare("update tables_slots set table_ref = 5 where table_id = 1 and slot_number = 3")
    ];

    for(const query of queries) {
      query.run();
    }
  });
  populateTransaction();
}

function checkRequiredParameters(...params) {
  params.forEach((param) => {
    if(param === undefined) {
      throw Error('Required parameter missing. Check the documentation');
    }
  });

  return true;
}

function checkMutualParameters(...params) {
  let allUndefined = true;

  params.forEach((param) => {
    if(param !== undefined) {
      allUndefined = false;
    }
  });

  if(allUndefined) {
    throw Error('At least one of the OPTIONAL parameters required');
  } else {
    return true;
  }
}
/**
 * Return the table name from its id
 * @param tableId
 * @returns {{}|*} If tableId is defined, the table's name given its id, otherwise an object with id and name of all the
 * tables.
 */
function getTableName(tableId) {
  if(tableNames === undefined) {
    logger.info('tableNames property is undefined. Getting table names from database');
    tableNames = {};
    let stmt = db.prepare("SELECT * FROM table_ids");
    for (const table of stmt.iterate()) {
      tableNames[table.id] = table;
    }
  }

  if(tableId !== undefined) {
    return tableNames[tableId].name;
  } else {
    return tableNames;
  }
}

/**
 * Get all (or #limit) rows from the table specified by tableId ordered by date.<br>Each rows have the form defined by {@link getRowFromTable}.
 * @param tableId REQUIRED table's id
 * @param limit number of rows to return
 * @returns an array of rows
 */
function getAllFromTable({tableId, limit}) {
  checkRequiredParameters(tableId);
  logger.info('Getting rows from table with id ' + tableId + ' (limit ' + limit + ')');
  let tableName = getTableName(tableId);

  let queryString = "SELECT * FROM tables_slots ts LEFT JOIN " + tableName + " t ON ts.table_ref = t.id WHERE ts.table_id = ?";
  if(limit) {
    queryString = queryString + " LIMIT " + limit;
  }
  queryString = queryString + " ORDER BY t.date DESC";

  stmt = db.prepare(queryString);
  return stmt.all(tableId);
}

/**
 * Return a row from the table defined by tableId identified by slotNumber or refId.<br>
 *     The row have this form:<br>
 *     <pre>
 *         {
 *          slot_number: slot number from table tables_slots,
 *          table_id: id of the reference table,
 *          table_ref: id of the table's row in the reference table,
 *          [all the field from the reference table]
 *         }
 *     </pre>
 * @param tableId REQUIRED. The id of the reference table
 * @param slotNumber OPTIONAL the slot number to retrieve
 * @param refId OPTIONAL the id (in the reference table) of the row to retrieve
 * @returns {*} array with all the rows found into the table
 */
function getRowFromTable({tableId, slotNumber, refId}) {
  checkRequiredParameters(tableId);
  checkMutualParameters(slotNumber, refId);

  let tableName = getTableName(tableId);
  let queryString = "SELECT * FORM tables_slots ts LEFT JOIN " + tableName + " t ON ts.ref_id=t.id WHERE table_id=?";
  if(slotNumber !== undefined) {
    queryString = queryString + " AND slot_number=" + slotNumber;
  }
  if(refId !== undefined) {
    queryString = queryString + " AND ref_id=" + refId;
  }

  let stmt = db.prepare(queryString);

  return stmt.all();
}


function insertIntoTable({tableId, values}) {
  checkRequiredParameters(tableId, values);

  let tableName = getTableName(tableId);
  // let tableColumns = db.pragma('table_info(' + tableName + ')');
  // let columnNames = [];
  //
  // tableColumns.forEach((column) => {
  //     if (column.name !== 'id') {
  //       columnNames.push(column.name);
  //     }
  //   }
  // );

  let valueKeys = Object.keys(values);

  let queryString = "INSERT INTO " + tableName + "(" + valueKeys.toString() + ') VALUES (';

  for(const name of valueKeys) {
    queryString = queryString + '$' + name + ', ';
  }
  queryString = queryString.substr(0, queryString.length - 2) + ')';
  let stmt = db.prepare(queryString);
  let res = stmt.run(values);

  if(res.changes === 0) {
    throw Error('Insertion into ' + tableName + ' failed with no reason');
  }
  let newId = res.lastInsertRowid;

  queryString = "SELECT slot_number FROM tables_slots WHERE table_id=? AND table_ref is null ORDER BY slot_number";
  stmt = db.prepare(queryString);
  res = stmt.all(tableId);

  if(res.length === 0) {
    throw Error('All slots are full for table id ' + tableId);
  }

  console.log(res);

  const slotNumber = res[0].slot_number; //first empty slot number

  console.log(slotNumber);
  queryString = "UPDATE tables_slots SET table_ref=? WHERE table_id=? AND slot_number=?";
  stmt = db.prepare(queryString);

  res = stmt.run(newId, tableId, slotNumber);
  return res;
}

function deleteFromTable({tableId, slotNumber}) {
  checkRequiredParameters(tableId, slotNumber);

  let tableName = getTableName(tableId);
  let queryString = "SELECT table_ref FROM tables_slots WHERE table_id=? AND slot_number=?";
  let stmt = db.prepare(queryString);
  let result = stmt.get(tableId, slotNumber);

  if(result === undefined) {
    throw Error('Slot ' + slotNumber + ' not found for tableId ' + tableId);
  }

  let refId = result.table_ref;

  if(refId === null) {
    logger.log('debug', 'Slot ' + slotNumber + ' is already empty');
    return; //slot is already empty
  } else if(refId === undefined) {
    throw Error('Slot ' + slotNumber + ' not found for tableId ' + tableId);
  }

  queryString = "UPDATE tables_slots SET table_ref=null WHERE table_id=? AND slot_number=?";
  stmt = db.prepare(queryString);
  result = stmt.run(tableId, slotNumber);

  console.log(result);

  if (result.changes === 0) {
    throw Error('Slot ' + slotNumber + ' not found for tableId ' + tableId);
  }

  queryString = "DELETE FROM " + tableName + " WHERE id=?";
  stmt = db.prepare(queryString);
  result = stmt.run(refId);

  return result;
}

function updateRow({tableId, rowId, column_name, value}) {
  checkRequiredParameters(tableId, rowId, column_name, value);

  let tableName = getTableName(tableId);

  let queryString = "UPDATE " + tableName + " SET " + column_name + "=? WHERE id=?";
  // let queryString = "UPDATE ? SET ?=? WHERE id=?";
  let stmt = db.prepare(queryString);
  return stmt.run(value, rowId);
}

if (!dbExists) {
  logger.info('Database creation');
  logger.info('Creating database.db');
  fs.openSync(dbPath, "w");
}

let db = new Database(dbPath, {verbose: logger.verbose});

if (!dbExists) {
  logger.info('Creating tables');
  createDatabase();
}

let getAllFromTableTransaction = db.transaction((params) => {
  return getAllFromTable(params);
});

ipc.on('database-op', (event, values) => {
  let senderId = event.senderId;
  if(values.operation === undefined) {
    event.sender.sendTo(senderId, 'database-op-res', {result: 'error', message:'no operation defined'});
  }
  let parameters = values.parameters;

  console.log(senderId, values);
  let result;
  try {
    switch (values.operation) {
      case 'table-get-all':
        result = getAllFromTableTransaction(parameters); break;
    }

    console.log(result);
    event.sender.sendTo(senderId, values.operation, {result: 'success', response: result})
  } catch (e) {
    event.sender.sendTo(senderId, values.operation, {result: 'error', message: e.message})
  }
});
