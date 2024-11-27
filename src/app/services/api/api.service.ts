import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
// import { ConfigService } from '../config/config.service';
import { IRecentActivity, IReportDetails } from '../../types/types';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private key: String = '';

    private httpClient = inject(HttpClient);

    private baseUrl = 'https://rmpapi.iworkx.in';

    public getMenuService(id: number): Observable<any> {
        const key = sessionStorage.getItem('key');
        return this.httpClient.get(`${this.baseUrl}/GetMenuLogin?Userid=${id}&databaseKey=${key}`)
    }

    public getDashboardService(user: String): Observable<any> {
        const key = sessionStorage.getItem('key');
        return this.httpClient.get(`${this.baseUrl}/DashboardData?User=${user}&databaseKey=${key}`)
    }

    public getDashboardActivationService(userId: number, authCode: String, logId: number): Observable<any> {
        const key = sessionStorage.getItem('key');
        return this.httpClient.get(`${this.baseUrl}/GetAspSessionId?UsrId=${userId}&Authcode=${authCode}&Logid=${logId}&databaseKey=${key}`)
    }

    public getDashboardIndividualDataService(id: number,user: String): Observable<any> {
        const key = sessionStorage.getItem('key');
        return this.httpClient.get(`${this.baseUrl}/DashboardIndividualData?User=${user}&DsbId=${id}&databaseKey=${key}`);
    }

    public getMenuExplorerService(mdlId: String, usrId: number): Observable<any> {
        const key = sessionStorage.getItem('key');
        return this.httpClient.get(`${this.baseUrl}/MenuExplr?MdlId=${mdlId}&UserId=${usrId}&databaseKey=${key}`);
    }

    public getIndividualDataService(mdlId: String, id: number, usrId: number): Observable<any> {
        const key = sessionStorage.getItem('key');
        return this.httpClient.get(`${this.baseUrl}/GetIndividualData?MdlId=${mdlId}&ID=${id}&UserId=${usrId}&databaseKey=${key}`);
    }

    public getReportService(data: any): Observable<IReportDetails> {
        const key = sessionStorage.getItem('key');
        const { mdlId, user, primeId, filename } = data;
        return this.httpClient.get<IReportDetails>(`${this.baseUrl}/GetHtmlReportString?_mdlid=${mdlId}&_User=${user}&_primeid=${primeId}&_FilterCondition=${primeId}&_LotId=0&_HTMLFileName=${filename}&databaseKey=${key}`);
    }

    public getRecentActivityService(data: any): Observable<IRecentActivity> {
        const key = sessionStorage.getItem('key');
        const { mdlId, user, fromDate, toDate, actionType } = data;
        return this.httpClient.get<IRecentActivity>(`${this.baseUrl}/GetRecentActivity?MdlId=${mdlId}&User=${user}&FromDate=${fromDate}&ToDate=${toDate}&ActionType=${actionType}&databaseKey=${key}`);
    }

    public getReportData(username: String) {
        const key = sessionStorage.getItem('key');
        return this.httpClient.get(`${this.baseUrl}/AdvRpt-GetReportList?User=${username}&databaseKey=${key}`)
    }

    public getReportFieldsData(username: String, id: number, Sid: String="sasi"): Observable<any> {
        const key = sessionStorage.getItem('key');
        return this.httpClient.get(`${this.baseUrl}/AdvRpt-GetUserControls?User=${username}&databaseKey=${key}&Rptid=${id}&SessId=${Sid}`);
    }

    public getAdvanceReportExcelGenerateService(data: any): any {
        const { pimeidStr, mdlId, userName, htmlRpt } = data;
        const key = sessionStorage.getItem('key');
        return this.httpClient.get(`${this.baseUrl}/GetExcelDocumentV3?PrimeIdStr=${pimeidStr}&MdlId=${mdlId}&User=${userName}&HTMLRpt=${htmlRpt}&databaseKey=${key}`)
    }

    public getReportGenerateData(data: any): any {
        const key = sessionStorage.getItem('key');
        return this.httpClient.post(`${this.baseUrl}/AdvRpt-CreateCallId?databaseKey=${key}`, data);
    }
    public getExcelReportGenerateService(data: any) {
        const { titleStr, primeId, mdlId, user, htmlRpt, filterCondition } = data;
        const key = sessionStorage.getItem('key');
        return this.httpClient.get(`${this.baseUrl}/GetExcelDocument?TitleStr=${titleStr}&PrimeIdStr=${primeId}&MdlId=${mdlId}&User=${user}&HTMLRpt=${htmlRpt}&FilterCondition=${filterCondition}&databaseKey=${key}`)
    }
}
