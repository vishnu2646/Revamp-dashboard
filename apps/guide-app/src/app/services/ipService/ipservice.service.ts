import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class IpserviceService {
    private httpClient = inject(HttpClient);

    public getIpAddress(): Observable<Object> {
        return this.httpClient.get('https://api.ipify.org/?format=json');
    }
}
