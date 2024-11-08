import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class DateFilterService {

    private filterSubject = new BehaviorSubject<{ fromDate: Date | null, toDate: Date | null, field: string | '' }>({ fromDate: null, toDate: null, field: '' });

    public filter$ = this.filterSubject.asObservable();

    // Update filter data
    public updateFilter(fromDate: Date | null, toDate: Date | null, field: string | '') {
        this.filterSubject.next({ fromDate, toDate, field });
    }
}
