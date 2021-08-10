import {Component, NgZone, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {RowDialogComponent} from '../row-dialog/row-dialog.component';
import {CellClickEvent, TableWidgetComponent} from '../table-widget/table-widget.component';
import {DatabaseService} from '../../providers/database.service';
import {ConfirmDialogComponent} from '../../components/confirm-dialog/confirm-dialog.component';
import {LoggerService} from '../../providers/logger.service';
import {TranslateService} from '@ngx-translate/core';
import {QuestionnaireComponent} from '../../components/questionnaire/questionnaire.component';
import {openSnackbar} from '../../commons/Utils';
import {TableRow} from '../../model/model';
import {updateVerifiedColumn} from '../common/TableUtils';
import {PreferencesService} from "../../providers/preferences.service";

@Component({
  selector: 'app-table-page',
  templateUrl: './table-page.component.html',
  styleUrls: ['./table-page.component.scss']
})
export class TablePageComponent implements OnInit {
  logTag = TablePageComponent.name;

  tableId: number;
  orderColumn: string;
  warnDateColumnName: string;

  @ViewChild(TableWidgetComponent, { static: true }) tableWidget: TableWidgetComponent;

  constructor(
    private activatedRoute: ActivatedRoute,
    public dialog: MatDialog,
    private zone: NgZone,
    private databaseService: DatabaseService,
    private logger: LoggerService,
    private snackBar: MatSnackBar,
    private translateService: TranslateService,
    private preferencesService: PreferencesService,
  ) { }

  ngOnInit(): void {
    this.tableId = Number.parseInt(this.activatedRoute.snapshot.params['id'], 10);
    this.orderColumn = this.preferencesService.get(
      PreferencesService.CATEGORIES.tables,
      PreferencesService.PREFERENCES_KEYS.tables.order_columns)[this.tableId];
    this.warnDateColumnName = this.orderColumn;
  }

  cellClicked(event: CellClickEvent): void {
    const el = event.element;

    if (event.columnName === 'verified') {
      updateVerifiedColumn(el, this.databaseService).subscribe({
        next: value => {
          this.logger.info(this.logTag, `Update result`, value);
          this.tableWidget.reload();
        },
        error: error => this.logger.error(this.logTag, 'Update error', error)
      });
    } else if (event.columnName === 'delete_row') {
      this.logger.info(this.logTag, 'Opening delete row dialog...');
      this.zone.run(() => {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
          data: {title: 'PAGES.CONFIRM_DIALOG.SURE'}
        });

        dialogRef.afterClosed().subscribe((result) => {
          this.logger.debug(this.logTag, 'Dialog result ', result);
          if (result) {
            this.deleteRow(el);
          }
        });
      });
    } else if (event.columnName === 'open_questionnaires') {
      this.openQuestionnaireDialog(this.tableId, event.element);
    } else {
      this.logger.info(TablePageComponent.name, 'Opening RowDialog...');
      this.openRowDialog(event.element);
    }
  }

  openQuestionnaireDialog(tableId: number, element: TableRow): void {
    this.zone.run(() => {
      this.dialog.open(QuestionnaireComponent, {
        data: {tableId: tableId, element: element},
        width: '60%', height: '90%'
      });
    });
  }

  openRowDialog(el?: TableRow): void {
    let dialogRef;

    // component' onInit not fired without Zone
    this.zone.run(() => {
      dialogRef = this.dialog.open(RowDialogComponent, {
        data: { tableId: this.tableId, element: el },
        width: '40%', height: '90%'
      });

      dialogRef.afterClosed().subscribe((result) => {
        this.logger.info(this.logTag, 'Dialog closed', result);
        if (result && result !== 'canceled' && result.changes > 0) {
          this.tableWidget.reload();
        }
      });
    });
  }

  deleteRow(el: TableRow): void {
    this.logger.debug(this.logTag, 'deleting', el);
    let snackbarText, snackbarDuration, snackbarActionText, snackbarActionCallback, snackbarRef;

    this.databaseService.deleteRow(el.table_id, el.slot_number).subscribe({
      next: (result) => {
        this.logger.debug(this.logTag, "Delete result", result);
        snackbarText = this.translateService.instant("SUCCESSES.DELETE");
        snackbarDuration = 5000;
        snackbarActionText = this.translateService.instant("COMMONS.CANCEL");
        snackbarActionCallback = () => {
          this.logger.info(this.logTag, "Delete undo requested");
          this.logger.info(this.logTag, "Element to reinsert: ", result);
          result["slot_number"] = el.slot_number;
          this.databaseService.insertRow(this.tableId, result).subscribe({
            next: () => {
              this.logger.info(this.logTag, "Delete undo success");
              this.tableWidget.reload();
            },
            error: (error2) => {
              this.logger.error(this.logTag, "Delete undo error!", error2);
            }
          });

          snackbarRef.dismiss();

        };
        this.zone.run(() => {
          snackbarRef = openSnackbar(
            this.snackBar, snackbarText, snackbarDuration, snackbarActionText, snackbarActionCallback);

        });
        this.tableWidget.reload();
      },
      error: (errors) => {
        this.logger.error(this.logTag, "Delete error!", errors);
        snackbarText = this.translateService.instant("ERRORS.GENERIC");
        snackbarDuration = 3000;
        openSnackbar(
          this.snackBar, snackbarText, snackbarDuration);
      }
    });
  }
}
