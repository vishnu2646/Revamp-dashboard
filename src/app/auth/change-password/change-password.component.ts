import { Component, inject } from '@angular/core';
import { UserserviceService } from '../../services/user/userservice.service';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { IUserSession } from '../../types/types';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-change-password',
    standalone: true,
    imports: [
        FormsModule,
        MatInputModule,
        MatFormFieldModule,
        MatButtonModule,
        MatCheckboxModule,
        MatIconModule
    ],
    templateUrl: './change-password.component.html',
    styleUrl: './change-password.component.scss'
})
export class ChangePasswordComponent {
    private userService = inject(UserserviceService);

    private router = inject(Router);

    public userData: IUserSession | string = {} as IUserSession;

    public viewPassword: boolean = false;

    public passwordInfo = {
        username: '',
        OldPassword: '',
        password: '',
        rePassword: '',
    }

    public ngOnInit() {
        this.handleGetUserData()
    }

    public handleGetUserData() {
        const data: IUserSession | String = this.userService.getUserData();
        if(typeof data !== 'string') {
            this.userData = data as IUserSession;
            this.passwordInfo.username = this.userData.UsrName.toString();
        }
    }

    public async handleChangePassword() {
        if(this.passwordInfo.password === this.passwordInfo.rePassword) {
            try {
                const responseData: any = await lastValueFrom(this.userService.updatePasswordInfoService(this.passwordInfo))
                if(responseData && Object.keys(responseData).length) {
                    alert("Password updated successfully")
                    this.router.navigate(['/auth/login']);
                }
            } catch (error) {
                console.log(error);
            }
        } else {
            alert("Entered New Password and Re entered password are incorrect")
        }
    }
}
