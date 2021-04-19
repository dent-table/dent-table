export class ToDo {
  constructor(
    public slotNumber: number,
    public tableRefId: number,
    public tableId: number,
    public name: string,
    public type: string,
    public date: number,
  ) { }
}

export class ToDeliver {
  constructor(
    public slotNumber: number,
    public tableRefId: number,
    public tableId: number,
    public name: string,
    public type: string,
    public date: number,
  ) { }
}

export interface ColumnTypeDefinition {
  name: string;
  special: boolean;
  options?: any; // options for option type
}

export class ColumnDefinition {
  constructor(
    public name: string,
    public type: ColumnTypeDefinition, // TODO: remove this after converted all columns to ColumnTypeDefinition
    public required,
    public displayed
  ) { }
}

export class TableDefinition {
  constructor(public id: number,
              public name: string,
              public columnsDefinition: ColumnDefinition[]
  ) { }

  static create(object): TableDefinition {
    const columnsDef: Array<any> = JSON.parse(object.columns_def);
    const columnsDefinitions: Array<ColumnDefinition> = [];

    for (const column of columnsDef) {
      columnsDefinitions.push(new ColumnDefinition(column.name, column.type, column.required, column.displayed));
    }

    return new TableDefinition(object.id, object.name, columnsDefinitions);
  }
}
