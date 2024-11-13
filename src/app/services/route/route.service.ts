import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class RouteService {

    private routeSubject = new BehaviorSubject<any>(null);

    public route$ = this.routeSubject.asObservable();

    public setRouter(route: any) {
        this.routeSubject.next(route);
    }

    public getRouter() {
        return this.routeSubject.getValue();
    }
}
