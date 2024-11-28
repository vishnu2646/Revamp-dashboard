import { CommonModule } from '@angular/common';
import { Component, inject, Inject, Input, TemplateRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
    MAT_DIALOG_DATA,
    MatDialog,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogModule,
    MatDialogRef,
    MatDialogTitle,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
    selector: 'app-dialog',
    standalone: true,
    imports: [
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        MatButtonModule,
        CommonModule,
        MatDialogModule
    ],
    templateUrl: './dialog.component.html',
    styleUrl: './dialog.component.scss'
})
export class DialogComponent {

    readonly dialogRef = inject(MatDialogRef<DialogComponent>);

    @Input()
    public content!: TemplateRef<any>;

    @Input()
    public title: string = '';

    @Input()
    public actions!: TemplateRef<any>;

    constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
        if (data) {
            this.title = data.title || this.title;
        }
    }

}
