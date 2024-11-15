import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';

import { MatBottomSheet, MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';

import { BottomSheetComponent } from '../../components/bottom-sheet/bottom-sheet.component';
import { UserserviceService } from '../../services/user/userservice.service';
import { IUser } from '../../types/types';
import { FormsModule } from '@angular/forms';
import { TableComponent } from '../../components/table/table.component';
import { ModuleRightsService } from '../../services/module/module-rights.service';
import { Subscription } from 'rxjs';

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
        TableComponent
    ],
    templateUrl: './dataview.component.html',
    styleUrl: './dataview.component.scss'
})
export class DataviewComponent implements OnInit, OnDestroy {
    private _bottomSheet = inject(MatBottomSheet);

    private activatedRoute = inject(ActivatedRoute);

    private userService = inject(UserserviceService);

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

    public ngOnInit(): void {
        this.activatedRoute.queryParams.subscribe(params => {
            this.module = params['module'];
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
}
