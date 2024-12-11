import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit, Pipe } from '@angular/core';

import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule, MatSelectChange } from '@angular/material/select';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IChartData, IDashboardTable, IDashboardType, ITilesData, IUser } from '../../types/types';
import { UserserviceService } from '../../services/user/userservice.service';
import { ApiService } from '../../services/api/api.service';
import { catchError, from, lastValueFrom, map, Observable, of, Subscription } from 'rxjs';
import { Chart, registerables } from 'chart.js';
import { LoaderComponent } from '../../components/loader/loader.component';
import { MatOptionSelectionChange } from '@angular/material/core';
import { ActivationDialogComponent } from '../../components/activation-dialog/activation-dialog.component';
import { MatDialog } from '@angular/material/dialog';


Chart.register(...registerables)
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
    ],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
    private userService = inject(UserserviceService);

    private apiService = inject(ApiService);

    private cd = inject(ChangeDetectorRef);

    private readonly activationDialog = inject(MatDialog);

    private window: any;

    private refreshSubscription: Subscription | null = null;

    private activationSubscription: Subscription | null = null;

    private selectedTile: ITilesData = {} as ITilesData;

    public key = '';

    public userData: any;

    public tilesData: ITilesData[] = [];

    public chartData: IChartData[] = [];

    public labesData: String[] = [];

    public dashboardTableData: MatTableDataSource<IDashboardTable[]> = new MatTableDataSource<IDashboardTable[]>;

    public displayColumns: String[] = [];

    public type: IDashboardType = {} as IDashboardType;

    public ngOnInit() {
        this.handleGetUserData();
        this.handleGetDashboardData();

        this.refreshSubscription = this.userService.refreshSubject$.subscribe(() => {
            this.handleSelectionOption(this.selectedTile);
        });
    }

    public ngOnDestroy(): void {
        if(this.refreshSubscription) {
            this.refreshSubscription.unsubscribe();
        }
    }

    public async handleSelectionOption(tile: ITilesData) {

        this.selectedTile = tile;

        try {
            const response = await lastValueFrom(this.apiService.getDashboardIndividualDataService(tile.DSbId, this.userData.UsrName));
            if(response && response['DashboardIndividualData']) {
                const { Table, Table1, Table2 } = response['DashboardIndividualData'];
                this.chartData = Table;
                this.displayColumns = Object.keys(Table1[0]);
                this.dashboardTableData.data = Table1;
                this.type = Table2[0];
                this.renderChart();
            }
        } catch (error) {
            console.log(error);
        }
    }

    private async handleGetDashboardData() {
        try {
            const responseData: any = await lastValueFrom(this.apiService.getDashboardService(this.userData.UsrName));
            if(responseData && responseData['DashboardData']) {
                const { Table, Table1, Table2, Table3 } = responseData['DashboardData'];
                this.sortTilesData(Table);
                this.cd.detectChanges();
                this.chartData = Table1;
                this.type = Table2[0];
                this.key = Table3[0].DSBTitle;
                this.dashboardTableData.data = Table3;
                this.displayColumns = Object.keys(Table3[0]);
                this.renderChart();
            }
        } catch (error) {
            console.log(error);
        }
    }

    private renderChart() {
        const values: number[] | String[] = [];
        const labels: String[] = [];

        this.chartData.forEach((item: any) => {
            labels.push(item['Xlabel']);
            values.push(item['Yvalues']);
        });

        this.createChart("bar", labels, values, 'barchart');
        this.createChart("pie", labels, values, 'piechart');
        this.createChart("doughnut", labels, values, 'doughnutchart');
        this.createChart("line", labels, values, 'linechart');
    }

    private handleGetUserData() {
        const data: IUser = this.userService.getUserData() as IUser;
        if(data) {
            this.userData = data;
        }
    }

    private createChart(type: any, label: String[], values: number[] | String[], chartId: string) {
        const existingChart = Chart.getChart(chartId);

        if (existingChart) {
            existingChart.destroy();
        }

        new Chart(chartId, {
            type: type,
            data: {
                labels: label,
                datasets: [{
                    label: "Amount",
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
                }]
            },
            options: {
                responsive: true,
            }
        })
    }

    private sortTilesData(data: ITilesData[]) {
        this.tilesData = data.sort((a, b) => a.Priority - b.Priority);
    }
}
