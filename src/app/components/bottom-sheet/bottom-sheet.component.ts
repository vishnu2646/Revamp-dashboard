import { ChangeDetectionStrategy, Component, Inject, inject } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatBottomSheetModule, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DateAdapter } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import moment from 'moment';
import { DateFilterService } from '../../services/filter/date-filter.service';

@Component({
    selector: 'app-bottom-sheet',
    standalone: true,
    imports: [
        MatListModule,
        MatButtonModule,
        MatBottomSheetModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
        MatDatepickerModule,
        FormsModule
    ],
    providers: [provideNativeDateAdapter()],
    templateUrl: './bottom-sheet.component.html',
    styleUrl: './bottom-sheet.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BottomSheetComponent {
    private _bottomSheetRef = inject<MatBottomSheetRef<BottomSheetComponent>>(MatBottomSheetRef);

    private filterService = inject(DateFilterService);

    public fromDate = '';

    public toDate = '';

    public field: string = '';

    constructor(
        private dateAdapter: DateAdapter<Date>,
    ) {
        this.dateAdapter.setLocale('en-GB'); //dd/MM/yyyy
    }

    public handleCloseFilterSheet(event: MouseEvent) {
        this._bottomSheetRef.dismiss();
        event.preventDefault();
    }

    public handleDateFilter() {
        const fromDate = this.fromDate;
        const toDate = this.toDate;
        if(fromDate && toDate) {
            this.filterService.updateFilter(new Date(fromDate), new Date(toDate))
        }
        this._bottomSheetRef.dismiss();
    }
}
