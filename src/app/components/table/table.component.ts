import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild, inject, output } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ApiService } from '../../services/api/api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { lastValueFrom, Subscription } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { LoaderComponent } from "../loader/loader.component";
import moment from 'moment';
import { DateFilterService } from '../../services/filter/date-filter.service';
import { ModuleRightsService } from '../../services/module/module-rights.service';

@Component({
    selector: 'app-table',
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
        MatPaginatorModule,
        MatIconModule,
        MatButtonModule,
        LoaderComponent,
    ],
    templateUrl: './table.component.html',
    styleUrl: './table.component.scss'
})
export class TableComponent implements OnInit, OnChanges, AfterViewInit {
    private  apiService = inject(ApiService);

    private activatedRoute = inject(ActivatedRoute);

    private router = inject(Router);

    private filterService = inject(DateFilterService);

    private moduleRightsSerivice = inject(ModuleRightsService);

    private filterSubscription: Subscription | null = null;

    public isLoadingResults = false;

    public displayedColumns: string[] = [];

    public dataSource = new MatTableDataSource<any>();

    public tempData: any[] = [];

    public filterValue: String = '';

    public visiblityRights: any;

    public dateFilter: String = ''

    @Input()
    public isFilterApplied: boolean = false;

    @Input()
    public userData: any;

    @Input()
    public module: String = '';

    @ViewChild(MatPaginator)
    public paginator!: MatPaginator;

    @Output()
    public dataLength = new EventEmitter<number>();

    @Output()
    public filterApplied = new EventEmitter<boolean>();

    public ngOnInit(): void {
        this.activatedRoute.queryParams.subscribe(params => {
            this.filterValue = params['filter'];
        });

        this.handleGetMenuExplorerData();

        this.filterSubscription = this.filterService.filter$.subscribe(filter => {
            if (filter.fromDate && filter.toDate) {
                this.filterByDate(filter.fromDate, filter.toDate);
            }
        });
    }

    public ngAfterViewInit(): void {
        if(this.filterValue) {
            this.dataSource.filter = this.filterValue.trim().toLowerCase();
            this.filterApplied.emit(true);
        }
    }

    public ngOnChanges(simpleChanges: SimpleChanges): void {
        if(simpleChanges['isFilterApplied']?.currentValue) {
            this.isFilterApplied = simpleChanges['isFilterApplied']?.currentValue;
        } else {
            this.isFilterApplied = false;
            this.dataSource.data = [...this.tempData];
        }
    }

    public async handleGetMenuExplorerData(): Promise<void> {
        this.toggleLoadingState();
        try {
            const responseData = await this.fetchMenuExplorerData();

            if (this.isValidResponse(responseData)) {
                this.processTable1Data(responseData['CheckMenuExplr'].Table1);
                this.processTableData(responseData['CheckMenuExplr'].Table);
                this.processTableRights(responseData['CheckMenuExplr'].Table1[0]);

                this.processTable3Data(responseData['CheckMenuExplr'].Table3[0])
                this.updatePaginator();
            } else {
                this.resetData();
            }
        } catch (error) {
            console.log(error);
        } finally {
            this.toggleLoadingState();
        }
    }

    public handleGetDetail(row: any) {
        this.moduleRightsSerivice.setSelectedData(row);
        this.router.navigateByUrl('/dashboard/details', { state: row });
    }

    private filterByDate(fromDate: any, toDate: any): void {
        const startDate = moment(fromDate).format('L');

        const endDate = moment(toDate).format('L');

        const filteredData = this.dataSource.data.filter((item: any) => {
            const itemDate = moment(item[this.dateFilter.toString()]).format('L');
            return itemDate > startDate && itemDate < endDate;
        });

        this.dataSource.data = filteredData;
    }

    private toggleLoadingState(): void {
        this.isLoadingResults = !this.isLoadingResults;
    }

    private async fetchMenuExplorerData() {
        return lastValueFrom(this.apiService.getMenuExplorerService(this.module, this.userData.UsrId));
    }

    private isValidResponse(responseData: any): boolean {
        return responseData && responseData['CheckMenuExplr'] && responseData['CheckMenuExplr'].Table.length > 0;
    }

    public processTable1Data(data: any) {
        const isExplorerNeeded = data[0];
        this.visiblityRights = isExplorerNeeded.IN_IsExplrNeed.split('|');
    }

    private processTableData(tableData: any[]): void {
        const columns = Object.keys(tableData[0]);
        this.dataSource.data = tableData;
        this.tempData = tableData;

        this.displayedColumns = columns.filter((_column, index) => {
            return this.visiblityRights[index] === '1' || this.visiblityRights[index] === ' ';
        });
    }

    private processTableRights(data: any) {
        this.dateFilter = data.IN_PrimdDate;
        this.moduleRightsSerivice.emitDateFilteRights(this.dateFilter);
    }

    private processTable3Data(table3Data: any): void {
        this.moduleRightsSerivice.setRights(table3Data);
    }

    private updatePaginator(): void {
        this.dataLength.emit(this.dataSource.data.length);
        this.dataSource.paginator = this.paginator;
    }

    private resetData() {
        this.displayedColumns = [];
        this.dataSource.data = [];
    }
}
