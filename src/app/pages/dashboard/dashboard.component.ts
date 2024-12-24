import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef, Component, inject, OnInit, TemplateRef } from '@angular/core';

import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IDashboardDropDown, IDashboardModal, IUser, IUserSession } from '../../types/types';
import { UserserviceService } from '../../services/user/userservice.service';
import { ApiService } from '../../services/api/api.service';
import { Chart, registerables } from 'chart.js';
import { ExportService } from '../../services/export/export.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DialogComponent } from '../../components/dialog/dialog.component';
import { LoaderComponent } from "../../components/loader/loader.component";

Chart.register(...registerables);

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatCardModule,
        MatIconModule,
        MatMenuModule,
        MatDividerModule,
        MatButtonModule,
        MatTooltipModule,
        MatSelectModule,
        MatTableModule,
        MatSortModule,
        MatSelectModule,
        MatTooltipModule,
        MatDialogModule,
        LoaderComponent
    ],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
    private userService = inject(UserserviceService);

    private apiService = inject(ApiService);

    private exportService = inject(ExportService);

    private dialog = inject(MatDialog);

    public dialogRef: any;

    private selectedModelId: number = 0;

    private cd = inject(ChangeDetectorRef);

    public graphs = {
        bar: false,
        line: false,
        pie: false,
        doughnut: false
    }

    public key = '';

    public userData: IUserSession = {} as IUserSession;

    public dropDownData: IDashboardDropDown[] = [];

    public dbModel: IDashboardModal[] = [];

    public cardDatas: any[] = [];

    public tableDatas: any[] = [];

    public column: string[] = [];

    public chartDatas: any;

    public chart: any;

    public remaningTable: any;

    public isReportLoaded: boolean = false;

    public isDashboardLoading: boolean = false;

    public chartTitle: String = '';

    public chartSubTitle: String = '';

    public tableNames: any;

    public report = {
        xlPath: '',
        pdfPath: '',
        htmlString: 'N/A',
        title: ''
    };

    public ngOnInit() {
        this.handleGetUserData();
        this.handleGetDropDownList();
    }

    public handleGetDropDownList() {
        this.apiService.getGetDashboardSetListService(this.userData.UsrName).subscribe({
            next: (resposne) => {
                this.dropDownData = resposne.DashboardSetList.Table;
                const firstData = this.dropDownData[0];
                if(firstData && firstData.SetId) {
                    this.handleSelectionChange({ value: firstData.SetId } as MatSelectChange);
                }
            },
            error: (err) => {
                console.log(err);
            },
            complete: () => {
                console.log("Completed");
            }
        })
    }

    public handleSelectionChange(event: MatSelectChange) {
        if(event) {
            this.selectedModelId = event.value;
            this.cardDatas = [];
            this.chartDatas = {};
            this.remaningTable = {};
            this.tableNames = [];
            this.cd.detectChanges();
            this.handleGetDashboardData(event.value);
        }
    }

    public getTableNames() {
        if(this.remaningTable) {
            return Object.keys(this.remaningTable);
        } else {
            return [];
        }
    }

    public getColumns(table: any) {
        return Object.keys(this.remaningTable[table][0])
    }

    public getVaues(row: any) {
        return Object.values(row)
    }

    public handleGetReport(data: any) {
        this.isReportLoaded = !this.isReportLoaded;

        this.apiService.getDashBoardReportService(data.APiUrl).subscribe({
            next: (resposne) => {
                this.report.xlPath = resposne.GetExcelDocument[0].RevXlPath;
                this.report.pdfPath = resposne.GetExcelDocument[0].RevPDFPath;
                this.report.htmlString = resposne.GetExcelDocument[0].HTMlString;
                this.report.title = resposne.GetExcelDocument[0].ReportTitle;
                this.cd.detectChanges();
            },
            error: (err) => {
                console.log(err);
                this.isReportLoaded = !this.isReportLoaded;
            },
            complete: () => {
                this.isReportLoaded = !this.isReportLoaded;
            }
        });
    }

    public handleDownloadFile(type: 'pdf' | 'excel'): void {
        let path;
        if(type === 'pdf') {
            path = this.report.pdfPath;
        } else if(type === 'excel') {
            path = this.report.xlPath
        }
        window.open(path, 'download');
    }

    public handlePreview() {
        this.exportService.handleShowPreview(this.report.htmlString);
    }

    private async handleGetDashboardData(value: any) {
        this.isDashboardLoading = !this.isDashboardLoading;

        this.apiService.getGetDashboardModelService(this.userData.UsrName, value).subscribe({
            next: (response) => {
                this.dbModel = response.GetDashboardModel.Table;
                if(this.dbModel.length > 0) {
                    this.handleDisplayDashboardData(value);
                } else {
                    // No data scenario: Reset UI components
                    this.cardDatas = [];
                    this.chartDatas = {};
                    this.remaningTable = {};
                    this.tableNames = [];
                }
            },
            error: (error) => {
                console.log(error);
                this.isDashboardLoading = !this.isDashboardLoading;
            },
            complete: () => {
                console.log('completed');
                this.isDashboardLoading = !this.isDashboardLoading;
            }
        })
    }

    private handleDisplayDashboardData(value: number) {
        try {
            this.apiService.getDashboardIndividualDataService(value, this.userData.UsrName).subscribe({
                next: (response) => {
                    const { Table, Table1, ...tableDatas }  = response.GetDashboardModel;
                    this.cd.detectChanges();
                    this.cardDatas = Table || [];
                    this.chartDatas = Table1 ? Object.groupBy(Table1, ({ GraphType }: any) => GraphType) : {};
                    this.chart = this.getChartTypes();
                    this.formatDataForChart();
                    this.remaningTable = tableDatas || {};
                    this.tableNames = this.getTableNames();
                },
                error: (error) => {
                    console.log(error);
                },
                complete: () => {
                    this.cd.detectChanges();
                }
            })
        } catch (error) {
            console.log(error);
        }
    }

    public  getChartTypes(): any[] {
        const chartTypes = [];
        if (this.chartDatas?.line) {
            chartTypes.push({
                type: 'line',
                APiUrl: this.chartDatas.line[0].APiUrl,
            });
        };

        if (this.chartDatas?.doughnut) {
            chartTypes.push({
                type: 'doughnut',
                APiUrl: this.chartDatas.doughnut[0].APiUrl,
            });
        };

        if (this.chartDatas?.pie) {
            chartTypes.push({
                type: 'pie',
                APiUrl: this.chartDatas.pie[0].APiUrl
            });
        };

        if (this.chartDatas?.bar) {
            chartTypes.push({
                type: 'bar',
                APiUrl: this.chartDatas.bar[0].APiUrl
            });
        };

        return chartTypes;
    }

    public openDialog(content: TemplateRef<any>, actions: TemplateRef<any>, data: any) {
        this.dialogRef = this.dialog.open(DialogComponent, {
            data: {
                title: 'Reports',
            }
        });

        const dialogInstance = this.dialogRef.componentInstance;
        dialogInstance.content = content;
        dialogInstance.actions = actions;
        this.handleGetReport(data);
    }

    public handleCloseDialog() {
        this.report = {
            xlPath: '',
            pdfPath: '',
            htmlString: 'N/A',
            title: ''
        }
        this.cd.detectChanges();
        this.dialog.closeAll();
    }

    public handleExport(type: String, data: any[], table: String) {
        const columns = this.getColumns(table);
        let title;
        if(data[0].Title && data[0].SubTitle) {
            title = data[0].Title + '-' + data[0].SubTitle;
        } else {
            title = 'Data'
        }
        if(type === 'xlsx') {
            this.exportService.handleExportService('xlsx', data, columns, title)
        } else if(type === 'csv') {
            this.exportService.handleExportService('csv', data, columns, title)
        }
    }

    private formatDataForChart(): void {
        const { line, doughnut, bar, pie} = this.chartDatas;
        if (line) {
            this.chartTitle = line[0].Title;
            this.chartSubTitle = line[0].SubTitle;
            this.renderChart(line, 'line');
        }

        if (doughnut) {
            this.chartTitle = doughnut[0].Title;
            this.chartSubTitle = doughnut[0].SubTitle;
            this.renderChart(doughnut, 'doughnut');
        }

        if (bar) {
            this.chartTitle = bar[0].Title;
            this.chartSubTitle = bar[0].SubTitle;
            this.renderChart(bar, 'bar');
        }

        if (pie) {
            this.chartTitle = pie[0].Title;
            this.chartSubTitle = pie[0].SubTitle;
            this.renderChart(pie, 'pie');
        }
    }

    private renderChart(chartData: any, type: string) {

        const values: number[] | String[] = [];
        const labels: String[] = [];
        const label = chartData[0].labelTitle;

        chartData?.forEach((item: any) => {
            labels.push(item['Xaxis']);
            values.push(item['Yaxis']);
        });

        this.cd.detectChanges();

        this.createChart(type, labels, values, type + "Chart", label);
    }

    private handleGetUserData() {
        const data: IUserSession | String = this.userService.getUserData();
        if(typeof data !== 'string') {
            this.userData = data as IUserSession;
        }
    }

    private async createChart(type: any, label: String[], values: number[] | String[], chartId: string, chartLabel: string) {
        const existingChart = Chart.getChart(chartId);

        if (existingChart) {
            existingChart.destroy();
        }

        await new Chart(chartId, {
            type: type,
            data: {
                labels: label,
                datasets: [{
                    label: chartLabel,
                    data: values,
                    fill: {
                        target: 'origin',
                        above: '#d9d0fb4d',
                    },
                    backgroundColor: [
                        "rgba(253, 127, 111, 0.2)",
                        "rgba(126, 176, 213, 0.2)",
                        "rgba(178, 224, 97, 0.2)",
                        "rgba(189, 126, 190, 0.2)",
                        "rgba(255, 181, 90, 0.2)",
                        "rgba(255, 238, 101, 0.2)",
                        "rgba(190, 185, 219, 0.2)",
                        "rgba(253, 204, 229, 0.2)",
                        "rgba(139, 211, 199, 0.2)"
                    ],
                    borderColor: [
                        "rgb(253, 127, 111)",
                        "rgb(126, 176, 213)",
                        "rgb(178, 224, 97)",
                        "rgb(189, 126, 190)",
                        "rgb(255, 181, 90)",
                        "rgb(255, 238, 101)",
                        "rgb(190, 185, 219)",
                        "rgb(253, 204, 229)",
                        "rgb(139, 211, 199)"
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                indexAxis: type === 'bar' ? 'y' : 'x',
                plugins: {
                    legend: {
                        position: "bottom"
                    }
                }
            }
        });
    }
}
