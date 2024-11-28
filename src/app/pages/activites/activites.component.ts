import { ChangeDetectorRef, Component, inject, Input, OnChanges, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserserviceService } from '../../services/user/userservice.service';
import { IActivity, IRecentActivity, IUser } from '../../types/types';
import { distinctUntilChanged, lastValueFrom, Subscription } from 'rxjs';
import { ApiService } from '../../services/api/api.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonModule, DatePipe } from '@angular/common';
import { LoaderComponent } from "../../components/loader/loader.component";
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../../components/dialog/dialog.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { provideNativeDateAdapter } from '@angular/material/core';

@Component({
    selector: 'app-activites',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        MatTableModule,
        LoaderComponent,
        MatPaginatorModule,
        FormsModule,
        MatInputModule,
        MatIconModule,
        MatButtonModule,
        MatDatepickerModule,
        MatSelectModule
    ],
    providers: [
        provideNativeDateAdapter(),
    ],
    templateUrl: './activites.component.html',
    styleUrl: './activites.component.scss'
})
export class ActivitesComponent {
    private router = inject(Router);

    private activatedRoute = inject(ActivatedRoute);

    private apiService = inject(ApiService);

    private userService = inject(UserserviceService);

    private dialog = inject(MatDialog);

    private dialogRef: any;

    private cd = inject(ChangeDetectorRef);

    public module: String = '';

    public activity: String = '';

    public userData: any;

    public dataSource: MatTableDataSource<IActivity> = new MatTableDataSource<IActivity>();

    public displayColumns: string[] = [];

    public isLoadingResults: boolean = false;

    @ViewChild(MatPaginator)
    public paginator!: MatPaginator;

    @Input()
    public isChild: boolean = false;

    public toggleFilter: boolean = false;

    public username: string[] = [];

    public modules: string[] = [];

    public filterFields = {
        actiontime: "",
        username: "",
        module: "",
    }

    constructor() {
        this.activatedRoute.queryParams.subscribe(params => {
            this.module = params['module'];
            this.activity = params['activity'];
        });

        if(this.router.url.includes("activites")) {
            this.toggleFilter = !this.toggleFilter;
        }

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
        const data: IUser = this.userService.getUserData() as IUser;
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
                let filteredColumns;
                const columns = Object.keys(responseData.GetRecentActivity.Table[0]) || [];
                if(this.isChild) {
                    filteredColumns = columns.filter(column => column !== 'Module' && column !== 'primeid');
                } else {
                    filteredColumns = columns.filter(column => column !=='primeid');
                }
                this.displayColumns = ['Links', ...filteredColumns];
                this.dataSource.data = responseData.GetRecentActivity.Table;
                this.dataSource.paginator = this.paginator;
                this.isLoadingResults = !this.isLoadingResults;
            }
        } catch (error) {
            console.log(error);
            this.isLoadingResults = !this.isLoadingResults;
        }
    }

    public applyFilter() {
        this.dataSource.filterPredicate = this.activitesFilter()
        this.dataSource.filter = JSON.stringify(this.filterFields);
        this.dialog.closeAll();
    }

    public clearFilter() {
        this.filterFields = {
            actiontime: '',
            username: '',
            module: '',
        };
        this.dataSource.filter = '';
    }

    public handleViewDetails(activity: any) {
        this.router.navigateByUrl('/dashboard/details', { state: activity });
    }

    public handleNativateActivity() {
        this.router.navigate(['/dashboard/activites'], { queryParams: { module: 'all', activity: 'activity' } })
    }

    public openDialog(content: TemplateRef<any>, actions: TemplateRef<any>) {
        this.dialogRef = this.dialog.open(DialogComponent, {
            data: {
                title: 'Filter Recent Activity',
            }
        });

        const dialogInstance = this.dialogRef.componentInstance;
        dialogInstance.content = content;
        dialogInstance.actions = actions;

        this.dataSource.data.forEach(data => {
            if(!this.modules.toString().toLowerCase().includes(data.Module.toString().toLowerCase())) {
                this.modules.push(data.Module.toString());
            } else if(!this.username.includes(data.Username.toString())) {
                this.username.push(data.Username.toString());
            }
        })
    }

    public handleCloseDialog() {
        this.dialog.closeAll();
    }

    private activitesFilter() {
        return (data: any, filter: string): boolean => {
            const filterObj = JSON.parse(filter);

            return (
                (!filterObj.actiontime || data.actiontime.includes(filterObj.actiontime) &&
                (!filterObj.username || data.Username.includes(filterObj.username)) &&
                (!filterObj.module) || data.Module.includes(filterObj.module))
            )
        }
    }
}
