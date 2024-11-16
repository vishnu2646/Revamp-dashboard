import { Routes } from '@angular/router';
import { PagesComponent } from './pages/pages.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AuthComponent } from './auth/auth.component';
import { LoginComponent } from './auth/login/login.component';
import { DataviewComponent } from './pages/dataview/dataview.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';
import { ChangePasswordComponent } from './auth/change-password/change-password.component';
import { authGuard } from './guard/auth/auth.guard';
import { DetailsComponent } from './pages/details/details.component';
import { ActivitesComponent } from './pages/activites/activites.component';
import { sessionGuard } from './guard/session/session.guard';
import { OnBoardingComponent } from './on-boarding/on-boarding.component';

export const routes: Routes = [
    {
        path: '',
        component: OnBoardingComponent
    },
    {
        path: 'auth',
        component: AuthComponent,
        children: [
            {
                path: 'login',
                component: LoginComponent,
                canActivate: [sessionGuard]
            },
            {
                path:'reset-password',
                component: ResetPasswordComponent,
            },
            {
                path:'change-password',
                component: ChangePasswordComponent,
                canActivate: [authGuard]
            }
        ]
    },
    {
        path: 'dashboard',
        component: PagesComponent,
        canActivate: [authGuard, sessionGuard],
        children: [
            {
                path: '',
                component: DashboardComponent,
                canActivate: [authGuard]
            },
            {
                path: 'data-viewer',
                component: DataviewComponent,
                canActivate: [authGuard]
            },
            {
                path: 'details',
                component: DetailsComponent,
                canActivate: [authGuard]
            },
            {
                path: 'activites',
                component: ActivitesComponent,
                canActivate: [authGuard]
            }
        ]
    },
];
