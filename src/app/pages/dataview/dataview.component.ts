import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, NavigationStart, Router, RouterModule } from '@angular/router';

import { Subscription } from 'rxjs';

import { MatBottomSheet, MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTabChangeEvent, MatTabGroup, MatTabsModule } from '@angular/material/tabs';

import { ApiService } from '../../services/api/api.service';
import { UserserviceService } from '../../services/user/userservice.service';
import { ModuleRightsService } from '../../services/module/module-rights.service';
import { BottomSheetComponent } from '../../components/bottom-sheet/bottom-sheet.component';
import { TableComponent } from '../../components/table/table.component';
import { ActivitesComponent } from "../activites/activites.component";
import { IActivity, IUser, IUserSession } from '../../types/types';

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
        MatTabsModule,
        TableComponent,
        ActivitesComponent
    ],
    templateUrl: './dataview.component.html',
    styleUrl: './dataview.component.scss'
})
export class DataviewComponent implements OnInit, OnDestroy {
    private _bottomSheet = inject(MatBottomSheet);

    private router = inject(Router);

    private activatedRoute = inject(ActivatedRoute);

    private userService = inject(UserserviceService);

    private apiService = inject(ApiService);

    private rightsService = inject(ModuleRightsService);

    private dateFilterSubscription: Subscription | undefined;

    private optionsRightsSubscription: Subscription | undefined;

    private tileTypeData: { title: String, typeStr: String } = {
        title: "",
        typeStr: ""
    };

    public userData: IUserSession = {} as IUserSession;

    public module: String = '';

    public isExpanded: boolean = false;

    public filterValue: String = '';

    public isFilterApplied: boolean = false;

    public dateFilterField: String = '';

    public optionsRights: any;

    public recentActivity: IActivity[] = [];

    public isChild = false;

    public tabIndex: number = 0;

    @ViewChild(MatTabGroup)
    public tabGroup!: MatTabGroup;

    public ngOnInit(): void {
        this.activatedRoute.queryParams.subscribe(params => {
            this.module = params['module'];
            if(params['activity']) {
                this.tabIndex = this.getTabIndexFromActivity('grid_view');
                this.isChild = !this.isChild;
            } else {
                this.tabIndex = 0;
            }
        });

        this.optionsRightsSubscription = this.rightsService.rights$.subscribe((value: any) => {
            this.optionsRights = value;
        });

        this.handleGetUserData();

        this.dateFilterSubscription = this.rightsService.dateFilters$.subscribe((value: String) => {
            this.dateFilterField = value;
        });
    }

    public ngAfterViewInit(): void {
        this.router.events.subscribe((event) => {
            if(event instanceof NavigationStart) {
                const input = document.getElementById('search') as HTMLInputElement;
                if(input) {
                    input.value = '';
                }
                this.closeSearchField();
            }
        });
    }

    public ngOnDestroy() {
        // Unsubscribe to prevent memory leaks
        if (this.dateFilterSubscription) {
            this.dateFilterSubscription.unsubscribe();
        }

        if(this.optionsRightsSubscription) {
            this.optionsRightsSubscription.unsubscribe();
        }
    }

    public getTabIndexFromActivity(activity: string): number {
        const activityTabMap: any = {
            'list_view': 0,
            'grid_view': 1,
        };
        return activityTabMap[activity] ?? 0;
    }

    public handleTabChange(event: MatTabChangeEvent) {
        if(event.index !== 1) {
            this.tabIndex = event.index;
            this.router.navigate([], {
                queryParams: {
                    activity: null,
                },
                queryParamsHandling: 'merge'
            })
        }
    }

    public toggleSearchField(): void {
        this.isExpanded = true;
    }

    public closeSearchField(): void{
        const input = document.getElementById('search') as HTMLInputElement;
        if (!input.value) {
            this.isExpanded = false;
            this.filterValue = '';
        }
    }

    public handleClearFilters() {
        if(this.isFilterApplied) {
            this.isFilterApplied = false
        }
    }

    public handleFilterApplied(event: boolean) {
        this.isFilterApplied = true;
    }

    public handleGetUserData(): void {
        const data: IUserSession = this.userService.getUserData() as IUserSession;
        if(data) {
            this.userData = data;
        }
    }

    public openFilterSheet(): void {
        this._bottomSheet.open(BottomSheetComponent);
    }

    public handleFilterValue(event: Event) {
        const element = event.target as HTMLInputElement;
        this.filterValue = element.value;
    }

    public async handleTabRecentActions() {
        this.isChild = !this.isChild;

        const params = { ...this.activatedRoute.snapshot.params };

        params['activity'] = 'activity';

        this.router.navigate([], {
            queryParams: params,
            queryParamsHandling: 'merge',
        });
    }

    public handleTitleType(event: { title: String, typeStr: String }) {
        if(event.title && event.typeStr) {
            this.tileTypeData = event;
        }
    }

    public handleAddNewDataRoute(action: String) {
        const routeData = sessionStorage.getItem('route');

        let path;

        if(routeData) {
            const { WebPath } = JSON.parse(routeData);
            path = WebPath.replace("~", '');
        }

        const refId = sessionStorage.getItem("refId");

        const url = `${this.userData.AppUrl}${path}?ActionStr=${action}&TitleStr=${this.tileTypeData.typeStr}&MdlId=${this.module}&Module=${this.tileTypeData.title}&User=${this.userData.UsrName}&RefId=${refId}`;

        window.open(url, "_blank");
    }
}
