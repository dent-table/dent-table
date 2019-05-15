import {Component, NgZone, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {MatDialog} from '@angular/material';
import {RowDialogComponent} from '../row-dialog/row-dialog.component';
import {CellClickEvent, TableWidgetComponent} from '../table-widget/table-widget.component';
import {DatabaseService} from '../../providers/database.service';

@Component({
  selector: 'app-table-page',
  templateUrl: './table-page.component.html',
  styleUrls: ['./table-page.component.scss']
})
export class TablePageComponent implements OnInit {
  tableId: number;
  @ViewChild(TableWidgetComponent) tableWidget: TableWidgetComponent;

  constructor(
    private activatedRoute: ActivatedRoute,
    public dialog: MatDialog,
    private zone: NgZone,
    private databaseService: DatabaseService
  ) { }

  ngOnInit() {
    this.tableId = this.activatedRoute.snapshot.params['id'];
  }

  cellClicked(event: CellClickEvent) {
    const el = event.element;
    const colName = event.columnName;

    if (event.columnName === 'verified') {
      const value = el[colName] === 0 ? 1 : 0;
      this.databaseService.updateRow(el.table_id, el.table_ref, {verified: value}).subscribe((result) => {
        console.log(result);
        this.tableWidget.reload();
      });
    } else {
      this.openRowDialog(event.element);
    }
  }

  openRowDialog(element?: any) {
    let dialogRef;

    // component' onInit not fired without Zone
    this.zone.run(() => {
      dialogRef = this.dialog.open(RowDialogComponent, {
        data: { tableId: this.tableId, element: element },
        width: '50%', height: '90%'
      });

      dialogRef.afterOpened().subscribe((result) => {
        console.log('opened', result);
      });

      dialogRef.afterClosed().subscribe((result) => {
        console.log('Dialog closed', result);
        if (result && result !== 'canceled' && result.changes > 0) {
          this.tableWidget.reload();
        }
      });
    });
  }
}
