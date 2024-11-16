import { Component, inject, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserserviceService } from '../../services/user/userservice.service';
import { IActivity, IRecentActivity, IUser } from '../../types/types';
import { distinctUntilChanged, lastValueFrom } from 'rxjs';
import { ApiService } from '../../services/api/api.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from "../../components/loader/loader.component";
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

@Component({
    selector: 'app-activites',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        MatTableModule,
        LoaderComponent,
        MatPaginatorModule
    ],
    templateUrl: './activites.component.html',
    styleUrl: './activites.component.scss'
})
export class ActivitesComponent {

    private router = inject(Router);

    private activatedRoute = inject(ActivatedRoute);

    private apiService = inject(ApiService);

    private userService = inject(UserserviceService);

    public module: String = '';

    public activity: String = '';

    public userData: any;

    public dataSource: MatTableDataSource<IActivity> = new MatTableDataSource<IActivity>();;

    public displayColumns: string[] = [];

    public isLoadingResults: boolean = false;

    @ViewChild(MatPaginator)
    public paginator!: MatPaginator;

    @Input()
    public isChild: boolean = false;

    constructor() {
        this.activatedRoute.queryParams.subscribe(params => {
            this.module = params['module'];
            this.activity = params['activity'];
        });
        if(this.activity) {
            this.handleGetUserData();
            this.handleGetActivityData();
        }
    }

    public ngOnChanges(simpeleChanges: SimpleChanges) {
        if(simpeleChanges['isChild']?.currentValue) {
            this.handleGetUserData();
            this.handleGetActivityData();
        }
    }

    public handleGetUserData(): void {
        const data: IUser = this.userService.getCookieData() as IUser;
        if(data) {
            this.userData = data;
        }
    }

    public async handleGetActivityData() {
        this.isLoadingResults = !this.isLoadingResults;

        try {
            const data = {
                mdlId: this.module,
                user: this.userData.UsrName,
                fromDate: '2024-06-01',
                toDate: '2024-10-31',
                actionType: 'all'
            }
            const responseData: IRecentActivity = await lastValueFrom(this.apiService.getRecentActivityService(data));
            if(responseData.GetRecentActivity) {
                const columns = Object.keys(responseData.GetRecentActivity.Table[0]);
                const filteredColumns = columns.filter(column => column !== 'mdlid' && column !== 'primeid');
                this.displayColumns = ['Links', ...filteredColumns];
                this.dataSource.data = responseData.GetRecentActivity.Table;
                this.dataSource.paginator = this.paginator;
                this.isLoadingResults = !this.isLoadingResults;
            }
        } catch (error) {
            console.log(error);
        }
    }

    public handleViewDetails(activity: any) {
        this.router.navigateByUrl('/dashboard/details', { state: activity });
    }

    public handleNativateActivity() {
        this.router.navigate(['/dashboard/activites'], { queryParams: { module: 'all', activity: 'activity' } })
    }
}
