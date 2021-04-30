import {ChangeDetectorRef, Component, ElementRef, NgZone, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {DatabaseService} from '../../providers/database.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {PreferencesService} from '../../providers/preferences.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LoginComponent implements OnInit {

  @ViewChild('username', { static: true }) usernameField: ElementRef;
  @ViewChild('password', { static: true }) passwordField: ElementRef;

  formGroup: FormGroup;
  loginCatKey = PreferencesService.CATEGORIES.login;
  rememberPrefKey = PreferencesService.PREFERENCES_KEYS.login.rememberUser;
  usernamePrefKey = PreferencesService.PREFERENCES_KEYS.login.username;

  rememberUsernamePreference = this.preferencesService.get(
    this.loginCatKey, this.rememberPrefKey, false
  );

  loginResult;

  constructor(
    private preferencesService: PreferencesService,
    private databaseService: DatabaseService,
    private router: Router,
    private zone: NgZone,
    private cdr: ChangeDetectorRef) { }


  ngOnInit() {

    let savedUsername = null;
    if (this.rememberUsernamePreference) {
      savedUsername = this.preferencesService.get(
        this.loginCatKey, this.usernamePrefKey, '');
      this.passwordField.nativeElement.focus();
    } else {
      this.usernameField.nativeElement.focus();
    }

    const controls = {};

    controls['username'] = new FormControl(savedUsername || '', [Validators.required]);
    controls['password'] = new FormControl('', [Validators.required]);
    controls['saveUsername'] = new FormControl(this.rememberUsernamePreference);
    this.formGroup = new FormGroup(controls);
  }

  loginSuccess() {
    const saveUsernameChoice = this.formGroup.value['saveUsername'],
      username = this.formGroup.value['username'];

    let saveUser, usernameValue;

    if (saveUsernameChoice === true) {
      this.preferencesService.put(this.loginCatKey, this.rememberPrefKey, true);
      this.preferencesService.put(this.loginCatKey, this.usernamePrefKey, username);
    } else {
      this.preferencesService.put(this.loginCatKey, this.rememberPrefKey, false);
      this.preferencesService.put(
        'login', 'username', ''
      );
    }

    this.preferencesService.save();

    this.zone.run(() => {
      sessionStorage.setItem('login', '1');
      this.router.navigate(['./home']);
    });
  }

  onSubmit() {
    this.loginResult = null;
    if (this.formGroup.valid) {
      this.databaseService.login(this.formGroup.value['username'], this.formGroup.value['password']).subscribe(
        (response) => {
          this.loginResult = response;
          if (response === 200) {
            this.loginSuccess();
          } else {
            console.warn('loginResult', response);
          }
          this.cdr.detectChanges();
        }
      );
    }
  }

}
