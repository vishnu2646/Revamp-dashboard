import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';

import { IUser, IUserInfo } from '../../types/types';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class UserserviceService {
    private http = inject(HttpClient);

    private router = inject(Router);

    private baseUrl = 'https://rmpapi.iworkx.in';

    private cookieService = inject(CookieService);

    public setCookie(key: string): void {
        // 3 days Calculation.
        const expires = new Date();
        expires.setSeconds(expires.getSeconds() + 3 * 24 * 60 * 60);

        this.cookieService.set('key', key, { path: '/', expires: expires });
        this.router.navigate(['/auth/login']);
    }

    public getCookieData(): any {
        const cookieData = this.cookieService.get('key');

        if(cookieData) {
            return cookieData;
        } else {
            return 'Key not found'
        }
    }

    public getUserData(): any {
        const userData = sessionStorage.getItem('user');
        if(userData) {
            return JSON.parse(userData);
        } else {
            return 'User Not found'
        }
    }

    public logoutService(id: number, userId: number): void {
        this.handleLogout(id, userId);
    }

    public loginService(data: any): Observable<any> {
        const key = this.cookieService.get('key');
        const { UsrName, UsrPwd, ComCode, SessionId, IPAddress, ComId } = data;
        return this.http.get(`${this.baseUrl}/LoginApi?UsrName=${UsrName}&UsrPwd=${UsrPwd}&ComCode=${ComCode}&SessionId=${SessionId}&IPAddress=${IPAddress}&ComId=${ComId}&databaseKey=${key}`) as Observable<IUserInfo>;
    }

    public verifyOtpService(data: any): Observable<any> {
        const key = this.cookieService.get('key');
        const { otp, logId } = data;
        return this.http.get(`${this.baseUrl}/VerifyLogin?AuthCode=${otp}&LogId=${logId}&databaseKey=${key}`)
    }

    public getUserInfoService(userName: String, password: String, email: String): Observable<Object> {
        const key = this.cookieService.get('key');
        return this.http.get(`${this.baseUrl}/ResetPwdApi?IN_UserName=${userName}&IN_PassWordStr=${password}&IN_EmailId=${email}&databaseKey=${key}`);
    }

    public updatePasswordInfoService(data: any): Observable<any> {
        const { username, OldPassword, password } = data;
        const key = this.cookieService.get('key');
        return this.http.get(`${this.baseUrl}/ChangePwdApi?Username=${username}&OldPassWord=${OldPassword}&NewPassWord=${password}&databaseKey=${key}`)
    }

    private handleLogout(id: number, userId: number) {
        const key = this.cookieService.get('key');
        sessionStorage.clear();
        this.http.get(`${this.baseUrl}/LogoutApi?LogId=${id}&UserId=${userId}&LogOutTime=null&databaseKey=${key}`)
    }
}
