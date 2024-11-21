import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';

import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';

import { IUser } from '../../types/types';
import { UserserviceService } from '../../services/user/userservice.service';
import { Router } from '@angular/router';

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
export class DashboardComponent implements OnInit {
    private router = inject(Router);

    private userService = inject(UserserviceService);

    public userData: any;

    public ngOnInit() {
        this.handleGetUserData();
    }

    public handleGetUserData() {
        const data: IUser = this.userService.getCookieData() as IUser;
        if(data) {
            this.userData = data;
        }
    }

    public handleMail() {
        window.open(`https://mail.google.com/mail/u/0/?view=cm&fs=1&to=${this.userData.UserEmail}&su=SUBJECT&body=BODY&tf=1`, '_blank');
    }
}
