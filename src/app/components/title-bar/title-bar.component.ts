import { Component, OnInit } from '@angular/core';
import {ElectronService} from '../../providers/electron.service';

@Component({
  selector: 'app-title-bar',
  templateUrl: './title-bar.component.html',
  styleUrls: ['./title-bar.component.scss']
})
export class TitleBarComponent implements OnInit {
  appVersion = this.electronService.appVersion;

  constructor(public electronService: ElectronService) { }

  ngOnInit(): void { }

}
