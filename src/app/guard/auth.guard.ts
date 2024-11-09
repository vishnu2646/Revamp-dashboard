import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserserviceService } from '../services/user/userservice.service';

export const authGuard: CanActivateFn = (route, state) => {
    const userService = inject(UserserviceService);
    const router = inject(Router);

    const isAuthenticated = userService.getCookieData();

    if(isAuthenticated === 'No cookie data'){
        router.navigate(['/auth/login']);
        return false;
    }

    return true;
};
