import { HomeComponent } from './components/home/home.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {TablePageComponent} from './tables/table-page/table-page.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'table/:id', component: TablePageComponent}
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {useHash: true})],
    exports: [RouterModule]
})
export class AppRoutingModule { }
