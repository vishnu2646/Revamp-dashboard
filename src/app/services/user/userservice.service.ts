import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';

import { IUser, IUserInfo } from '../../types/types';
import { ConfigService } from '../config/config.service';

@Injectable({
    providedIn: 'root'
})
export class UserserviceService {
    private http = inject(HttpClient);

    private baseUrl = 'http://rx2025apiservice.revampapps.com';

    private cookieService = inject(CookieService);

    private configService = inject(ConfigService);

    public setCookie(data: IUser): void {
        this.cookieService.set('user', JSON.stringify(data), { path: '/' });
    }

    public getCookieData(): any {
        const cookieData = this.cookieService.get('user');

        if(cookieData) {
            const data = JSON.parse(cookieData);
            return data;
        } else {
            return 'No cookie data'
        }
    }

    public logoutService(id: number, userId: number): void {
        this.handleLogout(id, userId);
        this.cookieService.delete('user');
    }

    public loginService(data: any): Observable<IUserInfo> {
        const key = this.configService.getConfig();
        sessionStorage.setItem('key', key);
        const { UsrName, UsrPwd, ComCode, SessionId, IPAddress, ComId } = data;
        return this.http.get(`${this.baseUrl}/LoginApi?UsrName=${UsrName}&UsrPwd=${UsrPwd}&ComCode=${ComCode}&SessionId=${SessionId}&IPAddress=${IPAddress}&ComId=${ComId}&databaseKey=${key}`) as Observable<IUserInfo>;
    }

    public getUserInfoService(userName: String, password: String, email: String): Observable<Object> {
        const key = sessionStorage.getItem('key');
        return this.http.get(`${this.baseUrl}/ResetPwdApi?IN_UserName=${userName}&IN_PassWordStr=${password}&IN_EmailId=${email}&databaseKey=${key}`);
    }

    public updatePasswordInfoService(data: any) {
        const { username, OldPassword, password } = data;
        const key = sessionStorage.getItem('key');
        return this.http.get(`${this.baseUrl}/ChangePwdApi?Username=${username}&OldPassWord=${OldPassword}&NewPassWord=${password}&databaseKey=${key}`)
    }

    private handleLogout(id: number, userId: number) {
        const key = sessionStorage.getItem('key');
        this.http.get(`${this.baseUrl}/LogoutApi?LogId=${id}&UserId=${userId}&LogOutTime=null&databaseKey=${key}`)
    }
}
