import { Component, signal, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { UserserviceService } from '../services/user/userservice.service';
import { IUser } from '../types/types';
import { ApiService } from '../services/api/api.service';
import { lastValueFrom } from 'rxjs';
import { groupData } from '../utils/utils';
import { LoaderComponent } from "../components/loader/loader.component";

@Component({
    selector: 'app-pages',
    standalone: true,
    imports: [
    RouterModule,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    LoaderComponent
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

    public userData: IUser = {} as IUser;

    public groupData: any = [];

    public groupedKeys: String[] = [];

    public isMenuLoading = false;

    public ngOnInit() {
        this.handleGetUserData();
        this.hangleGetMenu();
    }

    public handleGetUserData() {
        const data: IUser = this.userService.getCookieData() as IUser;
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
            this.isMenuLoading = !this.isMenuLoading;
        }
    }

    public handleNavigate(data: any) {
        this.router.navigate(['/dashboard/data-viewer'], { queryParams: { module: data?.MdlId } })
    }

    public handleLogout() {
        this.userService.logoutService();
        this.router.navigate(['/auth/login']);
    }
}
