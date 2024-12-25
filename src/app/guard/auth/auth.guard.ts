import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserserviceService } from '../../services/user/userservice.service';

export const authGuard: CanActivateFn = (route, state) => {
    const userService = inject(UserserviceService);
    const router = inject(Router);

    const isAuthenticated = userService.getUserData();

    const key = userService.getCookieData();

    if(key && key === 'Key not found') {
        console.log("key")
        router.navigate(['/']);
        return false;
    } else if(isAuthenticated === 'User Not found'){
        router.navigate(['/auth/login']);
        return false;
    }

    return true;
};
