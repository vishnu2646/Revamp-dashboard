import { Component, signal, ChangeDetectionStrategy, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { lastValueFrom } from 'rxjs';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';

import { LoaderComponent } from "../components/loader/loader.component";
import { UserserviceService } from '../services/user/userservice.service';
import { ApiService } from '../services/api/api.service';
import { groupData } from '../utils/utils';

@Component({
    selector: 'app-pages',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        MatSidenavModule,
        MatButtonModule,
        MatIconModule,
        MatExpansionModule,
        LoaderComponent,
        MatMenuModule,
        MatTooltipModule
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './pages.component.html',
    styleUrl: './pages.component.scss'
})
export class PagesComponent implements OnInit {
    private router = inject(Router);

    private userService = inject(UserserviceService);

    private apiService = inject(ApiService);

    public readonly panelOpenState = signal(false);

    public userData: any;

    public groupData: any = [];

    public groupedKeys: String[] = [];

    public isMenuLoading = false;

    public selectedNav: any;

    constructor(private changeDetectorRef: ChangeDetectorRef) {}

    public ngOnInit() {
        this.handleGetUserData();
        this.hangleGetMenu();
    }

    public handleGetUserData() {
        const data: any = this.userService.getUserData();
        if(data) {
            this.userData = data;
        }
    }

    public async hangleGetMenu(): Promise<void> {
        this.isMenuLoading = !this.isMenuLoading;
        try {
            const responseData = await lastValueFrom(this.apiService.getMenuService(this.userData.UsrId));
            if(responseData && responseData['GetMenuLogin']) {
                this.groupData = groupData(responseData['GetMenuLogin'].Table, 'MdlType');
                if(this.groupData) {
                    this.groupedKeys = Object.keys(this.groupData);
                }
            }
        } catch (error) {
            console.log(error);
        } finally {
            this.toggleLoadingState();
            this.changeDetectorRef.detectChanges();
        }
    }

    public handleNavigate(data: any, isActivity: boolean): void {
        sessionStorage.setItem('route', JSON.stringify(data));
        this.selectedNav = data;

        if (isActivity) {
            this.router.navigate(['/dashboard/activites'], { queryParams: { module: 'all', activity: 'activity' } })
        } else {
            if(data?.MdlId === "AdvanceRmpReportSetup_PrjCls") {
                this.router.navigate(['/dashboard/advance-report']);
            } else {
                this.router.navigate(['/dashboard/data-viewer'], { queryParams: { module: data?.MdlId } })
            }
        }
    }

    public handleLogout() {
        const key = this.userService.getUserData();
        this.router.navigate(['/'], { queryParams: { key: key } });
        this.userService.logoutService(this.userData.logid, this.userData.UsrId);
    }

    private toggleLoadingState() {
        this.isMenuLoading = !this.isMenuLoading;
    }
}
