import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IIpAdress } from '../../types/types';

@Injectable({
    providedIn: 'root'
})
export class IpserviceService {
    private httpClient = inject(HttpClient);

    public getIpAddress(): Observable<IIpAdress> {
        return this.httpClient.get<IIpAdress>('https://api.ipify.org/?format=json');
    }
}
