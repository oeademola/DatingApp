import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {BehaviorSubject} from 'rxjs';
import {map} from 'rxjs/operators';
import { AlertifyService } from './alertify.service';
import {JwtHelperService} from '@auth0/angular-jwt';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { User } from '../_models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

constructor(private http: HttpClient, private alertify: AlertifyService, private router: Router) { }

  baseUrl = environment.apiUrl + 'auth/';
  jwtHelper = new JwtHelperService();
  decodedToken: any;
  currentUser: User;
  photoUrl = new BehaviorSubject<string>('../../assets/user.png');
  currentPhotoUrl = this.photoUrl.asObservable();

  changeMemberPhoto(photoUrl: string) {
    this.photoUrl.next(photoUrl);
  }

login(model: any){
  return this.http.post(this.baseUrl + 'login', model)
    .pipe(
      map((response: any) => {
        const user = response;
        if (user){
          localStorage.setItem('token', user.token);
          localStorage.setItem('user', JSON.stringify(user.user));
          this.decodedToken = this.jwtHelper.decodeToken(user.token);
          this.currentUser = user.user;
          this.changeMemberPhoto(this.currentUser.photoUrl);
        }
      })
    );
}

loggedIn(){
  const token = localStorage.getItem('token');
  return !this.jwtHelper.isTokenExpired(token);
}

logOut(){
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  this.decodedToken = null;
  this.currentUser = null;
  this.alertify.message('logged out');
  this.router.navigate(['/home']);
}

register(user: User){
  return this.http.post(this.baseUrl + 'register', user);
}

}
