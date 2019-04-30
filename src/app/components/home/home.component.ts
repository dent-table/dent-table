import { Component, OnInit } from '@angular/core';
import {LoggerService} from '../../providers/logger.service';
import {Logger} from 'winston';
import {DatabaseService} from '../../providers/database.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  logger: Logger;

  constructor(private loggerService: LoggerService, private databaseService: DatabaseService) {
    this.logger = loggerService.getLogger('home.component.ts');
  }

  ngOnInit() {
    this.logger.info('ngOnInit');
  }

  getAll() {
    this.databaseService.getAll(1).then((rows) => {
      console.log(rows);
    }).catch((error) => {
      console.log(error);
    });
  }
}
