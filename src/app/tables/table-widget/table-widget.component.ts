import {
  AfterContentChecked,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef, EventEmitter,
  Input, OnDestroy,
  OnInit, Output,
  ViewChild
} from '@angular/core';
import {DatabaseService} from '../../providers/database.service';
import {LoggerService} from '../../providers/logger.service';
import {Logger} from 'winston';
import {MatPaginator, MatTableDataSource, MatTooltip} from '@angular/material';
import {DragDropData} from 'ng2-dnd';
import {TablesDndService} from '../../providers/tables-dnd.service';
import {Router} from '@angular/router';
import {ViewRef_} from '@angular/core/src/view';
import {ColumnDefinition, TableDefinition} from '../../model/model';
import * as moment from 'moment';

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
  @Input() showButtons = true;

  @ViewChild(MatPaginator) matPaginator: MatPaginator;
  @ViewChild('tooltip') tooltip: MatTooltip;

  @Output() cellClick: EventEmitter<CellClickEvent> = new EventEmitter();

  logger: Logger;

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

  constructor(
    private databaseService: DatabaseService,
    private loggerService: LoggerService,
    private dndService: TablesDndService,
    private el: ElementRef,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    this.logger = loggerService.getLogger('table-widget.component.ts');
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
  }

  ngAfterViewInit(): void {
    this.databaseService.getTableDefinition(this.tableId).subscribe(
      (data) => { this.tableConstruction(data); },
      errors => this.logger.error
    );

    this.reload();

    this.dragStartedObservableSubscription = this.dndService.dragStartedObservable.subscribe((sourceTableId) => {
      if (sourceTableId !== this.tableId) {
        this.showDndOverlay = true;
        try {
          this.cdr.detectChanges();
        } catch (e) {
          this.delayDetectChanges();
        }
      }
    });

    this.dragEndedObservableSubscription = this.dndService.dragEndedObservable.subscribe((sourceTableId) => {
      if (sourceTableId !== this.tableId) {
        this.showDndOverlay = false;
        try {
          this.cdr.detectChanges();
        } catch (e) {
          this.delayDetectChanges();
        }
      }
    });

    this.rowMovedObservableSubscription = this.dndService.rowMovedObservable.subscribe((data) => {
      if (data.fromTableId === this.tableId || data.toTableId === this.tableId) {
        this.reload();
      }
    });
  }

  ngAfterContentChecked(): void {
    this.calcRowNumber();
  }

  ngOnDestroy(): void {
    this.dragStartedObservableSubscription.unsubscribe();
    this.dragEndedObservableSubscription.unsubscribe();
    this.rowMovedObservableSubscription.unsubscribe();
  }

  reload() {
    this.databaseService.getAll(this.tableId, this.limit).subscribe((data) => {
        console.log(data);
        this.data = new MatTableDataSource(data);
        this.dataLength = data.length;
        this.data.paginator = this.matPaginator;

        try {
          this.cdr.detectChanges();
        } catch (e) {
          this.delayDetectChanges();
        }
      }, errors => this.logger.error,
      () =>  {
      });
  }

  tableConstruction(values: TableDefinition) {
    this.logger.debug('' + this.showButtons, typeof this.showButtons);
    this.logger.debug(typeof this.showButtons);
    this.tableName = values.name;
    this.columns_def = values.columnsDefinition;
    const displayedCols: string[] = ['slotNumber'];

    for (const column of this.columns_def) {
      if (column.displayed) {
        displayedCols.push(column.name);
      }
    }

    if (this.showButtons === true) {
      this.logger.debug('pushing');
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
      }, error1 => this.logger.error
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
      this.dndService.onDragStarted(this.tableId);
    } else if (event === 'end') {
      this.dndService.onDragEnded(this.tableId);
    }
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
