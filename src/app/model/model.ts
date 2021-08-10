/** Represent a generic table row obtained from the database */
export interface TableRow {
  /** Slot number from table tables_slots */
  slot_number: number;
  /**  Id of the reference table */
  table_id: number;
  /**  Id of the table's row in the reference table */
  table_ref: number;
  /**  Undefined number of any other properties */
  [key: string]: any;
}

export interface ColumnTypeDefinition {
  name: "string" | "text" | "date" | "boolean" | "select";
  special: boolean;
  options?: { name: string, value: any }[]; // options for select type
  disable_default?: boolean; // only for select type
}

export class ColumnDefinition {
  constructor(
    public name: string,
    public type: ColumnTypeDefinition,
    public required: boolean,
    public displayed: boolean
  ) { }
}

export class TableDefinition {
  constructor(public id: number,
              public name: string,
              public columnsDefinition: ColumnDefinition[]
  ) { }

  static create(object: any): TableDefinition {
    const columnsDef: Array<any> = object.columns_def;
    const columnsDefinitions: Array<ColumnDefinition> = [];

    for (const column of columnsDef) {
      columnsDefinitions.push(new ColumnDefinition(column.name, column.type, column.required, column.displayed));
    }

    return new TableDefinition(object.id, object.name, columnsDefinitions);
  }
}

export interface SpecialCasesDefinition {
  [name: string]: {tables: number[], bounds: number[]}
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
  validations: {[id: string]: string};
}

export interface QuestionnaireAnswers {
  id?: number | string;
  questionnaire_ref: number;
  table_id: number;
  slot_number: number;
  date: string;
  answers: { [key: string]: any } | any;
  note: string;
  validations: {[id: string]: string};
}
