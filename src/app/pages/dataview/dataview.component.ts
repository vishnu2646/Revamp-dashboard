import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { MatBottomSheet, MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTabChangeEvent, MatTabGroup, MatTabsModule } from '@angular/material/tabs';

import { BottomSheetComponent } from '../../components/bottom-sheet/bottom-sheet.component';
import { UserserviceService } from '../../services/user/userservice.service';
import { IActivity, IRecentActivity, IUser } from '../../types/types';
import { FormsModule } from '@angular/forms';
import { TableComponent } from '../../components/table/table.component';
import { ModuleRightsService } from '../../services/module/module-rights.service';
import { lastValueFrom, Subscription } from 'rxjs';
import { ApiService } from '../../services/api/api.service';
import moment from 'moment';
import { ActivitesComponent } from "../activites/activites.component";

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

    public userData: any;

    public module: String = '';

    public isExpanded: boolean = false;

    public filterValue: String = '';

    public isFilterApplied: boolean = false;

    public dateFilterField: String = '';

    public optionsRights: any;

    public recentActivity: IActivity[] = [];

    public isChild = false;

    @ViewChild(MatTabGroup)
    public tabGroup!: MatTabGroup;

    public tabIndex: number = 0;

    public ngOnInit(): void {
        this.activatedRoute.queryParams.subscribe(params => {
            this.module = params['module'];
            if(params['activity']) {
                this.tabIndex = this.getTabIndexFromActivity('grid_view');
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
        const data: IUser = this.userService.getCookieData() as IUser;
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
}
