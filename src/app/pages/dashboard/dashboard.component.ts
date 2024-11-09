import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';

import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatIconModule,
        MatMenuModule,
        MatDividerModule,
        MatButtonModule
    ],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

}
