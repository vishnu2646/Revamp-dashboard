import { Component, signal, ChangeDetectionStrategy, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { catchError, lastValueFrom, of } from 'rxjs';

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
import { MatDialog } from '@angular/material/dialog';
import { ActivationDialogComponent } from '../components/activation-dialog/activation-dialog.component';
import { IGroupData, IUserSession } from '../types/types';

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

    private cd = inject(ChangeDetectorRef);

    private window: any;

    public disableActivation = false;

    public readonly panelOpenState = signal(false);

    public userData: IUserSession = {} as IUserSession;

    public groupData: IGroupData = {} as IGroupData;

    public groupedKeys: String[] = [];

    public isMenuLoading = false;

    public selectedNav: any;

    public ngOnInit() {
        this.handleGetUserData();
        this.hangleGetMenu();
        this.handleActivationDisable();
    }

    public handleGetUserData() {
        const data: IUserSession | String = this.userService.getUserData();
        if(typeof data !== 'string') {
            this.userData = data as IUserSession;
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
            this.cd.detectChanges();
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
        const key = this.userService.getCookieData();
        this.router.navigate(['/'], { queryParams: { key: key } });
        this.userService.logoutService(this.userData.logid, this.userData.UsrId);
    }

    public handleRefresh() {
        this.userService.triggerRefresh();
    }

    private readonly activationDialog = inject(MatDialog);

    public handleSendActivation() {

        const refId = sessionStorage.getItem('refId');

        if(refId && refId.length > 0) {
            return;
        }

        const url = `${this.userData.AppUrl}/AuthStart_prj/AuthStart_prj.aspx?User=${this.userData.UsrId}&AuthCode=${this.userData.AuthCode}&Logid=${this.userData.logid}`;
        this.openAspxWindow(url)

        // Gets the refrence to the dialog.
        // To open the dialog automatically when dashboard is loaded.
        const dialogRef = this.activationDialog.open(ActivationDialogComponent);

        dialogRef.afterClosed().pipe(
            catchError(error => {
                console.log("Activation Falied", error);
                return of(null);
            })
        ).subscribe({
            next: () => {
                this.closeAspxWindow();
            }
        });
    }

    private openAspxWindow(url: string) {
        this.window = window.open(url, '_blank');
    }

    private closeAspxWindow() {
        this.handleActivationDisable()
        this.window.close();
    }

    private toggleLoadingState() {
        this.isMenuLoading = !this.isMenuLoading;
    }

    private handleActivationDisable() {
        const refId = sessionStorage.getItem('refId');

        if(refId && refId.length > 0) {
            this.disableActivation = true;
        } else {
            this.disableActivation = false;
        }
    }
}
