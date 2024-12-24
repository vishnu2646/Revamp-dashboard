import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { lastValueFrom, Subscription } from 'rxjs';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';

import { UserserviceService } from '../../services/user/userservice.service';
import { ApiService } from '../../services/api/api.service';
import { LoaderComponent } from "../../components/loader/loader.component";
import { IAttachments, IComments, IHistory, IReport, IUser, IUserSession } from '../../types/types';
import { ExportService } from '../../services/export/export.service';

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
        LoaderComponent,
        MatMenuModule,
    ],
    templateUrl: './details.component.html',
    styleUrl: './details.component.scss'
})

export class DetailsComponent implements OnInit, OnDestroy {
    private router = inject(Router);

    private userService = inject(UserserviceService);

    private apiService = inject(ApiService);

    private seletcedDataSubscription: Subscription | undefined;

    private sanitizer = inject(DomSanitizer);

    private exportService = inject(ExportService);

    private typeStr: String = '';

    public title: String = '';

    public loading = false

    public userData: IUserSession = {}  as IUserSession;

    public recivedData: any;

    public historyData: IHistory[] = [];

    public commentsData: IComments[] = [];

    public attachmentsData: IAttachments[] = [];

    public reportsData: IReport[] = [];

    public selectedDataFirstHalf: any[] = [];

    public selectedDataSecondHalf: any[] = [];

    public optionRights: {[x:string]: 0 | 1} = {};

    public printContent: any;

    public excelReports: any;

    public excelRptLoading = false;

    public toggleOptionsState = {
        comment: false,
        history: false,
        attachment: false,
        dynamicReports: false,
    }

    constructor(private changeDetectorRef: ChangeDetectorRef) {}

    public ngOnInit() {
        this.handleGetUserData();

        this.recivedData = history.state;

        this.getIndividualDetails();
    }

    public ngOnDestroy(): void {
        if (this.seletcedDataSubscription) {
            this.seletcedDataSubscription.unsubscribe();
        }
    }

    public handleGetUserData(): void {
        const data: IUserSession = this.userService.getUserData() as IUserSession;
        if(data) {
            this.userData = data;
        }
    }

    public handleToggleOptionsState(option: string) {

        this.toggleOptionsState = {
            comment: false,
            history: false,
            attachment: false,
            dynamicReports: false
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

        const refId = sessionStorage.getItem("refId");
        const url = `${this.userData.AppUrl}${path}?ActionStr=${action}&PrimeIdStr=${linkData.primeId}&TitleStr=${typeStr}&MdlId=${linkData.mdlId}&Module=${title}&User=${this.userData.UsrName}&RefId=${refId}`;
        console.log(url);

        window.open(url, '_blank');
    }

    public async handleShowReport(report: IReport): Promise<void> {
        const { idData, data } = this.recivedData;

        if(report.ExcelOutput) {
            const params = {
                titleStr: this.typeStr,
                primeId: this.recivedData.primeid || data[idData.primeId],
                mdlId: this.recivedData.mdlid || idData.mdlId,
                user: this.userData.UsrName,
                htmlRpt: report.ReportTitle,
                filterCondition: this.recivedData.primeid || data[idData.primeId]
            }
            this.excelRptLoading = !this.excelRptLoading;
            try {
                const responseData: any = await lastValueFrom(this.apiService.getExcelReportGenerateService(params));
                if(responseData && responseData['GetExcelDocument1']) {
                    this.excelReports = responseData['GetExcelDocument1'].Table[0];
                }
            } catch (error) {
                console.log(error);
            }
            this.excelRptLoading = !this.excelRptLoading;
            this.handleToggleOptionsState('dynamicReports');
        } else {
            const params = {
                mdlId: this.recivedData.mdlid || idData.mdlId,
                user: this.userData.UsrName,
                primeId: this.recivedData.primeid || data[idData.primeId],
                filename: report.ReportTitle
            }
            try {
                this.apiService.getReportService(params).subscribe((data: any) => {
                    this.exportService.handleShowPreview(data.GetHtmlReportString);
                })
            } catch (error) {
                console.log('error:', error)
            }
        }
    }

    public handleDownloadFile(type: 'pdf' | 'excel' ) {
        let path;
        if(type === 'pdf') {
            path = this.excelReports.RevPDFPath;
        } else if(type === 'excel') {
            path = this.excelReports.RevXlPath
        }
        window.open(path, 'download');
    }

    // public handlePrint() {
    //     const printWindow = window.open('', '', 'height=600,width=800');
    //     console.log(this.printContent);
    //     printWindow?.document.write(this.printContent['changingThisBreaksApplicationSecurity']);
    //     printWindow?.document.close();
    //     printWindow?.print();
    // }

    private async getIndividualDetails(): Promise<void> {
        const { idData, data, typeStr } = this.recivedData;
        this.typeStr = typeStr
        this.loading = !this.loading;
        const primeId = this.recivedData.primeid || data[idData.primeId];
        const mdlId =  this.recivedData.mdlid || idData?.mdlId || this.recivedData.Module;
        if(this.recivedData) {
            try {
                const responseData = await lastValueFrom(this.apiService.getIndividualDataService(mdlId, primeId ,this.userData.UsrId));
                if(responseData['HistoryCommentsDetails']) {
                    const { Table, Table3, Table6, Table7, Table8, Table9, Table10 } = responseData['HistoryCommentsDetails'];
                    this.selectedDataFirstHalf = this.splitObject(Table[0], 0, Math.ceil(Object.keys(Table[0]).length / 2));
                    this.selectedDataSecondHalf = this.splitObject(Table[0], Math.ceil(Object.keys(Table[0]).length / 2), Object.keys(Table[0]).length);
                    this.optionRights = Table3[0];
                    this.reportsData = Table6;
                    this.historyData = Table7;
                    this.attachmentsData = Table8;
                    this.commentsData = Table9;
                    this.title = Table10[0].TitleStr
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
