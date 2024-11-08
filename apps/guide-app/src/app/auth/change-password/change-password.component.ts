import { Component, inject } from '@angular/core';
import { UserserviceService } from '../../services/user/userservice.service';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { IUser } from '../../types/types';

@Component({
    selector: 'app-change-password',
    standalone: true,
    imports: [
        FormsModule,
        MatInputModule,
        MatFormFieldModule,
        MatButtonModule,
        MatCheckboxModule
    ],
    templateUrl: './change-password.component.html',
    styleUrl: './change-password.component.scss'
})
export class ChangePasswordComponent {
    private userService = inject(UserserviceService);

    private router = inject(Router);

    private isActive = false;

    public userData: any;

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
        const data: IUser = this.userService.getCookieData() as IUser;
        if(data) {
            this.userData = data;
            this.passwordInfo.username = this.userData.UsrName
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
