import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { UserserviceService } from '../services/user/userservice.service';
import { CookieService } from 'ngx-cookie-service';
import { MatCardModule } from '@angular/material/card';

@Component({
    selector: 'app-on-boarding',
    standalone: true,
    imports: [
        MatIconModule,
        MatDividerModule,
        FormsModule,
        CommonModule,
        MatInputModule,
        MatButtonModule,
        MatCardModule,
    ],
    templateUrl: './on-boarding.component.html',
    styleUrl: './on-boarding.component.scss'
})
export class OnBoardingComponent {
    private router = inject(Router);

    private activatedRoute = inject(ActivatedRoute);

    private userService = inject(UserserviceService);

    private cookieService = inject(CookieService);

    public isKeyAvalible: boolean = false;

    public key: String = '';

    constructor() {
        this.activatedRoute.queryParams.subscribe(params => {
            // const key = this.userService.getCookieData()
            if(params['key']) {
                this.userService.setCookie(params['key']);
                this.router.navigate(['/auth/login']);
            }
        })
    }

    public handleSetDatabaseKey (): void {
        if(this.key.length > 5) {
            this.userService.setCookie(this.key.toString())
        } else {
            alert('Please enter valid key');
        }
    }
}
