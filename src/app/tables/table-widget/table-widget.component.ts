import {
  AfterContentChecked,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef, EventEmitter, Inject,
  Input, LOCALE_ID, OnDestroy,
  OnInit, Output,
  ViewChild
} from '@angular/core';
import {DatabaseService} from '../../providers/database.service';
import {LoggerService} from '../../providers/logger.service';
import {MatPaginator, MatTableDataSource, MatTooltip} from '@angular/material';
import {DragDropData} from 'ng2-dnd';
import {TablesService} from '../../providers/tables.service';
import {Router} from '@angular/router';
import {ViewRef_} from '@angular/core/src/view';
import {ColumnDefinition, TableDefinition} from '../../model/model';
import * as moment from 'moment';
import {polyfill} from 'mobile-drag-drop';
import {formatDate} from '@angular/common';

export interface CellClickEvent {
  columnName;
  element?;
}

@Component({
  selector: 'app-table-widget',
  templateUrl: './table-widget.component.html',
  styleUrls: ['./table-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableWidgetComponent implements OnInit, AfterViewInit, AfterContentChecked, OnDestroy {
  @Input() tableId: number;
  @Input() limit: number;
  @Input() rowNumber = 1;
  @Input() draggable = false;
  @Input() rowSize = 24;
  @Input() buttonsSize = 16;
  @Input() showButtons = true;

  @ViewChild(MatPaginator) matPaginator: MatPaginator;
  @ViewChild('tooltip') tooltip: MatTooltip;

  @Output() cellClick: EventEmitter<CellClickEvent> = new EventEmitter();

  logTag = TableWidgetComponent.name;

  data = new MatTableDataSource();
  dataLength = 0;

  tableName: string;
  columns_def: ColumnDefinition[] = null;
  displayedColumns: string[] = [];

  isLoaded = false;
  showDndOverlay = false;

  // https://stackoverflow.com/questions/38081878/objectunsubscribederror-when-trying-to-prevent-subscribing-twice
  dragStartedObservableSubscription;
  dragEndedObservableSubscription;
  rowMovedObservableSubscription;
  searchEventSubscription;


  // taken from official MatTableDataSource implementation, added date timestamp to string conversion
  filterPredicate: ((data: any, filter: string) => boolean) = (data: any, filter: string): boolean => {
    // Transform the data into a lowercase string of all property values.
    const dataStr = Object.keys(data).reduce((currentTerm: string, key: string) => {
      // Use an obscure Unicode character to delimit the words in the concatenated string.
      // This avoids matches where the values of two columns combined will match the user's query
      // (e.g. `Flute` and `Stop` will match `Test`). The character is intended to be something
      // that has a very low chance of being typed in by somebody in a text field. This one in
      // particular is "White up-pointing triangle with dot" from
      // https://en.wikipedia.org/wiki/List_of_Unicode_characters
      let dataString = (data as {[key: string]: any})[key];

      if (key.indexOf('date') != -1) {
        dataString = formatDate(dataString, 'dd/MM', this.locale);
      }

      return currentTerm + dataString + '◬';
    }, '').toLowerCase();

    // Transform the filter by converting it to lowercase and removing whitespace.
    const transformedFilter = filter.trim().toLowerCase();

    return dataStr.indexOf(transformedFilter) != -1;
  };

  constructor(
    private databaseService: DatabaseService,
    private logger: LoggerService,
    private tablesService: TablesService,
    private el: ElementRef,
    private cdr: ChangeDetectorRef,
    private router: Router,
    @Inject(LOCALE_ID) private locale: string
  ) {
    // this.logger = loggerService.getLogger('table-widget.component.ts');
    polyfill({});
  }

  ngOnInit() {
    if ('number' !== typeof this.tableId) {
      this.tableId = Number.parseInt(this.tableId, 10);
    }
    if ('number' !== typeof this.rowSize) {
      this.rowSize = Number.parseInt(this.rowSize, 10);
    }
    if ('boolean' !== typeof  this.showButtons) {
      this.showButtons = this.showButtons === 'true';
    }


    this.data.filterPredicate = this.filterPredicate;
  }

  ngAfterViewInit(): void {
    this.databaseService.getTableDefinition(this.tableId).subscribe(
      (data) => { this.tableConstruction(data); },
      errors => { this.logger.error(this.logTag, errors); }
    );

    this.reload();

    this.dragStartedObservableSubscription = this.tablesService.dragStartedObservable.subscribe((sourceTableId) => {
      if (sourceTableId !== this.tableId) {
        this.showDndOverlay = true;
        try {
          this.cdr.detectChanges();
        } catch (e) {
          this.delayDetectChanges();
        }
      }
    });

    this.dragEndedObservableSubscription = this.tablesService.dragEndedObservable.subscribe((sourceTableId) => {
      if (sourceTableId !== this.tableId) {
        this.showDndOverlay = false;
        try {
          this.cdr.detectChanges();
        } catch (e) {
          this.delayDetectChanges();
        }
      }
    });

    this.rowMovedObservableSubscription = this.tablesService.rowMovedObservable.subscribe((data) => {
      if (data.fromTableId === this.tableId || data.toTableId === this.tableId) {
        this.reload();
      }
    });

    this.searchEventSubscription = this.tablesService.onSearchEvent.subscribe((query) => {
      this.data.filter = query.trim().toLowerCase();
    });
  }

  ngAfterContentChecked(): void {
    this.calcRowNumber();
  }

  ngOnDestroy(): void {
    this.dragStartedObservableSubscription.unsubscribe();
    this.dragEndedObservableSubscription.unsubscribe();
    this.rowMovedObservableSubscription.unsubscribe();
    this.searchEventSubscription.unsubscribe();
  }

  reload() {
    this.databaseService.getAll(this.tableId, this.limit).subscribe((data) => {
        // this.data = new MatTableDataSource(data);
      this.data.data = [...data];
        this.dataLength = data.length;
        this.data.paginator = this.matPaginator;

        try {
          this.cdr.detectChanges();
        } catch (e) {
          this.delayDetectChanges();
        }
      }, errors => { this.logger.error(this.logTag, errors); },
      () =>  {
      });
  }

  tableConstruction(values: TableDefinition) {
    this.logger.debug(this.logTag, '' + this.showButtons, typeof this.showButtons);
    this.logger.debug(this.logTag, typeof this.showButtons);
    this.tableName = values.name;
    this.columns_def = values.columnsDefinition;
    const displayedCols: string[] = ['slotNumber'];

    for (const column of this.columns_def) {
      if (column.displayed) {
        displayedCols.push(column.name);
      }
    }

    if (this.showButtons === true) {
      this.logger.debug(this.logTag, 'pushing');
      displayedCols.push('buttons');
    }

    this.displayedColumns = displayedCols;
    this.isLoaded = true;
  }

  calcRowNumber() {
    const headersSize = 73;
    // const newRowNumber = Math.floor((this.el.nativeElement.offsetHeight - 69) / this.rowSize);
    const newRowNumber = Math.floor((this.el.nativeElement.offsetHeight - headersSize) / this.rowSize);
    if (newRowNumber !== this.rowNumber) {
      this.rowNumber = newRowNumber;
      this.matPaginator._changePageSize(this.rowNumber);
    }
  }

  navigateToTablePage() {
    this.router.navigate(['./table', this.tableId]);
  }

  onDropData($event: DragDropData) {
    const dragData = $event.dragData;
    this.databaseService.moveRow(dragData.table_id, dragData.slot_number, this.tableId).subscribe(
      (next) => {
        // nothing to do
      }, error1 => this.logger.error(this.logTag, error1)
    );
  }

  isDropAllowed() {
    return (dragData: any) => {
      if (dragData !== undefined && dragData.table_id) {
        return dragData.table_id !== this.tableId;
      }
      return false;
    };
  }

  onDragEvent(event: string) {
    if (event === 'start') {
      this.tablesService.onDragStarted(this.tableId);
    } else if (event === 'end') {
      this.tablesService.onDragEnded(this.tableId);
    }
  }

  // prevent default on some drag events on dnd-droppable (important!)
  public preventDefault(event) {
    event.mouseEvent.preventDefault();
    return false;
  }

  fireTableCellClicked(columnName: string, element?: any) {
    // this.zone.run(() => {
    this.cellClick.emit({columnName: columnName, element: element});
    // });
  }

  // https://github.com/akserg/ng2-dnd/issues/177
  delayDetectChanges () {
    // Programmatically run change detection to fix issue in Safari
    setTimeout(() => {
      if ( this.cdr !== null &&
        this.cdr !== undefined &&
        ! (this.cdr as ViewRef_).destroyed ) {
        this.cdr.detectChanges();
      }

    }, 250);

    this.cdr.detectChanges();
  }

  // Return true if row date is under 7 day until today
  checkDateRow(row: any) {
    const rowDate = moment(row['date'], 'x');
    const currentDate = moment();

    return currentDate.add(7, 'd').isAfter(rowDate);
  }
}
