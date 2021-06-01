let winston = require('winston');
let remote = require('@electron/remote');
let ipc = require('electron').ipcRenderer;
let path = require('path');
let fs = require('fs');
let Database = require('better-sqlite3');
let crypto = require('crypto');
let _ = require('lodash');
let format = require('date-fns/format');
let formatISO = require('date-fns/formatISO')

const env = process.env.NODE_ENV || 'development';

const appPath = remote.app.getPath('userData');
const logPath = appPath + path.sep + 'logs';
const dbPath = appPath + path.sep + 'data' + path.sep + 'database.db';
const dbExists = fs.existsSync(dbPath);

// Note: all special cases should always start from 9000
const specialCases = {
  'CEREC': {
    tables: [1],
    bounds: [9000, 9099]
  }
};

const specialCasesKeys = _.keys(specialCases);

let tableNames;

// **NOTE**: this code has a mirror in LoggerService, keep both synced!
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'HH:mm:ss'
  }),
  winston.format.printf((info => {
    const message = info.label ? `${info.label} | ${info.message}` : info.message;
    // TODO: pad level string to a specific length?
    return `[${info.level}] ${info.timestamp}: ${message}`;
  }))
);

// **NOTE**: this code has a mirror in LoggerService, keep both synced!
let logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      level: 'debug',
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat)
    }),
    new winston.transports.File({
      dirname: logPath,
      filename: `data_${format(new Date(), 'yyyy-MM-dd')}.log`,
      format: logFormat
    })
  ],
});

/** Create the log object required by winston loggers <br>
 * **NOTE**: this function has a mirror in LoggerService, keep both synced!
 * @param label (will be prefixed to the message)
 * @param messages messages to log, all data (except strings) will be parsed and stringified
 * @returns {object} the object to pass to winston logger methods
 */
function logObject(label, ...messages) {
  const stringified = messages.map((message) => {
    if (typeof message === 'string') {
      return message;
    } else {
      return JSON.stringify(message);
    }
  });

  return {label: label, message: stringified.join(' ')};
}

logger.debug(logObject('main', env));

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

