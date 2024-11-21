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
        MatButtonModule
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

    public formData: { [key: string]: String } = {};

    public inputFieldsWithOptions: any[] = []

    @Input()
    public report: IReport = {} as IReport;

    public inputFields: any[] = [
        { ParamName: 'startDate', ControlType: 'DateTime', ParamTitle: 'Start Date', defaultValue: new Date() },
        { ParamName: 'endDate', ControlType: 'DateTime', ParamTitle: 'End Date', defaultValue: new Date() },
    ];

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
                console.log(this.inputFields);
            } catch (error) {
                console.log(error);
            }
        }
    }

    public updatedSelectedOption(event: MatSelectChange) {
        console.log(event);
    }

    public async submitData() {
        console.log(this.formData);
        if(this._selectedReport && this.userData && this.formData) {
            let requestData;
            if(this.formData instanceof Object) {
                const formData = Object.entries(this.formData).map(([key, value]) => {
                    if(value && typeof value === 'object' && 'label' in value && 'value' in value) {
                        return `${key}=${value.value}`;
                    } else if(value instanceof Date) {
                        const formatedDate = this.formatDate(value);
                        return `${key}=${formatedDate}`;
                    }  else {
                        return `${key}=${value}`;
                    }
                });
                console.log(formData);
                const commmaSeparated = formData.join(',');
                const slashSeparated = formData.join('/').replace(/@/g, '');

                requestData = {
                    User: this.userData.UsrName,
                    Rptid: this._selectedReport['Rptid'],
                    SessId: this.userData.sessionId,
                    ProcName: this._selectedReport['ProceName'],
                    formData: commmaSeparated,
                    UserParamList: slashSeparated
                }
            } else {
                requestData = {
                    User: this.userData.UsrName,
                    Rptid: this._selectedReport['Rptid'],
                    SessId: this.userData.sessionId,
                    ProcName: this._selectedReport['ProceName'],
                    formData: this.formData,
                    UserParamList: this.formData
                }
            }

            console.log(requestData);

            try {
                // this.isReportLoading = true;
                const response: any = await lastValueFrom(this.apiService.getReportGenerateData(requestData) as any)
                if(response) {
                    // this.isReportLoading = false;
                    const printData = {
                        userName: this.userData.UsrName,
                        callId: response.body.GetGenerateData.Table[0].CallId,
                        rptId: this._selectedReport['Rptid'],
                        rptName: String(this._selectedReport['Reportname'])
                    }

                    console.log(printData);

                    // this.printDataService.setPrintData(printData);
                    // this.router.navigate(['/home/details']);
                    // try {
                    //     this.isPrintDataLoading = true;
                    //     const printDataResponse = await lastValueFrom(this.apiService.getPrintData(printData.userName, printData.dataBaseKey, printData.rptId, printData.callId, printData.rptName))
                    //     this.isPrintDataLoading = false;
                    //     this.printResponseData = printDataResponse;
                    //     this.isPrintDataVisible = true;

                    // } catch (err) {
                    //     console.log(err);
                    // }
                }
            } catch (error) {
                console.error(error);
                // this.loading = false;
            }
        }
    }

    private formatDate(date: any): string {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}${month}${day}`;
    }
}
