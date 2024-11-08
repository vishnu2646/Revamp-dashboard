import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';

import { MatBottomSheet, MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';


import { debounceTime, distinctUntilChanged, lastValueFrom, Subject, Subscription } from 'rxjs';

import { BottomSheetComponent } from '../../components/bottom-sheet/bottom-sheet.component';
import { ApiService } from '../../services/api/api.service';
import { UserserviceService } from '../../services/user/userservice.service';
import { IUser } from '../../types/types';
import { MatExpansionModule } from '@angular/material/expansion';
import { LoaderComponent } from '../../components/loader/loader.component';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from '../../pipes/filter/filter.pipe';
import { DateFilterService } from '../../services/filter/date-filter.service';
import moment from 'moment';

@Component({
    selector: 'app-dataview',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        MatIconModule,
        MatButtonModule,
        MatCardModule,
        MatDividerModule,
        MatBottomSheetModule,
        BottomSheetComponent,
        MatTabsModule,
        MatExpansionModule,
        MatTableModule,
        LoaderComponent,
        MatPaginatorModule,
        FilterPipe
    ],
    templateUrl: './dataview.component.html',
    styleUrl: './dataview.component.scss'
})
export class DataviewComponent implements OnInit, AfterViewInit {
    private _bottomSheet = inject(MatBottomSheet);

    private activatedRoute = inject(ActivatedRoute);

    private userService = inject(UserserviceService);

    private router = inject(Router);

    private apiService = inject(ApiService);

    private filterService = inject(DateFilterService);

    private filterSubscription: Subscription | null = null;

    private filterSubject: Subject<string> = new Subject<string>();

    private cd = inject(ChangeDetectorRef)

    public userData: IUser = {} as IUser;

    public module: String = '';

    public isExpanded: boolean = false;

    public panelOpenState = false;

    public menuExplorer = [];

    public tempExplorer = [];

    public menuExplorerWithKeys: any[] = [];

    public isMenuExplorerDataLoading = false;

    public menuExplorerCount = 0;

    public togglePaginator = false;

    public filterValue = '';

    public isDateFilterApplied = false;

    // Include 'actions' in the displayed columns
    public displayedColumns: String[] = [];

    public optionsRights: any = {};

    public dataSource: MatTableDataSource<any> = new MatTableDataSource();

    // Pagination settings
    public pageSize: number = 5;

    @ViewChild(MatPaginator)
    public paginator!: MatPaginator;

    constructor() {
        this.router.events.subscribe((val)  => {
            if(val instanceof NavigationEnd) {
                window.location.reload();
            }
        });

        this.filterSubject.pipe(
            debounceTime(300),
            distinctUntilChanged()
        ).subscribe(value => {
            this.filterValue = value;
        });
    }

    public ngOnInit() {
        this.activatedRoute.queryParams.subscribe(params => {
            this.module = params['module'];
        });
        this.handleGetUserData();
        this.handleGetMenuExplorer();

        this.filterSubscription = this.filterService.filter$.subscribe(filter => {
            if (filter.fromDate && filter.toDate && filter.field) {
                this.filterByDate(filter.fromDate, filter.toDate, filter.field);
            }
        });
    }

    public ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
    }

    public handleGetUserData() {
        const data: IUser = this.userService.getCookieData() as IUser;
        if(data) {
            this.userData = data;
        } else {
            this.router.navigate(['/auth/login']);
        }
    }

    public async handleGetMenuExplorer(): Promise<void> {
        this.isMenuExplorerDataLoading = !this.isMenuExplorerDataLoading;

        try {
            const responseData = await lastValueFrom(this.apiService.getMenuExplorerService(this.module, this.userData.UsrId));
            if(responseData && responseData['CheckMenuExplr']) {
                this.menuExplorer = responseData['CheckMenuExplr'].Table;
                this.tempExplorer = responseData['CheckMenuExplr'].Table;
                this.menuExplorerCount = responseData['CheckMenuExplr'].Table.length;
                this.optionsRights = responseData['CheckMenuExplr'].Table3[0];
                if(this.optionsRights['Rights_Edit'] || this.optionsRights['Right_History'] || this.optionsRights['Rights_Comment']){
                    this.displayedColumns = [...this.objectKeys(this.menuExplorer[0]), 'actions'];
                }
                this.dataSource.data = this.menuExplorer;
            }
        } catch (error) {
            console.log(error);
        } finally {
            this.isMenuExplorerDataLoading = !this.isMenuExplorerDataLoading;
        }
    }

    public objectKeys(obj: any): string[] {
        if(obj) {
            return Object.keys(obj);
        } else {
            return [];
        }
    }

    public trackByIndex(index: number, item: any): any {
        return index;  // You can return a unique identifier if available
    }

    public getObjectKeyValue(obj: any, index: number): String {
        const keys = Object.keys(obj);
        return keys[index];
    }

    public getObjectValue(obj: any, index: number): string {
        const keys = Object.keys(obj);
        return obj[keys[index]];
    }

    public onFocus() {
        this.isExpanded = true;
    }

    public onBlur() {
        // Check if input is empty; if so, collapse the search
        const input = document.getElementById('search') as HTMLInputElement;
        if (!input.value) {
            this.isExpanded = false;
        }
    }

    public onInput() {
        this.isExpanded = true; // Keep expanded when there's input
    }

    public openFilterSheet() {
        this._bottomSheet.open(BottomSheetComponent);
    }

    public filterByDate(fromDate: Date, toDate: Date, field: string) {
        console.log('Filter by date');
        const startDate = moment(fromDate).format('YYYY-MM-DD');

        const endDate = moment(toDate).format('YYYY-MM-DD');

        const filteredData = this.menuExplorer.filter((item: any) => {
            if (!item[field]) {
                alert(`Date key "${field}" not found in data`)
                return false;
            }
            const itemDate = moment(item[field]).format('YYYY-MM-DD');

            return itemDate >= startDate && itemDate <= endDate;
        });

        // Update the data source with filtered data
        if(this.togglePaginator) {
            this.dataSource.data = filteredData;
        } else {
            console.log('Filter by date updated', filteredData);
            this.menuExplorer = filteredData;
            this.isDateFilterApplied = !this.isDateFilterApplied;
            this.cd.detectChanges();
        }

        this.isDateFilterApplied = !this.isDateFilterApplied;
    }

    public onPageChange(event: any) {
        const startIndex = event.pageIndex * event.pageSize;
        const endIndex = startIndex + event.pageSize;
        this.dataSource.data = this.menuExplorer.slice(startIndex, endIndex);
    }

    public handleTogglePaginator(type: String) {
        if(type === 'grid') {
            this.togglePaginator = false;
        } else {
            this.togglePaginator = true;
            this.menuExplorer = this.tempExplorer;
            this.onPageChange({
                length: this.menuExplorer.length,
                pageIndex: 0,
                pageSize: this.pageSize,
                previousPageIndex: 0
            });
            this.cd.detectChanges();
        }
    }

    public handleAction(type: String, row: any) {
        console.log(type, row);
    }

    public onFilterChange(value: string) {
        this.filterSubject.next(value);
    }

    public applyFilter(event: any) {
        if(this.togglePaginator) {
            this.filterValue = (event.target as HTMLInputElement).value;
            this.dataSource.filter = this.filterValue.trim().toLowerCase();
        }
    }

    public handleClearFilter() {
        // Toggle the filter flag
        this.isDateFilterApplied = false;

        // Reset the menuExplorer to the original data
        this.menuExplorer = [...this.tempExplorer];  // Create a new array reference

        // Manually trigger change detection to ensure UI is updated
        this.cd.detectChanges();
    }
}
