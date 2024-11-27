import { Component } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';


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

}
