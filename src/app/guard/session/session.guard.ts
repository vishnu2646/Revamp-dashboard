import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserserviceService } from '../../services/user/userservice.service';

export const sessionGuard: CanActivateFn = (route, state) => {
    const userService = inject(UserserviceService);
    const router = inject(Router);

    const key = userService.getCookieData();

    if(key && key.length > 0 && !key.includes('Key not found')) {
        return true;
    } else {
        return false;
    }
};
