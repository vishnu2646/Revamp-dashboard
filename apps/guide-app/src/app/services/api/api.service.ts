import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserserviceService } from '../user/userservice.service';

@Injectable({
    providedIn: 'root'
})
export class ApiService {

    private httpClient = inject(HttpClient);

    private baseUrl = 'http://rx2025apiservice.revampapps.com';

    public getMenuService(id: number): Observable<any> {
        return this.httpClient.get(`${this.baseUrl}/GetMenuLogin?Userid=${id}&databaseKey=ANNAM`)
    }

    public getMenuExplorerService(mdlId: String, usrId: number): Observable<any> {
        return this.httpClient.get(`${this.baseUrl}/MenuExplr?MdlId=${mdlId}&UserId=${usrId}&databaseKey=ANNAM`);
    }
}
