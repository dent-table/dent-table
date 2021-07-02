import { Injectable } from '@angular/core';
import {CanActivate, CanLoad, Route, UrlSegment, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router} from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
/* eslint-disable @typescript-eslint/no-unused-vars */
export class LoginGuard implements CanActivate, CanLoad {

  constructor(private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    if (sessionStorage.getItem('login') === '1') {
      return true;
    }

    this.router.navigate(['']);
    return false;
  }


  canLoad(
    route: Route,
    segments: UrlSegment[]): Observable<boolean> | Promise<boolean> | boolean {
    return true;
  }
}
