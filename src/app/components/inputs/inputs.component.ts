import { Component, inject, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { UserserviceService } from '../../services/user/userservice.service';
import { IReport } from '../../types/types';
import { lastValueFrom } from 'rxjs';
import { ApiService } from '../../services/api/api.service';
import { mapRelatedTable } from '../../utils/utils';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { LoaderComponent } from '../loader/loader.component';
import { HttpClient } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
    selector: 'app-inputs',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatButtonModule,
        MatCardModule,
        LoaderComponent,
        MatTableModule,
        MatTabsModule
    ],
    providers: [provideNativeDateAdapter()],
    templateUrl: './inputs.component.html',
    styleUrl: './inputs.component.scss'
})
export class InputsComponent implements OnInit, OnChanges {
    private userService = inject(UserserviceService);

    private apiService = inject(ApiService);

    private userData: any;

    private _selectedReport: IReport = {} as IReport;

    public tableCount = 0;

    public formData: { [key: string]: String } = {};

    public inputFieldsWithOptions: any[] = [];

    public isReportLoading = false;

    public advanceReport: any;

    public tablesToGenerate: any[] = [];

    public data: any;

    private httpClient = inject(HttpClient);

    @Input()
    public report: IReport = {} as IReport;

    public inputFields: any[] = [
        { ParamName: 'startDate', ControlType: 'DateTime', ParamTitle: 'Start Date', defaultValue: new Date() },
        { ParamName: 'endDate', ControlType: 'DateTime', ParamTitle: 'End Date', defaultValue: new Date() },
    ];

    private excludeTables = ['Table', 'Table1', 'Table2'];

    public ngOnInit(): void {
        this.handleGetUserData();
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if(changes['report']?.currentValue) {
            this._selectedReport = changes['report']?.currentValue;
            this.generateInputs();
        }
    }

    public handleGetUserData() {
        const data: any = this.userService.getCookieData();
        if(data) {
            this.userData = data;
        }
    }

    public async generateInputs(): Promise<void> {
        if(this._selectedReport && this.userData) {
            try {
                const responseData = await lastValueFrom(this.apiService.getReportFieldsData(this.userData?.UsrName, this._selectedReport.Rptid));
                this.inputFields = responseData.GetRefreshData['Table1'];
                this.inputFields.forEach(field => {
                    if(field.ControlType === 'DateTime') {
                        this.formData[field.ParamName] = field.defaultValue || new Date();
                    }
                });
                const mapedData = mapRelatedTable(responseData.GetRefreshData);
                this.inputFieldsWithOptions = mapedData as any[];
            } catch (error) {
                console.log(error);
            }
        }
    }

    public async submitData() {
        if(this._selectedReport && this.userData && this.formData) {
            let requestData;
            if(this.formData instanceof Object) {
                const formData = Object.entries(this.formData).map(([key, value]) => {
                    if(value && typeof value === 'object' && 'label' in value && 'value' in value) {
                        return `${key}='${value.value}'`;
                    } else if(value instanceof Date) {
                        const formatedDate = this.formatDate(value);
                        return `${key}=${formatedDate}`;
                    }  else {
                        return `${key}='${value}'`;
                    }
                });
                const username = this.userData.UsrName;
                const session = this.userData.sessionId;

                formData.push(`@UsrName='${username}'`);
                formData.push(`@SessId='${session}'`);

                const commmaSeparated = formData.join(',');
                const slashSeparated = formData.join('/').replace(/@/g, '');

                requestData = {
                    User: this.userData.UsrName,
                    Rptid: this._selectedReport['Rptid'],
                    SessId: this.userData.sessionId,
                    ProcName: this._selectedReport['ProceName'],
                    Paramandvalues: commmaSeparated,
                    mdlid: "AdvanceRmpReportSetup_PrjCls",
                    UserParamList: "select" + slashSeparated
                }
            } else {
                requestData = {
                    User: this.userData.UsrName,
                    Rptid: this._selectedReport['Rptid'],
                    SessId: this.userData.sessionId,
                    ProcName: this._selectedReport['ProceName'],
                    Paramandvalues: this.formData,
                    mdlid: "AdvanceRmpReportSetup_PrjCls",
                    UserParamList: "select " + this.formData
                }
            }

            try {
                this.isReportLoading = !this.isReportLoading;
                const response: any = await lastValueFrom(this.apiService.getReportGenerateData(requestData) as any)
                if(response) {
                    const { Table, Table1 } = response.GetCallId
                    const { MdlId, ReportTitle } = Table1[0];

                    const printData = {
                        pimeidStr: Table[0].CallId,
                        mdlId: MdlId,
                        userName: this.userData.UsrName,
                        htmlRpt: ReportTitle,
                    }

                    try {
                        const responseData: any = await lastValueFrom(this.apiService.getAdvanceReportExcelGenerateService(printData));
                        if(responseData && responseData.GetExcelDocument) {
                            const { Table, Table2 } = responseData.GetExcelDocument;
                            this.advanceReport = Table[0];
                            this.tableCount = Table2.length;
                            this.generateTables(responseData);
                        }
                    } catch (error) {
                        console.log(error);
                    }
                }
            } catch (error) {
                console.error(error);
            }
            this.isReportLoading = !this.isReportLoading;
        }
    }

    private generateTables(data: any) {
        const tablesFromData = Object.entries(data.GetExcelDocument)
            .filter(([key]) => !this.excludeTables.includes(key))
            .map(([key, value]) => {
                const tableData = Array.isArray(value) ? value : [];
                const columns = tableData.length ? Object.keys(tableData[0]) : [];
                return { tableName: key, data: tableData, columns };
            });

        this.tablesToGenerate = tablesFromData;
        console.log(`Generating`, this.tablesToGenerate);
    }

    public handleDownloadFile(type: 'pdf' | 'excel'): void {
        let path;
        if(type === 'pdf') {
            path = this.advanceReport.RevPDFPath;
        } else if(type === 'excel') {
            path = this.advanceReport.RevXlPath
        }
        window.open(path, 'download');
    }

    private formatDate(date: any): string {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `'${year}${month}${day}'`;
    }
}
