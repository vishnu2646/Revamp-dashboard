import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserserviceService } from '../user/userservice.service';
import { ConfigService } from '../config/config.service';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private key: String = '';

    private httpClient = inject(HttpClient);

    private userService = inject(UserserviceService);

    private baseUrl = 'http://rx2025apiservice.revampapps.com';

    constructor(private configService: ConfigService) {
        const key = sessionStorage.getItem('key');
        if(key) {
            this.key = key;
        }
    }

    public getMenuService(id: number): Observable<any> {
        return this.httpClient.get(`${this.baseUrl}/GetMenuLogin?Userid=${id}&databaseKey=${this.key}`)
    }

    public getMenuExplorerService(mdlId: String, usrId: number): Observable<any> {
        return this.httpClient.get(`${this.baseUrl}/MenuExplr?MdlId=${mdlId}&UserId=${usrId}&databaseKey=${this.key}`);
    }

    public getIndividualDataService(mdlId: String, id: number, usrId: number): Observable<any> {
        return this.httpClient.get(`${this.baseUrl}/GetIndividualData?MdlId=${mdlId}&ID=${id}&UserId=${usrId}&databaseKey=${this.key}`);
    }
}
