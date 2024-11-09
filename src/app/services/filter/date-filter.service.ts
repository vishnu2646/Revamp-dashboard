import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class DateFilterService {

    private filterSubject = new BehaviorSubject<{ fromDate: Date | null, toDate: Date | null}>({ fromDate: null, toDate: null });

    public filter$ = this.filterSubject.asObservable();

    // Update filter data
    public updateFilter(fromDate: Date | null, toDate: Date | null) {
        this.filterSubject.next({ fromDate, toDate });
    }
}
