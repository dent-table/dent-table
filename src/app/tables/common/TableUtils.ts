import {DatabaseService} from '../../providers/database.service';
import {TableRow} from '../../model/model';
import {Observable} from 'rxjs';

export function updateVerifiedColumn(el: TableRow, databaseService: DatabaseService): Observable<{changes: number}> {
  return new Observable(subscriber => {
    const value = el['verified'] === 0 ? 1 : 0;
    databaseService.updateRow(el.table_id, el.table_ref, {verified: value}).subscribe({
      next: (result) => {
        subscriber.next(result);
        subscriber.complete();
      },
      error: (error) => {
        subscriber.error(error);
      }
    });
  });
}
