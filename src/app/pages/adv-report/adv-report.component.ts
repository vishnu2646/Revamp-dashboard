import { Component, inject, OnInit } from '@angular/core';
import { lastValueFrom, map, Observable, startWith } from 'rxjs';
import { ApiService } from '../../services/api/api.service';
import { UserserviceService } from '../../services/user/userservice.service';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { IAdvRmpRptGenData, IReport } from '../../types/types';
import { InputsComponent } from '../../components/inputs/inputs.component';
import { MatCardModule } from '@angular/material/card';

@Component({
    selector: 'app-adv-report',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatInputModule,
        MatAutocompleteModule,
        InputsComponent,
        MatCardModule
    ],
    templateUrl: './adv-report.component.html',
    styleUrl: './adv-report.component.scss'
})
export class AdvReportComponent implements OnInit {

    private apiService = inject(ApiService);

    private userService = inject(UserserviceService);

    public userData: any;

    public reports: IReport[] = [];

    public reportOptions: Observable<IReport[]> = new Observable<IReport[]>();

    public reportOptionsControl = new FormControl();

    public selectedReportOption: IReport = {} as IReport;

    public ngOnInit(): void {
        this.handleGetUserData();
        this.getReportData();

        this.reportOptions = this.reportOptionsControl.valueChanges.pipe(
            startWith(''),
            map(value => this._filterReports(value || '')),
        );
    }

    public handleGetUserData() {
        const data: any = this.userService.getCookieData();
        if(data) {
            this.userData = data;
        }
    }

    public async getReportData() {
        try {
            const responseData: IAdvRmpRptGenData = await lastValueFrom(this.apiService.getReportData(this.userData.UsrName)) as IAdvRmpRptGenData
            if(responseData) {
                this.reports = responseData.AdvRmpRptGenData.Table;
            }
        } catch (error) {
            console.log(error);
        }
    }

    public async handleSelectedReport(option: IReport) {
        this.selectedReportOption = option;
    }

    private _filterReports(value: string): IReport[] {
        return this.reports.filter(report => report.Reportname.toLowerCase().includes(value.toLowerCase()));
    }

}
