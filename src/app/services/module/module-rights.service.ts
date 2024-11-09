import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ModuleRightsService {
    private rightsSubject = new BehaviorSubject<any>(null);

    private dateFilterSubject = new BehaviorSubject<any>(null);

    private selectedDataSubject = new BehaviorSubject<any>(null);

    public rights$ = this.rightsSubject.asObservable();

    public dateFilters$ = this.dateFilterSubject.asObservable();

    public selectedData$ = this.selectedDataSubject.asObservable();

    public setRights(rights: any) {
        this.rightsSubject.next(rights);
    }

    public emitDateFilteRights(rights: any) {
        this.dateFilterSubject.next(rights);
    }

    public setSelectedData(data: any) {
        this.selectedDataSubject.next(data);
    }

    public getSelectedData() {
        return this.selectedDataSubject.getValue();
    }
}
