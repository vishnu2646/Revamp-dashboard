import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Router, RouterModule } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

import { UserserviceService } from '../../services/user/userservice.service';
import { IMAGE_CONFIG } from '@angular/common';
import { IpserviceService } from '../../services/ipService/ipservice.service';
import { IUser, IUserInfo } from '../../types/types';
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
    private router = inject(Router);

    private userData: IUser = {} as IUser;

    private userService = inject(UserserviceService);

    private ipService = inject(IpserviceService);

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

    public ngOnInit() {
        const data: IUser | string = this.userService.getCookieData() as IUser | string;
        if(data !== "No cookie data") {
            this.router.navigate(['/dashboard']);
        }
        const sessionId = uuidv4();
        this.user.SessionId = sessionId;
        this.handleUpdateIpAddress();
    }

    public handleToggleOtpField() {
        this.toggleOTPfield = !this.toggleOTPfield;
    }

    public handleVerifyOtp() {
        this.router.navigate(['dashboard']);
    }

    public async handleLogin() {
        this.isLoading = !this.isLoading;
        try {
            const repsonseData: any = await lastValueFrom(this.userService.loginService(this.user));
            if(repsonseData && repsonseData['GetLoginApi']) {
                const dataToCookie = repsonseData['GetLoginApi'].Table[0]
                dataToCookie['sessionId'] = this.user.SessionId;
                this.userService.setCookie(dataToCookie);
                this.router.navigate(['/dashboard']);
            }
        } catch (error) {
            console.log(error);
            this.router.navigate(['/auth/login']);
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

}
