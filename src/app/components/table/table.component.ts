import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild, inject, output } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ApiService } from '../../services/api/api.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { lastValueFrom, Subscription } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { LoaderComponent } from "../loader/loader.component";
import moment from 'moment';
import { DateFilterService } from '../../services/filter/date-filter.service';
import { ModuleRightsService } from '../../services/module/module-rights.service';
import { UserserviceService } from '../../services/user/userservice.service';
import { IUser } from '../../types/types';

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

    private userService = inject(UserserviceService);

    private moduleRightsSerivice = inject(ModuleRightsService);

    private filterSubscription: Subscription | null = null;

    private detailsData = {
        mdlId: '',
        primeId: ''
    }

    private typeStr: String = '';

    public title: String = '';

    public isLoadingResults = false;

    public displayedColumns: string[] = [];

    public dataSource = new MatTableDataSource<any>();

    public tempData: any[] = [];

    public filterValue: String = '';

    public visiblityRights: any;

    public dateFilter: String = '';

    public userData: any;

    @Input()
    public isFilterApplied: boolean = false;


    @Input()
    public module: String = '';

    @ViewChild(MatPaginator)
    public paginator!: MatPaginator;

    @Output()
    public dataLength = new EventEmitter<number>();

    @Output()
    public filterApplied = new EventEmitter<boolean>();

    constructor() {
        this.handleGetUserData();
        this.router.events.subscribe((val)  => {
            if(val instanceof NavigationEnd) {
                this.module = val.url.split("=")[1];
                this.handleGetMenuExplorerData(this.module)
            }
        });
    }

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

    public handleGetUserData() {
        const data: IUser = this.userService.getCookieData() as IUser;
        if(data) {
            this.userData = data;
        }
    }

    public async handleGetMenuExplorerData(module?: String): Promise<void> {
        this.toggleLoadingState();
        try {
            const responseData = await this.fetchMenuExplorerData(module);
            if (this.isValidResponse(responseData)) {
                if(responseData['CheckMenuExplr'].Table1.length > 0) {
                    this.processTable1Data(responseData['CheckMenuExplr'].Table1);
                }
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
        this.router.navigateByUrl('/dashboard/details', { state: { idData: this.detailsData, data: row, title: this.title, typeStr: this.typeStr } });
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

    private async fetchMenuExplorerData(module?: String) {
        if(!module) {
            return lastValueFrom(this.apiService.getMenuExplorerService(this.module, this.userData.UsrId));
        } else {
            return lastValueFrom(this.apiService.getMenuExplorerService(module, this.userData.UsrId));
        }
    }

    private isValidResponse(responseData: any): boolean {
        return responseData && responseData['CheckMenuExplr'] && responseData['CheckMenuExplr'].Table.length > 0;
    }

    public processTable1Data(data: any) {
        const explorer = data[0];
        this.visiblityRights = explorer.IN_IsExplrNeed.split('|');
        this.title = explorer.IN_TitleStr;
        this.typeStr = explorer.IN_TypeStr;
        this.detailsData = {
            mdlId: this.module.toString(),
            primeId: explorer.IN_PrimdId
        }
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
