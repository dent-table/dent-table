import {Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import {ElectronService} from './providers/electron.service';
import {TranslateService} from '@ngx-translate/core';
import {PreferencesService} from './providers/preferences.service';
import {MatDialog} from '@angular/material/dialog';
import {ConfirmDialogComponent} from './components/confirm-dialog/confirm-dialog.component';
import {LoggerService} from './providers/logger.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  constructor(public electronService: ElectronService,
              private translate: TranslateService, private preferencesService: PreferencesService,
              private zone: NgZone, private dialog: MatDialog, private logger: LoggerService) {

    translate.setDefaultLang('en');
    // console.log('AppConfig', AppConfig);
    //
    // if (electronService.isElectron()) {
    //   console.log('Mode electron');
    // } else {
    //   console.log('Mode web');
    // }
  }

  ngOnInit(): void {
    this.electronService.remote.getCurrentWindow().on('close', (/*event*/) => {
      this.logger.info(AppComponent.name, 'Closing app...');
      this.zone.run(() => {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {data: {title: 'PAGES.CONFIRM_DIALOG.SURE'}});
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            this.logger.info(AppComponent.name, 'Starting app shutdown...');
            this.electronService.ipcSend('start-app-shutdown');
          }
        });
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.which === 123) {
        this.electronService.remote.getCurrentWebContents().openDevTools();
      } else if (e.which === 116) {
        location.reload();
      }
    });

    this.preferencesService.load();
  }

  ngOnDestroy(): void {
    this.preferencesService.save();
  }
}
