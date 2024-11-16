import { Component, signal, ChangeDetectionStrategy, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatExpansionModule } from '@angular/material/expansion';
import { UserserviceService } from '../services/user/userservice.service';
import { IUser } from '../types/types';
import { ApiService } from '../services/api/api.service';
import { lastValueFrom } from 'rxjs';
import { groupData } from '../utils/utils';
import { LoaderComponent } from "../components/loader/loader.component";
import { RouteService } from '../services/route/route.service';
import { CommonModule } from '@angular/common';

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
        MatMenuModule
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './pages.component.html',
    styleUrl: './pages.component.scss'
})
export class PagesComponent implements OnInit {
    private router = inject(Router);

    private userService = inject(UserserviceService);

    private apiService = inject(ApiService);

    private routerService = inject(RouteService);

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
        const data: any = this.userService.getCookieData();
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
            this.router.navigate(['/dashboard/data-viewer'], { queryParams: { module: data?.MdlId } })
        }
    }

    public handleLogout() {
        this.userService.logoutService(this.userData.logid, this.userData.UsrId);
        this.router.navigate(['/']);
    }

    private toggleLoadingState() {
        this.isMenuLoading = !this.isMenuLoading;
    }
}
