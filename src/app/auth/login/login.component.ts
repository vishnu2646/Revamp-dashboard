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
import { CookieService } from 'ngx-cookie-service';

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
        // const data: IUser | string = this.userService.getCookieData() as IUser | string;
        // if(data !== "No cookie data") {
        //     // this.router.navigate(['/dashboard']);
        //     console.log(data);
        // }
        const sessionId = uuidv4();
        this.user.SessionId = sessionId;
        this.handleUpdateIpAddress();
    }

    // public async handleVerifyOtp() {
    //     const data = {
    //         otp: this.otp,
    //         logId: this.dataToCookie.logid
    //     };

    //     try {
    //         const responseData = await lastValueFrom(this.userService.verifyOtpService(data))
    //         if(responseData) {
    //             alert(responseData.message);
    //         }
    //         this.userService.setCookie(this.dataToCookie);
    //         this.router.navigate(['/dashboard']);
    //     } catch (error) {
    //         console.log(error);
    //     }
    // }

    public async handleLogin() {
        this.isLoading = !this.isLoading;
        try {
            const repsonseData: any = await lastValueFrom(this.userService.loginService(this.user));
            if(repsonseData && repsonseData['GetLoginApi']) {
                this.dataToCookie = repsonseData['GetLoginApi'].Table[0]
                this.dataToCookie['sessionId'] = this.user.SessionId;
                this.userService.setCookie(this.dataToCookie);
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

}
