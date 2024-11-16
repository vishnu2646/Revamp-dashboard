import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';

@Component({
    selector: 'app-on-boarding',
    standalone: true,
    imports: [
        MatIconModule,
        MatDividerModule,
        FormsModule,
        CommonModule,
        MatInputModule,
        MatButtonModule
    ],
    templateUrl: './on-boarding.component.html',
    styleUrl: './on-boarding.component.scss'
})
export class OnBoardingComponent {
    private router = inject(Router);

    public isKeyAvalible: boolean = false;

    public key: String = '';

    public handleSetDatabaseKey (): void {
        if(this.key.length > 5) {
            sessionStorage.setItem('key', this.key.toString());
            this.router.navigate(['/auth/login']);
        } else {
            alert('Please enter valid key');
        }
    }
}
