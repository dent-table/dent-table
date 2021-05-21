import { HomeComponent } from './components/home/home.component';
import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {TablePageComponent} from './tables/table-page/table-page.component';
import {LoginComponent} from './components/login/login.component';
import {LoginGuard} from './providers/login.guard';
import {PreferencesDialogComponent} from './components/preferences-dialog/preferences-dialog.component';
import {QuestionnaireWidgetComponent} from './questionnaires/questionnaire-widget/questionnaire-widget.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent, canActivate: [LoginGuard]},
  { path: 'table/:id', component: TablePageComponent, canActivate: [LoginGuard]},
  { path: 'preferences', component: PreferencesDialogComponent, canActivate: [LoginGuard]},
  { path: '', component: LoginComponent},
  { path: '**', redirectTo: '' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true, relativeLinkResolution: 'legacy' })],
    exports: [RouterModule]
})
export class AppRoutingModule { }