logger.info(logObject('main', 'Database initialization...'));

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
    db.prepare("CREATE TABLE questionnaire (" +
      "id INTEGER PRIMARY KEY AUTOINCREMENT," +
      "name TEXT NOT NULL," +
      "sections TEXT NOT NULL," +
      "validations TEXT NOT NULL" +
      ")"),
    db.prepare("CREATE TABLE table_questionnaires (" +
      "table_id INTEGER NOT NULL," +
      "questionnaire_ref INTEGER NOT NULL," +
      "PRIMARY KEY (table_id, questionnaire_ref)," +
      "FOREIGN KEY (table_id) REFERENCES tables_definition (id)," +
      "FOREIGN KEY (questionnaire_ref) REFERENCES questionnaire (id)" +
      ")"),
    db.prepare("CREATE TABLE questionnaire_answers (" +
      "id INTEGER PRIMARY KEY AUTOINCREMENT," +
      "table_id INTEGER NOT NULL," +
      "questionnaire_ref INTEGER NOT NULL," +
      "slot_number INTEGER NOT NULL," +
      "name TEXT," +
      "date TEXT NOT NULL," +
      "answers TEXT," +
      "note TEXT," +
      "validations TEXT," +
      "FOREIGN KEY (table_id) REFERENCES tables_definition (id)," +
      "FOREIGN KEY (questionnaire_ref) REFERENCES questionnaire (id)" +
      ")"),
    db.prepare("CREATE TABLE dbversion (" +
      "version INTEGER PRIMARY KEY" +
      ")"),
  ];

  let createTransaction = db.transaction(() => {
      logger.info(logObject('createDatabase/createTransaction', 'Executing create transaction...'));
      logger.info(logObject('createDatabase/createTransaction', 'Creating tables...'));
      for (const createStatement of createStatements) {
        createStatement.run();
      }
    }
  );
  createTransaction();

  let tables_definition = [
    {}, //table index starts form 1

    [ //to_do
      {name: 'name', type: {name: 'string', special: false}, required: true, displayed: true},
      {name: 'type', type: {name: 'string', special: false}, required: false, displayed: true},
      {name: 'note', type: {name: 'text', special: false}, required: false, displayed: true},
      {name: 'date', type: {name: 'date', special: false}, required: true, displayed: true},
      {name: 'verified', type: {name: 'boolean', special: false}, required: false, displayed: true},
      {name: 'text_color', type: {name: 'select', special: false, options: material_colors}, required: false, displayed: false}
    ],
    [ //to_deliver
      {name: 'name', type: {name: 'string', special: false}, required: true, displayed: true},
      {name: 'type', type: {name: 'string', special: false}, required: false, displayed: true},
      {name: 'note', type: {name: 'text', special: false}, required: false, displayed: true},
      {name: 'date', type: {name: 'date', special: false}, required: true, displayed: true},
      {name: 'verified', type: {name: 'boolean', special: false}, required: false, displayed: true},
      {name: 'text_color', type: {name: 'select', special: false, options: material_colors}, required: false, displayed: false}
    ],
    [ //outgoing
      {name: 'name', type: {name: 'string', special: false}, required: true, displayed: true},
      {name: 'note', type: {name: 'text', special: false}, required: false, displayed: true},
      {name: 'lab', type: {name: 'string', special: false}, required: false, displayed: true},
      {name: 'date', type: {name: 'date', special: false}, required: true, displayed: true},
      {name: 'date_out', type: {name: 'date', special: false}, required: false, displayed: true, map: {all: {to: 'date'}}},
      {name: 'text_color', type: {name: 'select', special: false, options: material_colors}, required: false, displayed: false}
    ], //plan_chir
    [
      {name: 'name', type: {name: 'string', special: false}, required: true, displayed: true},
      {name: 'type', type: {name: 'string', special: false}, required: false, displayed: true},
      {name: 'note', type: {name: 'text', special: false}, required: false, displayed: true},
      {name: 'date', type: {name: 'date', special: false}, required: true, displayed: true},
      {name: 'text_color', type: {name: 'select', special: false, options: material_colors}, required: false, displayed: false}
    ],
    [ //plan_orto
      {name: 'name', type: {name: 'string', special: false}, required: true, displayed: true},
      {name: 'type', type: {name: 'string', special: false}, required: false, displayed: true},
      {name: 'note', type: {name: 'text', special: false}, required: false, displayed: true},
      {name: 'date', type: {name: 'date', special: false}, required: true, displayed: true},
      {name: 'text_color', type: {name: 'select', special: false, options: material_colors}, required: false, displayed: false}
    ]
  ];


  logger.info(logObject('createDatabase', 'Populating tables_definition table...'));
  let tableIdsInsertStatement = db.prepare("INSERT INTO tables_definition" +
    " VALUES (1, 'to_do', '" + JSON.stringify(tables_definition[1]) + "'), " +
    " (2, 'to_deliver', '" + JSON.stringify(tables_definition[2]) + "'), " +
    " (3, 'outgoing', '" + JSON.stringify(tables_definition[3]) + "'), " +
    " (4, 'plan_chir', '" + JSON.stringify(tables_definition[4]) + "'), " +
    " (5, 'plan_orto', '" + JSON.stringify(tables_definition[5]) + "')"
  );


  let populateTransaction = db.transaction(() => {
    tableIdsInsertStatement.run();

    logger.info(logObject('createDatabase', 'Populating tables_slots table...'));
    let tablesSlotsPopulateStatement = db.prepare("INSERT INTO tables_slots(slot_number, table_id) values(?, ?)");
    for (let i = 1; i <= 5; i++) { // table ids
      for (let j = 1; j <= 100; j++) { //slot numbers
        tablesSlotsPopulateStatement.run(j, i);
      }
    }

    logger.info(logObject('createDatabase', 'Creating user...'));
    let defaultUserInsertStatement = db.prepare("INSERT INTO users(username, password) VALUES (?,?)");
    defaultUserInsertStatement.run('carbone', '9f409e3a8ffdadf787dc034b83bddda3');

    logger.info(logObject('createDatabase', "Populating dbversion..."));
    // TODO: update this value according the current db version
    let dbVersionStatement = db.prepare("INSERT INTO dbversion(version) VALUES(4)");
    dbVersionStatement.run();

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

function updateDatabase() {
  let v2 = db.transaction(() => {
    logger.info(logObject('updateDatabase/v2', "Adding new column 'verified' to table to_do..."));

    let queryString = "ALTER TABLE to_do ADD COLUMN verified INTEGER(1) DEFAULT 0";
    let stmt = db.prepare(queryString);
    let result = stmt.run();
    // if (result.changes !== 1) { // CREATE and ALTER TABLE returns result.changes = 0
    //   throw Error("Error on alter table");
    // }
    logger.info(logObject('updateDatabase/v2', "Success!"));

    logger.info(logObject('updateDatabase/v2',"Updating table to_do definition..."));
    let definition = [ //to_do
      {name: 'name', type: {name: 'string', special: false}, required: true, displayed: true},
      {name: 'type', type: {name: 'string', special: false}, required: false, displayed: true},
      {name: 'note', type: {name: 'text', special: false}, required: false, displayed: true},
      {name: 'date', type: {name: 'date', special: false}, required: true, displayed: true},
      {name: 'verified', type: {name: 'boolean', special: false}, required: false, displayed: true},
      {name: 'text_color', type: {name: 'select', special: false, options: material_colors}, required: false, displayed: false}
    ];
    queryString = "UPDATE tables_definition SET columns_def=? WHERE id=1"; // to_do table id = 1
    stmt = db.prepare(queryString);
    result = stmt.run(JSON.stringify(definition));
    if (result.changes !== 1) {
      throw Error("Error on update table");
    }
    logger.info(logObject('updateDatabase/v2', "Success!"));

    logger.info(logObject('updateDatabase/v2', "Updating dbversion..."));
    queryString = "UPDATE dbversion SET version=2 WHERE version=1";
    stmt = db.prepare(queryString);
    result = stmt.run();

    logger.info(logObject('updateDatabase/v2', "Success!"));
  });

  let v3 = db.transaction(() => {
    logger.info(logObject('updateDatabase/v3', "Updating table 'tables_definition' to use object (instead of string) for type field..."));
    let queryString = "SELECT * FROM tables_definition";
    let stmt = db.prepare(queryString);
    let tables = stmt.all();
    let result;

    let updates = [];

    for (let table of tables) {
      let columns = table.columns_def;
      columns = JSON.parse(columns);

      logger.info(logObject('updateDatabase/v3', `Updating table ${table.id} definition...`));
      for (let column of columns) {
        if (typeof column.type === 'string') {
          column.type = {name: column.type, special: false};
        } else if (typeof column.type === 'object' && !_.isNil(column.type.type)) {
          column.type['name'] = column.type.type;
          column.type['special'] = false;
          delete column.type.type;
        }

        if (table.id === 3 && column.name === 'date_out') {
          logger.info(logObject('updateDatabase/v3', `Adding mapping info to '${column.name}' column of table ${table.id} (${table.name})...`))
          column['map'] = {all: {to: 'date'}};
        }
      }

      updates.push({id: table.id, definition: columns});
    }

    logger.info(logObject('updateDatabase/v3', "Running queries..."));
    for (let update of updates) {
      stmt = db.prepare("UPDATE tables_definition SET columns_def=? WHERE id=?");
      result = stmt.run(JSON.stringify(update.definition), update.id);
    }

    logger.info(logObject('updateDatabase/v3', "Updating dbversion..."));
    stmt = db.prepare("UPDATE dbversion SET version=3 WHERE version=2");
    result = stmt.run();
  });

  let v4 = db.transaction(() => {
    logger.info(logObject('updateDatabase/v4', "Creating questionnaires tables..."));

    let createStatements = [
      db.prepare("CREATE TABLE questionnaire (" +
        "id INTEGER PRIMARY KEY AUTOINCREMENT," +
        "name TEXT NOT NULL," +
        "sections TEXT NOT NULL," +
        "validations TEXT NOT NULL" +
        ")"),
      db.prepare("CREATE TABLE table_questionnaires (" +
        "table_id INTEGER NOT NULL," +
        "questionnaire_ref INTEGER NOT NULL," +
        "PRIMARY KEY (table_id, questionnaire_ref)," +
        "FOREIGN KEY (table_id) REFERENCES tables_definition (id)," +
        "FOREIGN KEY (questionnaire_ref) REFERENCES questionnaire (id)" +
        ")"),
      db.prepare("CREATE TABLE questionnaire_answers (" +
        "id INTEGER PRIMARY KEY AUTOINCREMENT," +
        "table_id INTEGER NOT NULL," +
        "questionnaire_ref INTEGER NOT NULL," +
        "slot_number INTEGER NOT NULL," +
        "name TEXT," +
        "date TEXT NOT NULL," +
        "answers TEXT," +
        "note TEXT," +
        "validations TEXT," +
        "FOREIGN KEY (table_id) REFERENCES tables_definition (id)," +
        "FOREIGN KEY (questionnaire_ref) REFERENCES questionnaire (id)" +
        ")"),
    ];

    logger.info(logObject('updateDatabase/v4', "Running queries..."));
    for (const createStatement of createStatements) {
      createStatement.run();
    }

    logger.info(logObject('updateDatabase/v4', "Updating dbversion..."));
    const stmt = db.prepare("UPDATE dbversion SET version=4 WHERE version=3");
    const result = stmt.run();
  })

  let version;
  let updates = 0;
  do {
    let queryString = "SELECT version FROM dbversion";
    version = db.prepare(queryString)
      .get()
      .version;

    if (version === 1) {
      logger.info(logObject('updateDatabase', "Updating database to v2..."));
      v2();
      updates++;
    } else if (version === 2) {
      logger.info(logObject('updateDatabase', "Updating database to v3..."));
      v3();
      updates++;
    } else if (version === 3) {
      logger.info(logObject('updateDatabase', "Updating database to v4..."));
      v4();
      updates++;
    } else if (version === 4) {
      // logger.info(logObject('updateDatabase', "Updating database to v5..."));
      // v5();
      // updates++;
      // TODO: uncomment lines above when version will be greater than 4
    } else {
      logger.warn(logObject('updateDatabase', `Database version ${version} not recognized`));
      break;
    }
  } while (version !== 4); // TODO: change also this row when version will be greater than 4 (increase 4 to 5)
  //
  //   queryString = "SELECT version FROM dbversion";
  //   version = db.prepare(queryString)
  //     .get()
  //     .version;
  // }

  if (updates > 0) {
    logger.info(logObject('updateDatabase', "Update completed!"));
  } else {
    logger.info(logObject('updateDatabase', "No update necessary, ignoring..."));
  }
}

/**
 * Check if slotNumber is a special case for the table identified by tableId
 * @param slotNumber the slot number to check
 * @param tableId identifier of the table to check
 * @return the special case name if slotNumber is a special case, false otherwise
 */
function specialCase(slotNumber, tableId) {
  if (_.isNumber(slotNumber)) {
    for (const key of specialCasesKeys) {
      const bounds = specialCases[key].bounds;
      const applicableTables = specialCases[key].tables;
      if (_.includes(applicableTables, _.toInteger(tableId)) && (slotNumber >= bounds[0] && slotNumber <= bounds[1])) {
        return key;
      }
    }
  }

  if (_.isString(slotNumber) && specialCasesKeys.includes(slotNumber)) {
    const applicableTables = specialCases[slotNumber].tables; // in this if we are sure that slotNumber is one of the keys of specialCases object
    if (applicableTables.includes(tableId))
      return slotNumber;
  }

  return false;
}

/**
 * Find the first non present slot number in low-high range in a specified table
 * @param tableId the table to check
 * @param low lower bound of the range to check (included)
 * @param high upper bound of the range to check (included)
 *
 */
function firstEmptySlotNumberBetween(tableId, low, high) {
  let queryString = "SELECT slot_number FROM tables_slots WHERE table_id=$tableId AND slot_number BETWEEN $low AND $high ORDER BY slot_number ASC";
  let stmt = db.prepare(queryString);
  let res = stmt.all({tableId: tableId, low:low, high:high}); // res contains a row for each slot number returned by the query
  let used_ids = _.map(res, 'slot_number') // aggregate all row in result in an array

  // search first not used number between special slot bounds
  for (let i = low; i <= high; i++){
    if (! _.includes(used_ids, i)) {
      return i;
    }
  }

  // if (res && res.slot_number >= high) {
  throw Error("All slots are full");
  // }

  // return (_.isUndefined(res) ? low : res.slot_number) + 1
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
 * @returns {{id: number, name: string, columns_def: string}|*} If <i>tableId</i> is defined, returns the table's
 * info given its id, otherwise returns an object with id infos of all the tables.
 * **NB**: <i>columns_def</i> is the string representation of columns def object
 */
function getTableDefinition(tableId) {
  logger.debug(logObject('getTableDefinition', 'Requested definition of table ' + tableId));
  if(tableNames === undefined) {
    logger.info(logObject('getTableDefinition', 'tableNames property is undefined. Getting table names from database'));
    tableNames = {};
    let stmt = db.prepare("SELECT * FROM tables_definition");
    for (let table of stmt.iterate()) {
      table['columns_def'] = JSON.parse(table['columns_def']);
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
 * @param name of the column to order rows
 * @returns an array of rows
 */
function getAllFromTable({tableId, limit, orderColumn}) {
  checkRequiredParameters(tableId);
  logger.info(logObject('getAllFromTable', 'Getting rows from table with id ' + tableId + ' (limit ' + limit + ')'));
  let tableName = getTableDefinition(tableId).name;
  let orderColumnName = _.isNil(orderColumn) ? "date" : orderColumn;

  // let queryString = "SELECT * FROM tables_slots ts " + // select starts from table_slots table
  //   "LEFT JOIN " + tableName + " t ON ts.table_ref = t.id " +   // join table_slots ref with corresponding data table rows' id
  //   "LEFT JOIN validation_users vu ON t.validated_by = vu.validation_userid " + // join special column validated_by values with corresponding foreign validation_users ids
  //   "WHERE ts.table_id = ? " +   // filter only table_slots of selected tableId
  //   `ORDER BY t.${orderColumnName} IS NULL, t.${orderColumnName} ASC`   // order result by selected table column
  let queryString = "SELECT * FROM tables_slots ts " + // select starts from table_slots table
    `LEFT JOIN ${tableName} t ON ts.table_ref = t.id ` +   // join table_slots ref with corresponding data table rows' id
    "WHERE ts.table_id = ? " +   // filter only table_slots of selected tableId
    `ORDER BY t.${orderColumnName} IS NULL, t.${orderColumnName} ASC`   // order result by selected table column

  if(limit) {
    queryString = queryString + " LIMIT " + limit; // set desired rows limit
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
 * @param refId OPTIONAL the id (in the reference data table) of the row to retrieve
 * @returns {*} array with all the rows found into the table
 */
function getRowFromTable({tableId, slotNumber, refId}) {
  checkRequiredParameters(tableId);
  checkMutualParameters(slotNumber, refId);

  let tableName = getTableDefinition(tableId).name;
  let queryString = "SELECT * FORM tables_slots ts " +
    `LEFT JOIN ${tableName} t ON ts.ref_id=t.id ` +
    "WHERE table_id=?";
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
 * Create a new table slot for a given special case.
 * The new slot number is selected as the first empty slot between special case's lower and upper bounds
 * @param table_id id of the table where the slot will be inserted
 * @param slot_number identifier of the special case (to identify its bounds)
 * @param table_ref_id OPTIONAL a row's id of the table identified by table_id, for which this slot will be connected
 * @returns {{changes: *, slotNumber: *, tableId: *}} changes: number of changes made in the database (should be 1)
 * slotNumber: the new created slot number
 * tableId: table id of the slot number
 */
function createSpecialSlot(table_id, slot_number, table_ref_id = null) {
  let specialCaseName = specialCase(slot_number, table_id);
  if (!specialCaseName) {
    throw Error(`Slot number ${slot_number} doesn't match with any special case`);
  }
  let newSlotNumber = firstEmptySlotNumberBetween(table_id, specialCases[specialCaseName].bounds[0], specialCases[specialCaseName].bounds[1]);

  let queryString = "INSERT INTO tables_slots(slot_number, table_id, table_ref) VALUES(?, ?, ?)";
  let stmt = db.prepare(queryString);
  let res = stmt.run(newSlotNumber, table_id, table_ref_id);

  return {changes: res.changes, tableId: table_id, slotNumber: newSlotNumber};
}

/**
 * Add more slots to tables.
 * <br> <b>Note: </b> you should use <i>moreSlotsTransaction</i> function that permits a more fine configuration on how
 * many slots should be added in each table
 * @param many How many slots should be added to the table(s) specified in <i>tableId_s</i>
 * @param tableId_s One or more table id(s) where exactly <i>many</i> slots will be added. Must be a number (for a
 * single table) or a list of table ids (for more tables). In the latter case in each tables will be added <i>many</i> slots
 * @returns {*} Number of slots added, summarized on all tables
 */
function moreSlots(many, tableId_s) {
  checkRequiredParameters(many, tableId_s);

  logger.info(logObject('moreSlots', `Inserting ${many} slot(s) in table(s) ` + _.toString(tableId_s)));

  let tableIdsArray; // List of tables to which add
  if (_.isNumber(tableId_s)) {
    tableIdsArray = [tableId_s]; // if table_id_s is a number then transform in in an single-value array
  } else if (_.isArray(tableId_s)) {
    tableIdsArray = tableId_s; // else if table_id_s is yet an array reassign it to tableIdsArray
  } else {
    throw Error('table_id_s must be a number or an array');
  }

  let insertQueryString = "INSERT INTO tables_slots(slot_number, table_id) values ";
  let insertQueryParameters = Array();

  tableIdsArray.forEach((tableId) => {
    // get last slot_number in table_slots
    let getLastSlotNumberStatement = db.prepare("SELECT * FROM tables_slots WHERE table_id=? " +
      "AND slot_number < 9000 ORDER BY slot_number DESC LIMIT 1"); // special slots starts form 9000
    let lastSlotNumber = getLastSlotNumberStatement.get(tableId).slot_number;

    for (let i = 0; i < many; i++) {
      // Example: if table has 50 (lastSlotNumber) slots and we want add 10 slots then new_slot_number will be:
      // (50 + 1 + 0) = 51, (50 + 1 + 1) = 52, ..., (50 + 1 + 9) = 60,
      let new_slot_number = lastSlotNumber + 1 + i;

      insertQueryString = insertQueryString + "(?,?), ";
      insertQueryParameters.push(new_slot_number, tableId);
    }
  });

  // Remove last ", " from string
  insertQueryString = insertQueryString.substring(0, insertQueryString.length - 2);

  logger.debug(logObject('moreSlots', `Insert query string: ${insertQueryString}`));
  logger.debug(logObject('moreSlots', `Insert query parameters: ${_.toString(insertQueryParameters)}`));

  // Inserting into database
  let tablesSlotsInsertStatement = db.prepare(insertQueryString);
  let result = tablesSlotsInsertStatement.run(insertQueryParameters);

  return result.changes
}

/**
 * Delete a slot in <i>tables_slots</i> table given a table id and a slot number
 * @param tableId
 * @param slotNumber
 * @returns {*} result of the query
 */
function deleteSlotBySlotNumber(tableId, slotNumber) {
  let queryString = "DELETE FROM tables_slots WHERE table_id=? AND slot_number=?";
  let stmt = db.prepare(queryString);
  return stmt.run(tableId, slotNumber);
}

/**
 * Delete the slot in <i>tables_slots</i> that is connected to a table (identified by tableId) with a given tableRef
 * @param tableId
 * @param tableRef row's id of the table identified by tableId, for which this slot is connected
 * @returns {*} result of the query
 */
function deleteSlotByTableRef(tableId, tableRef) {
  let queryString = "DELETE FROM tables_slots WHERE table_id=? AND table_ref=?";
  let stmt = db.prepare(queryString);
  return stmt.run(tableId, tableRef);
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
  console.log(values);

  checkRequiredParameters(tableId, values);

  let tableName = getTableDefinition(tableId).name;
  let tableColumns = db.pragma(`table_info(${tableName})`);
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
  logger.debug(logObject('insertIntoTable', Object.keys(values)));
  logger.debug(logObject('insertIntoTable', JSON.stringify(columnNames)));
  let queryString = "INSERT INTO " + tableName + "(" + columnNames.toString() + ') VALUES (';

  for(const name of columnNames) {
    if(values[name] === undefined) { //given values not contains that column
      values[name] = null //so set that column value to null
    }

    queryString = queryString + '$' + name + ', ';
  }

  logger.debug(logObject('insertIntoTable', queryString, values));


  queryString = queryString.substr(0, queryString.length - 2) + ')';
  let stmt = db.prepare(queryString);
  let res = stmt.run(values);

  if(res.changes === 0) {
    throw Error('Insertion into ' + tableName + ' failed with no reason');
  }
  let newId = res.lastInsertRowid;

  //Select slot number
  if(specialCase(slotNumber, tableId) !== false) {
    // if table slot is one of the special cases we dynamically add (and remove) a new slot s between its lower and upper bounds
    res = createSpecialSlot(tableId, slotNumber, newId);
    return {changes: res.changes, newId: newId, tableId: res.tableId, slotNumber: res.slotNumber};
  }

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
    logger.info(logObject('deleteFromTable', 'Slot ' + slotNumber + ' is already empty'));
    return; //slot is already empty
  } else if(refId === undefined) {
    throw Error('Slot ' + slotNumber + ' not found for tableId ' + tableId);
  }

  queryString = "SELECT * FROM " + tableName + " WHERE id=?";
  stmt = db.prepare(queryString);
  let deletedValues = stmt.get(refId);

  if (specialCase(slotNumber, tableId) !== false) { // for CEREC slot numbers we remove the entire slot number
    result = deleteSlotBySlotNumber(tableId, slotNumber);
  } else {
    queryString = "UPDATE tables_slots SET table_ref=null WHERE table_id=? AND slot_number=?";
    stmt = db.prepare(queryString);
    result = stmt.run(tableId, slotNumber);
  }

  if (result.changes === 0) {
    throw Error('Slot ' + slotNumber + ' not found for tableId ' + tableId);
  }

  queryString = "DELETE FROM " + tableName + " WHERE id=?";
  stmt = db.prepare(queryString);
  result = stmt.run(refId);

  return deletedValues;
}

/**
 *
 * @param tableId identifier of the table to update
 * @param rowId identifier of the row in table identified by tableId
 * @param values values to change in form of an object like {column: new-value, ...}
 * @returns {{changes: *}}
 */
function updateRow({tableId, rowId, values}) {
  checkRequiredParameters(tableId, rowId, values);
  let tableName = getTableDefinition(tableId).name;
  let queryString;
  let stmt;
  let result;

  let changes = 0;

  if(_.has(values, 'slot_number')) {
    if (specialCase(values['slot_number'], tableId) === false && !_.isNil(values['slot_number'])) {
      //check if values['slot_number'] is empty
      queryString = "SELECT table_ref FROM tables_slots WHERE table_id=? AND slot_number=?";
      stmt = db.prepare(queryString);
      result = stmt.get(tableId, values['slot_number']);
      if (result.table_ref !== null) {
        throw Error('Selected slot already contains a row');
      }
    }

    // get current table slot number
    queryString = "SELECT slot_number FROM tables_slots WHERE table_id=? AND table_ref=?";
    stmt = db.prepare(queryString);
    let currentSlotNumber = stmt.get(tableId, rowId).slot_number;

    if (specialCase(currentSlotNumber, tableId) === false) {
      //frees current table slot
      queryString = "UPDATE tables_slots SET table_ref=null WHERE table_id=? AND slot_number=?";
      stmt = db.prepare(queryString);
      result = stmt.run(tableId, currentSlotNumber);
    } else {
      // delete slot number
      result = deleteSlotBySlotNumber(tableId, currentSlotNumber);
    }

    if(result.changes === 0) {
      throw Error('No slot found in table ' + tableId + ' that contains row with id ' + rowId);
    }

    if (specialCase(values['slot_number'], tableId) === false) {
      // set new table_slot
      let availableSlots = _.without(getAvailableSlots(tableId), currentSlotNumber);
      if(_.isNil(values['slot_number']) || values['slot_number'] === '') {
        if (availableSlots.length === 0) {
          throw Error('All slots are full for table id ' + tableId);
        }
        values['slot_number'] = availableSlots[0]; //first empty slot number
      } else {
        if(!availableSlots.includes(values['slot_number'])) {
          throw Error(`${values['slot_number']} is not available`);
        }
      }

      queryString = "UPDATE tables_slots SET table_ref=? WHERE table_id=? AND slot_number=?";
      stmt = db.prepare(queryString);
      result = stmt.run(rowId, tableId, values['slot_number']);
    } else {
      // create new table slot and set row reference
      result = createSpecialSlot(tableId, values['slot_number'], rowId);
    }

    changes = result.changes;

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

  stmt = db.prepare(queryString);
  result = stmt.run(values, rowId);
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
  let sourceTableColumnsDefinition = getTableDefinition(fromTableId).columns_def;

  // in this object we save the mapping between source columns and target columns:
  // for each column in target table (as keys), we save the source column we map to it
  // this can be useful in case of error to obtain the mapping we have made
  let targetMapping = {};

  let deletedValues = deleteFromTable({tableId: fromTableId, slotNumber: slotNumber});
  logger.debug(logObject('moveRow', 'Values to move: ',  deletedValues));

  logger.debug(logObject('moveRow', sourceTableColumnsDefinition) );

  for (let sourceColumn of sourceTableColumnsDefinition) {
    // if column definition has mapping info for the target table (or for all tables) we have to map the source column
    // into the target column
    if (sourceColumn.map && (sourceColumn.map[toTableId] || sourceColumn.map['all'])) {
      // the mapping infos are stored with key 'all' if mapping applies to any table,
      // otherwise, the mapping infos are stored with the key of the target table if applies only to a specific target table.
      // In case the mapping object contains both mappings to 'all' and to the specific target table (contains toTableId as key)
      // then the specific tableId mapping have highest priority
      const targetColumn = sourceColumn.map[toTableId] ? sourceColumn.map[toTableId].to : sourceColumn.map['all'].to;
      deletedValues[targetColumn] = deletedValues[sourceColumn.name];
      targetMapping[targetColumn] = sourceColumn.name;
    } else {
      // if there aren't any mapping info, we have no operation to do (in deletedValues, the source column is already mapped
      // to the correct target column), so just need to save this mapping information
      targetMapping[sourceColumn.name] = sourceColumn.name;
    }
  }

  try {
    return insertIntoTable({tableId: toTableId, values: deletedValues});
  } catch (e) {
    if (e.message.startsWith('NOT NULL constraint failed:')) {
      // we have to extract column name form message: "NOT NULL constraint failed: table.column"
      const errorColumn = e.message.split(':')[1] // get the message's right part splitting on :
        .split('.')[1] // get the right part of (table.column) splitting on .
        .trim(); // remove spaces

      // Now we have the column name of the target table that violate the null constraint, we can obtain the source column
      // name mapped through the targetMapping object
      throw new Error(`${targetMapping[errorColumn]} must be not null`);
    } else {
      throw e;
    }
  }
}

/**
 * Get all the questionnaires into the database, given a table id OR a questionnaire id. If an empty object is passed as
 * parameter, will be returned all questionnaires from database.
 *
 * @param tableId OPTIONAL questionnaire table id
 * @param questionnaireId OPTIONAL questionnaire id
 */
function getQuestionnairesBy({tableId, questionnaireId}) {
  let param;
  let query = "SELECT q.id AS id, q.name AS name, q.sections AS sections, q.validations AS validations, tq.table_id " +
    "FROM questionnaire q JOIN table_questionnaires tq ON q.id = tq.questionnaire_ref";

  if (tableId) {
    param = tableId;
    query += " WHERE tq.table_id=?";
  } else if (questionnaireId) {
    param = questionnaireId;
    query += " WHERE q.id=?";
  }

  const stmt = db.prepare(query);

  let results;
  if (param) {
    results = stmt.all(param);
  } else {
    results = stmt.all();
  }

  results = results.map((result) => {
    let sections = JSON.parse(result.sections);
    // In each section we have to reorder questions by its position field
    sections = _.chain(sections)
      .cloneDeep()
      .mapValues((section) => {
        section['questions'] = _.orderBy(section['questions'], ['position']);
        return section;
      })
      .value();

    return {
      id: result.id,
      name: result.name,
      table_id: result.table_id,
      validations: JSON.parse(result.validations),
      sections: sections,
    }
  });

  // if a questionnaire applies to multiple tables results above will have the same questionnaire multiple times,
  // different only on table_id field.
  // So, the operations below returns the distinct questionnaires, with grouped table ids
  results = _.chain(results)
    .groupBy('id')
    .map((value) => {
      let res = _.first(value);
      res.table_ids = _.map(value, 'table_id');
      delete res.table_id;
      return res;
    })
    .value();

  return results.length === 1 ? results[0] : results;
}

/**
 * Creates a new questionnaire for the given table id o list of table ids.
 * <i>Section</i> is an object of sections. Each section is an object with an id (key) and has the following form:
 * <pre>
 * { section_name, validated_by, questions }
 * </pre>
 * <br>
 * <i>questions</i> is an object of questions. Each question has an id (key) and has the following form:
 * <pre>
 * {text, type, required, position, ...}
 * </pre>
 * Can also contain other question type-specific parameter (e.g. the list of possible answers). <br>
 * For a detailed example, see README.md
 * @param table_ids {number || number[]} id or list of ids of tables the questionnaire refers to
 * @param name {string} questionnaire name
 * @param sections {object} questionnaire sections object.
 * @param validations {object}, object that contains who have to sign the questionnaire
 */
function createQuestionnaire({table_ids, name, sections, validations}) {
  const sectionsString = JSON.stringify(sections);
  const validationsString = JSON.stringify(validations);

  if (!_.isArray(table_ids)) {
    table_ids = [table_ids];
  }

  let query = `INSERT INTO questionnaire (name, sections, validations) VALUES (?,?,?)`;
  let stmt = db.prepare(query);
  let result = stmt.run(name, sectionsString, validationsString);

  if (!result.changes || result.changes === 0) {
    throw new Error(`Questionnaire ${name} not inserted for some reasons`)
  }

  console.log(result);
  const questionnaireId = result['lastInsertRowid'];

  console.log(questionnaireId);
  query = "INSERT INTO table_questionnaires(table_id, questionnaire_ref) values (?,?)"
  stmt = db.prepare(query);

  for (const table_id of table_ids) {
    result = stmt.run(table_id, questionnaireId);
  }

  console.log(result);
}

/**
 * Save into database questionnaire's answers
 * @param answers {{table_id, slot_number, questionnaire_ref name, date, note, sections?, answers?, validations}} questionnaire's answer object. See README.md
 */
function saveQuestionnaireAnswers(answers) {
  console.log(JSON.stringify(answers));
  const answersObj = answers.answers || answers.sections;

  const queryParams = {
    table_id: answers.table_id,
    questionnaire_ref: answers.questionnaire_ref,
    slot_number: answers.slot_number,
    name: answers.name,
    date: answers.date || formatISO(new Date()),
    note: answers.note,
    answers: JSON.stringify(answersObj),
    validations: JSON.stringify(answers.validations)
  }

  let query = 'INSERT ' +
    'INTO questionnaire_answers(table_id, questionnaire_ref, slot_number, name, date, answers, note, validations)' +
    'VALUES($table_id,$questionnaire_ref,$slot_number,$name,$date,$answers,$note,$validations)';

  let stmt = db.prepare(query);
  let result = stmt.run(queryParams);

  if (result.changes === 0) {
    throw new Error('No answers saved into database');
  }

  const newId = result['lastInsertRowid'];

  return getQuestionnaireAnswersById(newId);
}

/**
 * Get all answers of questionnaires given a table_id and slot_number, if <i>questionnaire_ref</i> parameter is not defined,
 * will be returned the answers for all questionnaires given table_id and slot_number, grouped by questionnaire id
 * @param params {{table_id, slot_number, questionnaire_ref?}}
 */
function getQuestionnaireAnswersBy(params) {
  checkRequiredParameters(params.table_id, params.slot_number);

  let query = "SELECT * FROM questionnaire_answers WHERE table_id=$table_id AND slot_number=$slot_number";

  if (params.questionnaire_ref) {
    query += " AND questionnaire_ref=$questionnaire_ref"
  }

  let stmt = db.prepare(query);
  let results = stmt.all(params);

  results = results.map((result) => {
      return {
        id: result.id,
        table_id: result.table_id,
        questionnaire_ref: result.questionnaire_ref,
        slot_number: result.slot_number,
        name: result.name,
        date: result.date,
        note: result.note,
        answers: JSON.parse(result.answers),
        validations: JSON.parse(result.validations)
      }
    }
  );

  return _.groupBy(results, 'questionnaire_ref');
}

function getQuestionnaireAnswerById(answerId) {
  checkRequiredParameters(answerId);

  let query = "SELECT * FROM questionnaire_answers WHERE id=?";

  let stmt = db.prepare(query);
  let result = stmt.get(answerId);

  return {
    id: result.id,
    table_id: result.table_id,
    questionnaire_ref: result.questionnaire_ref,
    slot_number: result.slot_number,
    name: result.name,
    date: result.date,
    note: result.note,
    answers: JSON.parse(result.answers),
    validations: JSON.parse(result.validations)
  }
}

/**
 * Get all answers of questionnaires given a table_id and slot_number, if <i>questionnaire_ref</i> parameter is not defined,
 * will be returned the answers for all questionnaires given table_id and slot_number, grouped by questionnaire id
 * @param questionnaire_answers_id}
 */
function getQuestionnaireAnswersById(questionnaire_answers_id) {
  checkRequiredParameters(questionnaire_answers_id);

  let query = "SELECT * FROM questionnaire_answers WHERE id=?";

  let stmt = db.prepare(query);
  let result = stmt.get(questionnaire_answers_id);

  return {
    id: result.id,
    table_id: result.table_id,
    questionnaire_ref: result.questionnaire_ref,
    slot_number: result.slot_number,
    name: result.name,
    date: result.date,
    note: result.note,
    answers: JSON.parse(result.answers),
    validations: JSON.parse(result.validations)
  };
}

if (!dbExists) {
  logger.info(logObject('main', 'Database creation'));
  logger.info(logObject('main', 'Creating', dbPath));
  fs.openSync(dbPath, "w");
}

logger.info(logObject('main', 'Starting database...'));

let db = new Database(dbPath, {verbose: logger.verbose});

logger.info(logObject('main', 'Database started successfully'));

if (!dbExists) {
  logger.info(logObject('main', 'Creating tables'));
  createDatabase();
}

logger.info(logObject('main', "Checking database updates..."));
updateDatabase();

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

// slotConfigs is json array of objects {many: number, tableIds: array}
// for each object will be added the same number (many) of slots in each tableIds tables
let moreSlotsTransaction = db.transaction((slotConfigs) => {
  let totalSlotsAdded = 0;

  slotConfigs.forEach((slotConfig) => {
    totalSlotsAdded += moreSlots(slotConfig.many, slotConfig.tableIds);
  });

  return totalSlotsAdded;
});

// questionnaires is a json array of questionnaires to add to the database
// See README.md for more info
let addQuestionnairesTransaction = db.transaction((questionnaires) => {
  let total = 0;

  questionnaires.forEach((questionnaire) => {
    // if the questionnaire object has an id field and it refers to an existing questionnaire we have to replace it
    if (questionnaire['id'] && getQuestionnairesBy({questionnaire_id: questionnaire['id']})) {
      // TODO: add update questionnaire function
    } else {
      createQuestionnaire(questionnaire);
      total++;
    }
  });

  return total;
})

let saveQuestionnaireAnswersTransaction = db.transaction((answersObject) => {
  return saveQuestionnaireAnswers(answersObject);
})

logger.info(logObject('main', 'Setting ipc events callback...'));

/** see README.md **/
ipc.on('database-op', (event, values) => {
  let senderId = event.senderId;
  if(values.operation === undefined) {
    event.sender.sendTo(senderId, 'database-op-res', {result: 'error', message:'no operation defined'});
  }
  let parameters = values.parameters;
  let returnChannel = values.operation;
  if (values.uid) {
    returnChannel = returnChannel + '-' + values.uid;
  }

  logger.verbose(logObject("database-op", "Received op from ", senderId, " with values: ",  values));
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
      case 'questionnaire-get-all':
        result = getQuestionnairesBy({}); break;
      case 'questionnaire-get-by':
        result = getQuestionnairesBy(parameters); break;
      case 'questionnaire-get-answers':
        result = getQuestionnaireAnswersBy(parameters); break;
      case 'questionnaire-get-answer-by-id':
        result = getQuestionnaireAnswerById(parameters.questionnaireId); break;
      case 'questionnaire-save-answers':
        result = saveQuestionnaireAnswersTransaction(parameters); break;
    }

    logger.silly(logObject('database-op', "Result: ", result));

    //Result sent on two channel, the second permits to filter on table id
    // event.sender.sendTo(senderId, values.operation, {result: 'success', response: result});
    event.sender.sendTo(senderId, returnChannel, {result: 'success', response: result});
  } catch (e) {
    event.sender.sendTo(senderId, returnChannel, {result: 'error', message: e.message})
  }
});

remote.getCurrentWindow().on('close', (event) => {
  logger.info(logObject('closeEvent', 'Closing database...'));
  db.close();
});

ipc.on('shutdown', (event) => {
  logger.info(logObject('shutdownEvent', 'Requested database shutdown'));
  db.close();
  ipc.send('database-shutdown', true);
});

logger.info(logObject('main', 'Database initialization completed'));


// *** After initialization operations ***

function addSlotsFromFile() {
  logger.info(logObject('addSlotsFromFile', "Checking for a 'add_slots.json' file..."));
  let addSlotsFilePath = path.join(appPath, 'data', 'add_slots.json');
  //let addSlotsFile = fs.openSync(addSlotsFilePath, "rw");
  //let conf = [{many: 10, tableIds: [1, 2, 3, 4, 5]}, {many: 12, tableIds: 5}];
  //fs.writeFileSync(addSlotsFilePath, JSON.stringify(conf));

  if (fs.existsSync(addSlotsFilePath)) {
    logger.info(logObject('addSlotsFromFile', "add_slots file found"));
    let confString = fs.readFileSync(addSlotsFilePath).toString();
    let slotConfigs = JSON.parse(confString);

    try {
      let result = moreSlotsTransaction(slotConfigs);
      logger.info(logObject('addSlotsFromFile', `Successfully added ${result} slots`));

      fs.unlink(addSlotsFilePath, (err => {
        if (err) {
          logger.warn(logObject('addSlotsFromFile', `An error occurred during deletion of 'add_slots.json'
          file (${addSlotsFilePath}). File will be renamed in 'delete_me.old`));
          fs.rename(addSlotsFilePath, path.join(appPath, 'data', 'delete_me.old'), (err1 => {
            logger.alert(logObject('addSlotsFromFile', `An error occurred during rename of 'add_slots.json' file (${addSlotsFilePath}).
            YOU SHOULD MANUALLY REMOVE THE FILE IMMEDIATELY!`));
          }));
        }

        logger.info(logObject('addSlotsFromFile', "add_slots.json file removed"));
      }));
    } catch (e) {
      logger.error(logObject('addSlotsFromFile', "Add_slots file will be renamed in 'add_slots_err.json'"));
      fs.renameSync(addSlotsFilePath, path.join(appPath, 'data', 'add_slots_err.json'));
      throw (e);
    }
  } else {
    logger.info(logObject('addSlotsFromFile', "add_slots file not found, ignored"));
  }
}

function addQuestionnairesFromFile() {
  logger.info(logObject('addQuestionnairesFromFile', "Checking for a 'addQuestionnaires.json' file..."));
  let filepath = path.join(appPath, 'data', 'addQuestionnaires.json');

  if (fs.existsSync(filepath)) {
    logger.info(logObject('addQuestionnairesFromFile', "addQuestionnaires.json file found"));
    let questionnairesString = fs.readFileSync(filepath).toString();
    let questionnaires = JSON.parse(questionnairesString);

    try {
      let result = addQuestionnairesTransaction(questionnaires);
      logger.info(logObject('addQuestionnairesFromFile', `Successfully added ${result} questionnaire(s)`));

      fs.unlink(filepath, (err => {
        if (err) {
          logger.warn(logObject('addQuestionnairesFromFile', `An error occurred during deletion of 'addQuestionnaires.json'
          file (${questionnairesFilePath}). File will be renamed in 'delete_me.old`));
          fs.rename(questionnairesFilePath, path.join(appPath, 'data', 'delete_me.old'), (err1 => {
            logger.alert(logObject('addQuestionnairesFromFile', `An error occurred during rename of 'addQuestionnaires.json' file (${questionnairesFilePath}).
            YOU SHOULD MANUALLY REMOVE THE FILE IMMEDIATELY!`));
          }));
        }

        logger.info(logObject('addQuestionnairesFromFile', "addQuestionnaires.json file removed"));
      }));

    } catch (e) {
      logger.error(logObject('addQuestionnairesFromFile', e.message));

      logger.error(logObject('addQuestionnairesFromFile', "Add_slots file will be renamed in 'addQuestionnaires.json.err'"));
      fs.renameSync(filepath, path.join(appPath, 'data', 'addQuestionnaires.json.err'));
      throw (e);
    }

    logger.info(logObject("addQuestionnairesFromFile", "Creating questionnaires.json..."))
    const questionnairesFromDB = getQuestionnairesBy({});
    let questionnairesFilePath = path.join(appPath, 'data', 'questionnaires.json');
    fs.writeFile(questionnairesFilePath, JSON.stringify(questionnairesFromDB, undefined, 2),
      null, () => {});
  } else {
    logger.info(logObject('addQuestionnairesFromFile', "addQuestionnaires.json file not found, ignored"));
  }
}


addSlotsFromFile();
addQuestionnairesFromFile();

logger.info(logObject('main', 'Database started successfully'));
