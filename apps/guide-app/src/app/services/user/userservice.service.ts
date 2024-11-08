import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';

import { IUser, IUserInfo } from '../../types/types';

@Injectable({
    providedIn: 'root'
})
export class UserserviceService {
    private htpp = inject(HttpClient);

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
            console.log('No cookie data');
            return 'No cookie data'
        }
    }

    public loginService(data: any): Observable<IUserInfo> {
        return this.htpp.post(`${this.baseUrl}/LoginApi?databaseKey=TRADEDEMO`, data) as Observable<IUserInfo>;
    }
}
