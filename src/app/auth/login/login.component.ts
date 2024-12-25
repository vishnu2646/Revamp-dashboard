import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterModule } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

import { UserserviceService } from '../../services/user/userservice.service';
import { IMAGE_CONFIG } from '@angular/common';
import { IpserviceService } from '../../services/ipService/ipservice.service';
import { IIpAdress, IUserSession } from '../../types/types';
import { LoaderComponent } from '../../components/loader/loader.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        FormsModule,
        RouterModule,
        MatInputModule,
        MatFormFieldModule,
        MatButtonModule,
        MatCheckboxModule,
        LoaderComponent,
        MatCardModule,
        MatIconModule
    ],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss',
    providers: [
        {
            provide: IMAGE_CONFIG,
            useValue: {
                disableImageSizeWarning: true,
                disableImageLazyLoadWarning: true
            }
        }
    ]
})
export class LoginComponent {
    private _snackBar = inject(MatSnackBar);

    private router = inject(Router);

    private userService = inject(UserserviceService);

    private ipService = inject(IpserviceService);

    private userSessionData: IUserSession = {} as IUserSession;

    public toggleOTPfield: boolean = false;

    public otp: String = '';

    public viewPassword: boolean = false;

    public isLoading = false;

    public user = {
        UsrName: '',
        UsrPwd: '',
        ComCode: 0,
        SessionId: '',
        IPAddress: '',
        ComId: 'GRANT000000000000001',
    }

    public ngOnInit() {
        const sessionId = uuidv4();
        this.user.SessionId = sessionId;
        this.handleUpdateIpAddress();
        const key = this.userService.getCookieData();
        if(key === 'Key not found') {
            this._snackBar.open("Please add your Key", 'X', {
                horizontalPosition: "right",
                verticalPosition: "top",
            });
        }
    }

    public validatePassword(event: string) {
        if(event.includes('#')) {
            this.openSnackBar('Please enter your password without #', 'X');
        }
    }

    public async handleLogin() {
        this.isLoading = !this.isLoading;
        try {
            const repsonseData = await lastValueFrom(this.userService.loginService(this.user));
            if(repsonseData && repsonseData['GetLoginApi']) {
                this.userSessionData = repsonseData['GetLoginApi'].Table[0];
                this.userSessionData['sessionId'] = this.user.SessionId;

                sessionStorage.setItem('user', JSON.stringify(this.userSessionData));

                this.openSnackBar('Login Successfull', 'X');
                this.router.navigate(['/dashboard']);
            }
        } catch (error) {
            console.log(error);
            this.openSnackBar('Invalid credentials or Invalid Key', 'X');
        } finally {
            this.isLoading = !this.isLoading;
        }
    }

    public handleNaviagteToReset() {
        this.router.navigate(['/auth/reset-password']);
    }

    public handleAddKey() {
        this.router.navigate(['/']);
    }

    private handleUpdateIpAddress() {
        this.ipService.getIpAddress().subscribe((data: IIpAdress) => {
            if(Object.keys(data).includes('ip')) {
                this.user.IPAddress = data.ip;
            }
        });
    }

    private openSnackBar(message: string, action: string) {
        this._snackBar.open(message, action, {
            horizontalPosition: "right",
            verticalPosition: "top",
            duration: 5000
        });
    }
}
