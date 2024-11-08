import { Routes } from '@angular/router';
import { PagesComponent } from './pages/pages.component';
import { AttachmentsComponent } from './pages/attachments/attachments.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AuthComponent } from './auth/auth.component';
import { LoginComponent } from './auth/login/login.component';
import { DataviewComponent } from './pages/dataview/dataview.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';
import { SignupComponent } from './auth/signup/signup.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'auth/login',
        pathMatch: 'full',
    },
    {
        path: 'auth',
        component: AuthComponent,
        children: [
            {
                path: 'login',
                component: LoginComponent
            },
            {
                path: 'signup',
                component: SignupComponent
            },
            {
                path:'reset-password',
                component: ResetPasswordComponent
            }
        ]
    },
    {
        path: 'dashboard',
        component: PagesComponent,
        children: [
            {
                path: '',
                component: DashboardComponent
            },
            {
                path: 'data-viewer',
                component: DataviewComponent
            }
        ]
    },
    {
        path: 'attachments',
        component: AttachmentsComponent
    }
];
