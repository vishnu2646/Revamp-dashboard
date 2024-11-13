import { Component, inject, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { UserserviceService } from '../../services/user/userservice.service';
import { IAttachments, IComments, IHistory, IReport, IUser } from '../../types/types';
import { lastValueFrom, Subscription } from 'rxjs';
import { ApiService } from '../../services/api/api.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LoaderComponent } from "../../components/loader/loader.component";
import { Router } from '@angular/router';
import { RouteService } from '../../services/route/route.service';


@Component({
    selector: 'app-details',
    standalone: true,
    imports: [
        CommonModule,
        MatIconModule,
        MatButtonModule,
        MatCardModule,
        MatToolbarModule,
        MatListModule,
        MatBadgeModule,
        MatTooltipModule,
        LoaderComponent
    ],
    templateUrl: './details.component.html',
    styleUrl: './details.component.scss'
})

export class DetailsComponent implements OnInit, OnDestroy {
    private router = inject(Router);

    private userService = inject(UserserviceService);

    private apiService = inject(ApiService);

    private routerService = inject(RouteService);

    private seletcedDataSubscription: Subscription | undefined;

    private typeStr: String = '';

    public title: String = '';

    public loading = false

    public userData: any;

    public recivedData: any;

    public historyData: IHistory[] = [];

    public commentsData: IComments[] = [];

    public attachmentsData: IAttachments[] = [];

    public reportsData: IReport[] = [];

    public selectedDataFirstHalf: any[] = [];

    public selectedDataSecondHalf: any[] = [];

    public optionRights: any = {};

    public toggleOptionsState = {
        comment: false,
        history: false,
    }

    constructor(private changeDetectorRef: ChangeDetectorRef) {}

    public ngOnInit() {
        this.handleGetUserData();

        this.recivedData = history.state;

        this.getIndividualDetails();
    }

    public ngOnDestroy(): void {
        // Make sure to unsubscribe when the component is destroyed
        if (this.seletcedDataSubscription) {
            this.seletcedDataSubscription.unsubscribe();
        }
    }

    public handleGetUserData(): void {
        const data: IUser = this.userService.getCookieData() as IUser;
        if(data) {
            this.userData = data;
        }
    }

    public handleToggleOptionsState(option: string) {
        this.toggleOptionsState = {
            comment: false,
            history: false
        };

        this.toggleOptionsState[option as keyof typeof this.toggleOptionsState] = !this.toggleOptionsState[option as keyof typeof this.toggleOptionsState];
    }

    public parseDate(dateStr: String): Date {
        return new Date(dateStr.toString());
    }

    public handleEditRouter(action: String) {
        const routeData = sessionStorage.getItem('route');
        let path;
        if(routeData) {
            const { WebPath } = JSON.parse(routeData);
            path = WebPath.replace("~", '');
        }

        const { idData, data, title, typeStr } = this.recivedData;

        const linkData =  {
            mdlId: idData.mdlId,
            primeId: data[idData.primeId],
        }
        const url=`http://annamfoods.revampapps.com${path}?ActionStr=${action}&PrimeIdStr=${linkData.primeId}&TitleStr=${typeStr}&MdlId=${linkData.mdlId}&Module=${title}&User=${this.userData.UsrName}&RefId=${this.userData.sessionId}`
        window.open(url, '_blank');
    }

    private async getIndividualDetails(): Promise<void> {
        const { idData, data, title, typeStr } = this.recivedData;
        this.title = title;
        this.typeStr = typeStr
        this.loading = !this.loading;
        if(this.recivedData) {
            try {
                const responseData = await lastValueFrom(this.apiService.getIndividualDataService(idData?.mdlId, data[idData.primeId] ,this.userData.UsrId));
                if(responseData['HistoryCommentsDetails']) {
                    const { Table, Table3, Table6, Table7, Table8, Table9 } = responseData['HistoryCommentsDetails'];
                    this.selectedDataFirstHalf = this.splitObject(Table[0], 0, Math.ceil(Object.keys(Table[0]).length / 2));
                    this.selectedDataSecondHalf = this.splitObject(Table[0], Math.ceil(Object.keys(Table[0]).length / 2), Object.keys(Table[0]).length);
                    this.optionRights = Table3[0];
                    this.reportsData = Table6;
                    this.historyData = Table7;
                    this.attachmentsData = Table8;
                    this.commentsData = Table9;
                }
            } catch (error) {
                console.error(error);
            } finally {
                this.toggleLoadingState();
                this.changeDetectorRef.detectChanges();
            }
        }
    }

    private splitObject(obj: any, start: number, end: number): any {
        const keys = Object.keys(obj).slice(start, end);
        const result: any = {};
        keys.forEach(key => {
            result[key] = obj[key];
        });
        return result;
    }

    private toggleLoadingState() {
        this.loading = !this.loading;
    }
}
