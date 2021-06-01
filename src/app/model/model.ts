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

/** Represent a generic table row obtanied from the database */
export interface TableRow {
  /** Slot number from table tables_slots */
  slot_number: number;
  /**  Id of the reference table */
  table_id: number;
  /**  Id of the table's row in the reference table */
  table_ref: number;
  [key: string]: any;
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
    const columnsDef: Array<any> = object.columns_def;
    const columnsDefinitions: Array<ColumnDefinition> = [];

    for (const column of columnsDef) {
      columnsDefinitions.push(new ColumnDefinition(column.name, column.type, column.required, column.displayed));
    }

    return new TableDefinition(object.id, object.name, columnsDefinitions);
  }
}

export interface QuestionnaireQuestion {
  key: string;
  text: string;
  type: string;
  required: boolean;
  position: number;
}

export interface QuestionnaireSection {
  section_name: string;
  validated_by: number;
  questions: QuestionnaireQuestion[];
}

export interface Questionnaire {
  id: number;
  name: string;
  table_ids: number[];
  sections: {
    [key: string]: QuestionnaireSection
  };
  validations: object;
}

export interface QuestionnaireAnswers {
  id?: number | string;
  questionnaire_ref: number;
  table_id: number;
  slot_number: number;
  date: string;
  answers: { [key: string]: any } | object;
  note: string;
  validations: object;
}
