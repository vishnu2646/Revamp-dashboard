import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { UserserviceService } from '../../services/user/userservice.service';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-reset-password',
    standalone: true,
    imports: [
        FormsModule,
        MatInputModule,
        MatFormFieldModule,
        MatButtonModule,
        MatCheckboxModule,
        MatIconModule
    ],
    templateUrl: './reset-password.component.html',
    styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnInit {

    private userService = inject(UserserviceService);

    private router = inject(Router);

    private isActive = false;

    private userData: any;

    public viewPassword: boolean = false;

    public userInfo = {
        username: '',
        password: '',
        email: '',
    }

    public ngOnInit(): void {
        this.userInfo.password = this.generatePassword();
    }

    public handleGetUserData() {
        const data = this.userService.getUserData();
        if(data) {
            this.userData = data;
        }
    }

    public async handleResetPassword() {
        try {
            const responseData: any = await lastValueFrom(this.userService.getUserInfoService(this.userInfo.username, this.userInfo.password, this.userInfo.email))
            if(responseData && responseData['CheckResetPwdApi']) {
                const table = responseData['CheckResetPwdApi'].Table[0];
                this.isActive = table.Status === "Active" ? true : false;
            }
        } catch (error) {
            console.log(error);
        }
    }

    private generatePassword() {
        var length = 8,
            charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
            retVal = "";
        for (var i = 0, n = charset.length; i < length; ++i) {
            retVal += charset.charAt(Math.floor(Math.random() * n));
        }
        return retVal;
    }
}
