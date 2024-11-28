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
import { IUser } from '../../types/types';
import { LoaderComponent } from '../../components/loader/loader.component';

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
        LoaderComponent
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

    private userData: IUser = {} as IUser;

    private userService = inject(UserserviceService);

    private ipService = inject(IpserviceService);

    private dataToCookie: any;

    public toggleOTPfield: boolean = false;

    public isLoading = false;

    public user = {
        UsrName: '',
        UsrPwd: '',
        ComCode: 0,
        SessionId: '',
        IPAddress: '',
        ComId: 'GRANT000000000000001',
    }

    public otp: String = '';

    public ngOnInit() {
        const sessionId = uuidv4();
        this.user.SessionId = sessionId;
        this.handleUpdateIpAddress();
    }

    public async handleLogin() {
        this.isLoading = !this.isLoading;
        try {
            const repsonseData: any = await lastValueFrom(this.userService.loginService(this.user));
            if(repsonseData && repsonseData['GetLoginApi']) {
                this.dataToCookie = repsonseData['GetLoginApi'].Table[0]
                this.dataToCookie['sessionId'] = this.user.SessionId;
                // this.userService.setCookie(this.dataToCookie);
                sessionStorage.setItem('user', JSON.stringify(this.dataToCookie));
                this.openSnackBar('Login Successfull', 'X');
                this.router.navigate(['/dashboard']);
            }
        } catch (error) {
            console.log(error);
        } finally {
            this.isLoading = !this.isLoading;
        }
    }

    public handleNaviagteToReset() {
        this.router.navigate(['/auth/reset-password']);
    }

    private handleUpdateIpAddress() {
        this.ipService.getIpAddress().subscribe((data: any) => {
            if(Object.keys(data).includes('ip')) {
                this.user.IPAddress = data['ip'];
            }
        });
    }

    private openSnackBar(message: string, action: string) {
        this._snackBar.open(message, action, {
            horizontalPosition: "right",
            verticalPosition: "top",
            duration: 2000
        });
    }

}
