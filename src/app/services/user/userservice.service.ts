import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';

import { IUser, IUserInfo } from '../../types/types';

@Injectable({
    providedIn: 'root'
})
export class UserserviceService {
    private http = inject(HttpClient);

    private baseUrl = 'http://rx2025apiservice.revampapps.com';

    private cookieService = inject(CookieService);

    public setCookie(data: IUser): void {
        this.cookieService.set('user', JSON.stringify(data), { path: '/' });
    }

    public getCookieData(): IUser | String {
        const cookieData = this.cookieService.get('user');

        if(cookieData) {
            const data = JSON.parse(cookieData);
            return data;
        } else {
            return 'No cookie data'
        }
    }

    public logoutService(): void {
        // this.handleLogout(id, userId);
        this.cookieService.deleteAll('user');
    }

    public loginService(data: any): Observable<IUserInfo> {
        const { UsrName, UsrPwd, ComCode, SessionId, IPAddress, ComId } = data;
        return this.http.get(`${this.baseUrl}/LoginApi?UsrName=${UsrName}&UsrPwd=${UsrPwd}&ComCode=${ComCode}&SessionId=${SessionId}&IPAddress=${IPAddress}&ComId=${ComId}&databaseKey=ANNAM`) as Observable<IUserInfo>;
    }

    public getUserInfoService(userName: String, password: String, email: String): Observable<Object> {
        return this.http.get(`${this.baseUrl}/ResetPwdApi?IN_UserName=${userName}&IN_PassWordStr=${password}&IN_EmailId=${email}&databaseKey=ANNAM`);
    }

    public updatePasswordInfoService(data: any) {
        const { username, OldPassword, password } = data;
        return this.http.get(`${this.baseUrl}/ChangePwdApi?Username=${username}&OldPassWord=${OldPassword}&NewPassWord=${password}&databaseKey=ANNAM`)
    }

    // private handleLogout(id: String, userId: number) {
    //     this.http.get(`${this.baseUrl}/LogoutApi?LogId=${id}&UserId=${userId}&LogOutTime=null&databaseKey=ANNAM`)
    // }
}
