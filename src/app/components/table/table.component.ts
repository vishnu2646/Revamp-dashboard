import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild, inject, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ApiService } from '../../services/api/api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { distinctUntilChanged, lastValueFrom, Subscription } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { LoaderComponent } from "../loader/loader.component";
import moment from 'moment';
import { DateFilterService } from '../../services/filter/date-filter.service';
import { ModuleRightsService } from '../../services/module/module-rights.service';
import { UserserviceService } from '../../services/user/userservice.service';
import { IUser } from '../../types/types';
import { isDefined } from '../../utils/utils';
import { MatMenuModule } from '@angular/material/menu';
import { ExportService } from '../../services/export/export.service';
import { FilterPipe } from "../../pipes/filter/filter.pipe";

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
        MatMenuModule,
    ],
    templateUrl: './table.component.html',
    styleUrl: './table.component.scss'
})
export class TableComponent implements OnInit, OnChanges, OnDestroy {
    private  apiService = inject(ApiService);

    private activatedRoute = inject(ActivatedRoute);

    private router = inject(Router);

    private filterService = inject(DateFilterService);

    private userService = inject(UserserviceService);

    private moduleRightsSerivice = inject(ModuleRightsService);

    private exportSerivice = inject(ExportService);

    private filterSubscription: Subscription | null = null;

    private queryParamsSubscription: Subscription | null = null;

    private detailsData = {
        mdlId: '',
        primeId: ''
    }

    private tableConfigs: { [key: string]: String } = {}

    private typeStr: String = '';

    public title: String = '';

    public isLoadingResults = false;

    public displayedColumns: string[] = [];

    public dataSource = new MatTableDataSource<any>();

    public tempData: any[] = [];

    public visiblityRights: any;

    public dateFilter: String = '';

    public userData: any;

    public daterange = '';

    public totals: any;

    @Input()
    public filterValue: String = '';

    @Input()
    public isFilterApplied: boolean = false;

    @Input()
    public module: String = '';

    @ViewChild(MatPaginator)
    public paginator!: MatPaginator;

    @Output()
    public filterApplied = new EventEmitter<boolean>();

    public ngOnInit(): void {
        this.handleGetUserData();

        this.queryParamsSubscription = this.activatedRoute.queryParams.pipe(
            distinctUntilChanged((prev, curr) => prev['module'] === curr['module'])
        ).subscribe(params => {
            this.module = params['module'];
            if(isDefined(this.module)) {
                this.handleGetMenuExplorerData(this.module)
            }
        });

        this.filterSubscription = this.filterService.filter$.subscribe(filter => {
            if (filter.fromDate && filter.toDate) {
                this.daterange = `Filtered data from ${moment(filter.fromDate).format('L')} to ${moment(filter.toDate).format('L')}`;
                this.filterByDate(filter.fromDate, filter.toDate);
            }
        });
    }

    public ngOnChanges(simpleChanges: SimpleChanges): void {
        if(simpleChanges['filterValue']?.currentValue) {
            this.dataSource.filter = simpleChanges['filterValue']?.currentValue;
            this.getTotals();
        } else {
            this.dataSource.filter = '';
        }

        if(simpleChanges['isFilterApplied']?.currentValue) {
            this.isFilterApplied = simpleChanges['isFilterApplied']?.currentValue;
            this.getTotals();

        } else {
            this.isFilterApplied = false;
            this.dataSource.data = [...this.tempData];
            this.daterange = '';
        }
    }

    public ngOnDestroy() {
        if(this.filterSubscription) {
            this.filterSubscription.unsubscribe();
        } else if(this.queryParamsSubscription) {
            this.queryParamsSubscription.unsubscribe();
        }
    }

    public handleGetUserData() {
        const data: IUser = this.userService.getCookieData() as IUser;
        if(data) {
            this.userData = data;
        }
    }

    public async handleGetMenuExplorerData(module: String): Promise<void> {
        this.toggleLoadingState();
        try {
            const responseData = await this.fetchMenuExplorerData(module);
            if (this.isValidResponse(responseData)) {
                if(responseData['CheckMenuExplr'].Table1.length > 0) {
                    this.processTable1Data(responseData['CheckMenuExplr'].Table1[0]);
                }
                this.processTableData(responseData['CheckMenuExplr'].Table);
                this.processTableRights(responseData['CheckMenuExplr'].Table1[0]);
                this.getTotals();

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
        this.router.navigateByUrl('/dashboard/details', { state: { idData: this.detailsData, data: row, title: this.title, typeStr: this.typeStr } });
    }

    public handleExport(type: String) {
        if(type === 'xlsx') {
            this.exportSerivice.handleExportService('xlsx', this.tempData, this.displayedColumns, this.title)
        } else if(type === 'csv') {
            this.exportSerivice.handleExportService('csv', this.tempData, this.displayedColumns, this.title)
        }
    }

    private filterByDate(fromDate: any, toDate: any): void {
        const startDate = new Date(fromDate);
        const endDate = new Date(toDate);
        const filteredData = this.dataSource.data.filter((item: any) => {
            const itemDate = new Date(item[this.dateFilter.toString()]);
            return itemDate >= startDate && itemDate <= endDate;
        });

        this.dataSource.data = filteredData;
    }

    private toggleLoadingState(): void {
        this.isLoadingResults = !this.isLoadingResults;
    }

    private async fetchMenuExplorerData(module: String) {
        if(module.length > 0) {
            return lastValueFrom(this.apiService.getMenuExplorerService(module, this.userData.UsrId));
        }
    }

    private isValidResponse(responseData: any): boolean {
        return responseData && responseData['CheckMenuExplr'] && responseData['CheckMenuExplr'].Table.length > 0;
    }

    private processTable1Data(data: any) {
        this.tableConfigs = data;
        this.visiblityRights = this.tableConfigs['IN_IsExplrNeed'].split('|');
        this.title = this.tableConfigs['IN_TitleStr'];
        this.typeStr = this.tableConfigs['IN_TypeStr;']
        this.detailsData = {
            mdlId: this.module.toString(),
            primeId: this.tableConfigs['IN_PrimdId'].toString(),
        }
    }

    private getTotals() {

        if(this.filterValue.length === 0) {
            this.dataSource.filteredData = [...this.tempData];
        }

        const values = this.tableConfigs['IN_DisplayFormat'].split('|');
        const arr: String[] = [];

        for(let i = 0; i < values.length; i++) {
            if(values[i] === 'R-N-2') {
                arr.push(this.displayedColumns[i]);
            }
        };

        const totals = arr.reduce((acc: any, column: String) => {
            acc[column.toString()] = 0;
            return acc;
        }, {});

        this.dataSource.filteredData.forEach(item => {
            arr.forEach((col: String) => {
                if(item[col.toString()] !== undefined) {
                    totals[col.toString()] += item[col.toString()];
                }
            });
        });

        this.totals = totals;
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
        this.dataSource.paginator = this.paginator;
    }

    private resetData() {
        this.displayedColumns = [];
        this.dataSource.data = [];
    }
}
