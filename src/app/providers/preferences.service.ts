import {Injectable} from '@angular/core';
import {writeFileSync, readFileSync} from 'fs';
import {ElectronService} from './electron.service';
import * as path from 'path';

@Injectable({
  providedIn: 'root'
})
export class PreferencesService {

  public static CATEGORIES = {
    login: 'login'
  };

  public static PREFERENCES_KEYS = {
    login: {
      rememberUser: 'rememberUser',
      username: 'username'
    }
  };

  private filePath = this.electronService.getAppPath('data' + path.sep + 'preferences.json');
  private preferences: {
    [category: string]: { [preference: string]: any }
  };

  constructor(private electronService: ElectronService) { }

  load(): void {
    const buffer = readFileSync(this.filePath, {encoding: 'utf8'});
    this.preferences = JSON.parse(buffer);
  }

  get(category: string, name: string, defaultValue?: any): string {
    if (this.preferences[category][name] !== undefined || this.preferences[category][name] !== null ) {
      return this.preferences[category][name];
    } else if (defaultValue !== undefined || defaultValue !== null) {
      return defaultValue;
    } else {
      throw Error(`No preference found for ${name}`);
    }
  }

  put(category: string, name: string, value: any): void {
    if (this.preferences[category][name] === undefined || this.preferences[category][name] === null) {
      throw Error(`No preference found for ${name}`);
    }

    this.preferences[category][name] = value;
  }

  save(): void {
    writeFileSync(this.filePath, JSON.stringify(this.preferences));
  }
}
