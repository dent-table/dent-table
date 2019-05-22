let winston = require('winston');
let remote = require('electron').remote;
let ipc = require('electron').ipcRenderer;
let path = require('path');
let fs = require('fs');
let Database = require('better-sqlite3');
let crypto = require('crypto');

const appPath = remote.app.getPath('userData');
const logPath = appPath + path.sep + 'logs';
const dbPath = appPath + path.sep + 'data' + path.sep + 'database.db';
const dbExists = fs.existsSync(dbPath);
let tableNames;

const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'DD-MM-YYYY HH:mm:ss'
  }),
  winston.format.simple()
);

let logger = winston.createLogger({
  transports: [
    new winston.transports.Console({level: 'debug'}),
    new winston.transports.File({dirname: logPath, filename: 'data_entry.js.log'})
  ],
  format: logFormat
});

logger.info('Database initialization...');

const algorithm = 'aes-192-cbc';
const password = '3b41iTniwy';

function encrypt(msg) {
// Use the async `crypto.scrypt()` instead.
  const key = crypto.scryptSync(password, 'salt', 24);

  const iv = Buffer.alloc(16, 18);

// shown here.
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  let encrypted = cipher.update(msg, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

function createDatabase() {
  let createStatements = [
    db.prepare("CREATE TABLE to_do ( " +
      "id INTEGER PRIMARY KEY AUTOINCREMENT," +
      "name TEXT," +
      "type TEXT," +
      "note TEXT," +
      "date INTEGER NOT NULL DEFAULT 0," +
      "text_color TEXT" +
      ")"),
    db.prepare("CREATE TABLE to_deliver (" +
      "id INTEGER PRIMARY KEY AUTOINCREMENT," +
      "name TEXT," +
      "type TEXT," +
      "note TEXT," +
      "date INTEGER NOT NULL DEFAULT 0," +
      "verified INTEGER(1) DEFAULT 0," +
      "text_color TEXT" +
      ")"),
    db.prepare("CREATE TABLE outgoing (" +
      "id INTEGER PRIMARY KEY AUTOINCREMENT," +
      "name TEXT," +
      "note TEXT," +
      "lab TEXT," +
      "date INTEGER NOT NULL DEFAULT 0," +
      "date_out INTEGER DEFAULT 0," +
      "text_color TEXT" +
      ")"),
    db.prepare("CREATE TABLE plan_chir (" +
      "id INTEGER PRIMARY KEY AUTOINCREMENT," +
      "name TEXT," +
      "type TEXT," +
      "note TEXT," +
      "date INTEGER NOT NULL DEFAULT 0," +
      "text_color TEXT" +
      ")"),
    db.prepare("CREATE TABLE plan_orto (" +
      "id INTEGER PRIMARY KEY AUTOINCREMENT," +
      "name TEXT," +
      "type TEXT," +
      "note TEXT," +
      "date INTEGER NOT NULL DEFAULT 0," +
      "text_color TEXT" +
      ")"),
    db.prepare("CREATE TABLE tables_definition (" +
      "id INTEGER PRIMARY KEY," +
      "name TEXT NOT NULL," +
      "columns_def TEXT NOT NULL" +
      ")"),
    db.prepare("CREATE TABLE tables_slots (" +
      "slot_number INTEGER NOT NULL," +
      "table_id INTEGER NOT NULL," +
      "table_ref INTEGER DEFAULT NULL," +
      "PRIMARY KEY (slot_number, table_id)," +
      "FOREIGN KEY (table_id) REFERENCES tables_definition (id)" +
      ")"),
    db.prepare("CREATE TABLE users (" +
      "id INTEGER PRIMARY KEY AUTOINCREMENT," +
      "username TEXT NOT NULL UNIQUE," +
      "password TEXT NOT NULL" +
      ")"),
  ];

  let createTransaction = db.transaction(() => {
      logger.info('Executing create transaction...');
      logger.info('Creating tables...');
      for (const createStatement of createStatements) {
        createStatement.run();
      }
    }
  );
  createTransaction();

  const material_colors = [
    {name: 'red', value: '#e53935'},
    {name: 'pink', value: '#d81b60'},
    {name: 'purple', value: '#8e24aa'},
    {name: 'deep_purple', value: '#5e35b1'},
    {name: 'indigo', value: '#3949ab'},
    {name: 'blue', value: '#1e88e5'},
    {name: 'cyan', value: '#00acc1'},
    {name: 'teal', value: '#00897b'},
    {name: 'green', value: '#43a047'},
    {name: 'yellow', value: '#fdd835'},
    {name: 'orange', value: '#fb8c00'},
    {name: 'deep_orange', value: '#f4511e'}
  ];

  let tables_definition = [
    {}, //table index starts form 1

    [ //to_do
      {name: 'name', type: 'string', required: true, displayed: true},
      {name: 'type', type: 'string', required: false, displayed: true},
      {name: 'note', type: 'text', required: false, displayed: true},
      {name: 'date', type: 'date', required: true, displayed: true},
      {name: 'text_color', type: {type: 'select', options: material_colors}, required: false, displayed: false}
    ],
    [ //to_deliver
      {name: 'name', type: 'string', required: true, displayed: true},
      {name: 'type', type: 'string', required: false, displayed: true},
      {name: 'note', type: 'text', required: false, displayed: true},
      {name: 'date', type: 'date', required: true, displayed: true},
      {name: 'verified', type: 'boolean', required: false, displayed: true},
      {name: 'text_color', type: {type: 'select', options: material_colors}, required: false, displayed: false}
    ],
    [ //outgoing
      {name: 'name', type: 'string', required: true, displayed: true},
      {name: 'note', type: 'text', required: false, displayed: true},
      {name: 'lab', type: 'string', required: false, displayed: true},
      {name: 'date', type: 'date', required: true, displayed: true},
      {name: 'date_out', type: 'date', required: false, displayed: true},
      {name: 'text_color', type: {type: 'select', options: material_colors}, required: false, displayed: false}
    ], //plan_chir
    [
      {name: 'name', type: 'string', required: true, displayed: true},
      {name: 'type', type: 'string', required: false, displayed: true},
      {name: 'note', type: 'text', required: false, displayed: true},
      {name: 'date', type: 'date', required: true, displayed: true},
      {name: 'text_color', type: {type: 'select', options: material_colors}, required: false, displayed: false}
    ],
    [ //plan_orto
      {name: 'name', type: 'string', required: true, displayed: true},
      {name: 'type', type: 'string', required: false, displayed: true},
      {name: 'note', type: 'text', required: false, displayed: true},
      {name: 'date', type: 'date', required: true, displayed: true},
      {name: 'text_color', type: {type: 'select', options: material_colors}, required: false, displayed: false}
    ]
  ];

  let tableIdsInsertStatement = db.prepare("INSERT INTO tables_definition" +
    " VALUES (1, 'to_do', '" + JSON.stringify(tables_definition[1]) + "'), " +
    " (2, 'to_deliver', '" + JSON.stringify(tables_definition[2]) + "'), " +
    " (3, 'outgoing', '" + JSON.stringify(tables_definition[3]) + "'), " +
    " (4, 'plan_chir', '" + JSON.stringify(tables_definition[4]) + "'), " +
    " (5, 'plan_orto', '" + JSON.stringify(tables_definition[5]) + "')"
  );

  let tablesSlotsPopulateStatement = db.prepare("INSERT INTO tables_slots(slot_number, table_id) values(?, ?)");

  let defaultUserInsertStatement = db.prepare("INSERT INTO users(username, password) VALUES (?,?)");
  let populateTransaction = db.transaction(() => {
    logger.info('Populating tables_definition table...');
    tableIdsInsertStatement.run();

    logger.info('Populating tables_slots table...');
    for (let i = 1; i <= 5; i++) { // table ids
      for (let j = 1; j <= 50; j++) { //slot numbers
        tablesSlotsPopulateStatement.run(j, i);
      }
    }

    logger.info('Creating user...');
    defaultUserInsertStatement.run('carbone', '9f409e3a8ffdadf787dc034b83bddda3');

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

    for (const query of queries) {
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

function insertUserOrUpdate(user, password) {
  checkRequiredParameters(user, password);

  let query = "SELECT * FROM users WHERE username=?";
  let stmt = db.prepare(query);
  let result = stmt.get(user);

  const cryptoPass = encrypt(password);

  if (result) {
    query = "UPDATE users SET password=? WHERE id=?";
    stmt = db.prepare(query);
    result = stmt.run(cryptoPass, result.id);
  } else {
    query = "INSERT INTO users (username, password) VALUES (?, ?)";
    stmt = db.prepare(query);
    result = stmt.run(user, cryptoPass);
  }

  return result;
}

function login(user, cryptoPass) {
  let query = "SELECT * FROM users WHERE username=?";
  let stmt = db.prepare(query);
  let result = stmt.get(user);

  if(!result) return 404;

  if(cryptoPass === result.password) {
    return 200;
  } else {
    return 401;
  }
}

/**
 * Return the table's name and its columns definition from given id
 * @param tableId
 * @returns {{}|*} If tableId is defined, the table's info given its id, otherwise an object with id infos of all the
 * tables.
 */
function getTableDefinition(tableId) {
  logger.debug('Requested definition of table ' + tableId);
  if(tableNames === undefined) {
    logger.info('tableNames property is undefined. Getting table names from database');
    tableNames = {};
    let stmt = db.prepare("SELECT * FROM tables_definition");
    for (const table of stmt.iterate()) {
      tableNames[table.id] = table;
    }
  }

  if(tableId !== undefined) {
    return tableNames[tableId];
  } else {
    return tableNames;
  }
}

function getAvailableSlots(tableId) {
  let toReturn = [];

  let queryString = "SELECT slot_number FROM tables_slots WHERE table_id=? AND table_ref is null ORDER BY slot_number";
  let stmt = db.prepare(queryString);
  let result = stmt.all(tableId);

  for(const slotObject of result) {
    toReturn.push(slotObject.slot_number);
  }

  return toReturn;
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
  let tableName = getTableDefinition(tableId).name;

  let queryString = "SELECT * FROM tables_slots ts LEFT JOIN " + tableName + " t ON ts.table_ref = t.id WHERE ts.table_id = ?";
  queryString = queryString + " ORDER BY t.date IS NULL, t.date ASC";
  if(limit) {
    queryString = queryString + " LIMIT " + limit;
  }

  let stmt = db.prepare(queryString);
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

  let tableName = getTableDefinition(tableId).name;
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

/**
 * Insert a row into the specified table, and insert the new created row into the first empty slot (referred to passed tableId)
 * of the tables_slots table
 * @param tableId identifier (from tablesId table) of the table into insert new row.
 * @param values values to add into table. If for some target table's fields values are missing into values that fields
 * are set to null.
 * @param slot_number optional slot number where insert the row
 * @returns {{newId: *, changes: *, slotNumber: *, tableId: *}} <ul>
 *     <li>changes: number of row inserted into target table (must always be 1)</li>
 *     <li>tableId: id of the target table</li>
 *     <li>id: The id of new row inserted into target table</li>
 *     <li>slotNumber: the slot number of <i>slots_numbers</i> table where the new row was inserted
 *  </ul>
 */
function insertIntoTable({tableId, values, slot_number}) {
  checkRequiredParameters(tableId, values);

  let tableName = getTableDefinition(tableId).name;
  let tableColumns = db.pragma('table_info(' + tableName + ')');
  let columnNames = [];
  let slotNumber;

  if(values['slot_number']) {
    slotNumber = values['slot_number'];
    delete values['slot_number'];
  } else if(slot_number) {
    slotNumber = slot_number;
  }

  tableColumns.forEach((column) => {
      if (column.name !== 'id') {
        columnNames.push(column.name);
      }
    }
  );

  // let valueKeys = Object.keys(values);

  //Insert row into table
  console.log(Object.keys(values), columnNames);
  let queryString = "INSERT INTO " + tableName + "(" + columnNames.toString() + ') VALUES (';

  for(const name of columnNames) {
    if(values[name] === undefined) { //given values not contains that column
      values[name] = null //so set that column value to null
    }

    queryString = queryString + '$' + name + ', ';
  }

  console.log(queryString, values);


  queryString = queryString.substr(0, queryString.length - 2) + ')';
  let stmt = db.prepare(queryString);
  let res = stmt.run(values);

  if(res.changes === 0) {
    throw Error('Insertion into ' + tableName + ' failed with no reason');
  }
  let newId = res.lastInsertRowid;

  //Select slot number
  let availableSlots = getAvailableSlots(tableId);
  if(!slotNumber || slotNumber === '') {
    if (availableSlots.length === 0) {
      throw Error('All slots are full for table id ' + tableId);
    }
    slotNumber = availableSlots[0]; //first empty slot number
  } else {
    if(!availableSlots.includes(slotNumber)) {
      throw Error(`${slotNumber} is not available`);
    }
  }

  //Insert row into slot
  queryString = "UPDATE tables_slots SET table_ref=? WHERE table_id=? AND slot_number=?";
  stmt = db.prepare(queryString);

  res = stmt.run(newId, tableId, slotNumber);
  return {changes: res.changes, newId: newId, tableId: tableId, slotNumber: slotNumber};
}

/**
 * Frees the given slot number (related to the given table id) and delete the referenced row into the target table
 * @param tableId target table id of the row
 * @param slotNumber slot number of <i>tables_slots</i> table to free
 * @returns {*} the deleted row's field (ONLY taken form the target table, so without field referred to <i>tables_slots</i> table)
 */
function deleteFromTable({tableId, slotNumber}) {
  checkRequiredParameters(tableId, slotNumber);

  let tableName = getTableDefinition(tableId).name;
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

  queryString = "SELECT * FROM " + tableName + " WHERE id=?";
  stmt = db.prepare(queryString);
  let deletedValues = stmt.get(refId);

  queryString = "UPDATE tables_slots SET table_ref=null WHERE table_id=? AND slot_number=?";
  stmt = db.prepare(queryString);
  result = stmt.run(tableId, slotNumber);


  if (result.changes === 0) {
    throw Error('Slot ' + slotNumber + ' not found for tableId ' + tableId);
  }

  queryString = "DELETE FROM " + tableName + " WHERE id=?";
  stmt = db.prepare(queryString);
  result = stmt.run(refId);

  return deletedValues;
}

function updateRow({tableId, rowId, values}) {
  checkRequiredParameters(tableId, rowId, values);
  let tableName = getTableDefinition(tableId).name;
  let queryString;
  let stmt;
  let result;

  let changes = 0;

  if(values['slot_number']) {
    //check if values['slot_number'] is empty
    queryString = "SELECT table_ref FROM tables_slots WHERE table_id=? AND slot_number=?";
    stmt = db.prepare(queryString);
    result = stmt.get(tableId, values['slot_number']);
    if(result.table_ref !== null) {
      throw Error('Selected slot already contains a row');
    }
    console.log('1', result);

    //frees current table slot
    queryString = "UPDATE tables_slots SET table_ref=null WHERE table_id=? AND table_ref=?";
    stmt = db.prepare(queryString);
    result = stmt.run(tableId, rowId);
    if(result.changes === 0) {
      throw Error('No slot found in table ' + tableId + ' that contains row with id ' + rowId);
    }
    console.log('2', result);

    //setting new table_slot
    queryString = "UPDATE tables_slots SET table_ref=? WHERE table_id=? AND slot_number=?";
    stmt = db.prepare(queryString);
    result = stmt.run(rowId, tableId, values['slot_number']);
    changes = result.changes;
    console.log('3', result);

    if(result.changes === 0) {
      throw Error(`Row insertion in slot ${values['slot_number']} failed`);
    }

    delete values['slot_number'];
  }
  const columns = Object.keys(values);

  if(columns.length === 0) { //No columns to update. Maybe updated only slot_number
    return {changes: changes};
  }

  queryString = "UPDATE " + tableName + " SET";

  for (const column of columns) {
    queryString = queryString + ` ${column}=$${column},`;
  }

  queryString = queryString.substr(0, queryString.length - 1) + ' WHERE id=?';
  console.log('4', queryString);

  stmt = db.prepare(queryString);
  result = stmt.run(values, rowId);
  console.log('5', result);
  return {changes: result.changes + changes};
}

/**
 * Delete a row form the given <i>fromTableId</i> and slot number and insert the deleted values into the given <i>toTableId</i>
 * @see deleteFromTable
 * @see insertIntoTable
 * @param fromTableId
 * @param slotNumber
 * @param toTableId
 * @returns {{newId: *, changes: *, slotNumber: *, tableId: *}} the same values returned by insertIntoTable function
 */
function moveRow({fromTableId, slotNumber, toTableId}) {
  checkRequiredParameters(fromTableId, slotNumber, toTableId);

  let deletedValues = deleteFromTable({tableId: fromTableId, slotNumber: slotNumber});
  return insertIntoTable({tableId: toTableId, values: deletedValues})
}

if (!dbExists) {
  logger.info('Database creation');
  logger.info('Creating database.db');
  fs.openSync(dbPath, "w");
}

logger.info('Starting database');

let db = new Database(dbPath, {verbose: logger.info});

logger.info('Database started successfully');

if (!dbExists) {
  logger.info('Creating tables');
  createDatabase();
}

let getAllFromTableTransaction = db.transaction((params) => {
  return getAllFromTable(params);
});

let moveRowTransaction = db.transaction((params) => {
  return moveRow(params);
});

let insertRowTransaction = db.transaction((params) => {
  return insertIntoTable(params);
});

let deleteRowTransaction = db.transaction((params) => {
  return deleteFromTable(params);
});

let updateRowTransaction = db.transaction((params) => {
  return updateRow(params);
});

logger.info('Setting ipc events callback');

/** see README.md **/
ipc.on('database-op', (event, values) => {
  console.log(values);
  let senderId = event.senderId;
  if(values.operation === undefined) {
    event.sender.sendTo(senderId, 'database-op-res', {result: 'error', message:'no operation defined'});
  }
  let parameters = values.parameters;
  let returnChannel = values.operation;
  if(parameters.tableId) {
    returnChannel = returnChannel + '-' + parameters.tableId;
  }

  console.log(senderId, values);
  let result;
  try {
    switch (values.operation) {
      case 'login':
        result = login(parameters.username, parameters.password); break;
      case 'table-get-available-slots':
        result = getAvailableSlots(parameters.tableId); break;
      case 'table-get-all':
        result = getAllFromTable(parameters); break;
      case 'table-get-definition':
        result = getTableDefinition(parameters.tableId); break;
      case 'table-insert-row':
        result = insertRowTransaction(parameters); break;
      case 'table-delete-row':
        result = deleteRowTransaction(parameters); break;
      case 'table-update-row':
        result = updateRowTransaction(parameters); break;
      case 'move-row': {
        result = moveRowTransaction(parameters);
        if (result.changes === 1) {
          result = parameters; //returns fromTableId and toTableId
        }
        break;
      }
    }

    console.log(result);

    //Result sent on two channel, the second permits to filter on table id
    event.sender.sendTo(senderId, values.operation, {result: 'success', response: result});
    event.sender.sendTo(senderId, returnChannel, {result: 'success', response: result});
  } catch (e) {
    event.sender.sendTo(senderId, returnChannel, {result: 'error', message: e.message})
  }
});

remote.getCurrentWindow().on('close', (event) => {
  logger.info('Closing database...');
  db.close();
});
logger.info('Database initialization completed');

// db.close();
// console.log(crypto.getCiphers());
