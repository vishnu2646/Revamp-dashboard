import { Component, Inject, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../services/api/api.service';
import { IUser, IUserSession } from '../../types/types';
import { UserserviceService } from '../../services/user/userservice.service';


@Component({
    selector: 'app-activation-dialog',
    standalone: true,
    imports: [
        MatDialogModule,
        MatButtonModule,
    ],
    templateUrl: './activation-dialog.component.html',
    styleUrl: './activation-dialog.component.scss'
})
export class ActivationDialogComponent {

    private apiService = inject(ApiService);

    private userService = inject(UserserviceService);

    private userData: IUserSession = {} as IUserSession;

    public dialogRef = inject(MatDialogRef<ActivationDialogComponent>);

    ngOnInit() {
        const data: IUserSession = this.userService.getUserData() as IUserSession;
        if(data) {
            this.userData = data;
        }
    }

    onOk() {
        this.apiService.getDashboardActivationService(this.userData.UsrId, this.userData.AuthCode, this.userData.logid).subscribe((data) => {
            if(data && data.GetAspSessionId) {
                const refId = data.GetAspSessionId.Table[0].AspSessId;
                sessionStorage.setItem('refId', refId);
            }
        });
        this.dialogRef.close();
    }

    onCancel() {
        this.dialogRef.close();
    }
}
