import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { UserserviceService } from '../../services/user/userservice.service';

export const sessionGuard: CanActivateFn = (route, state) => {
    const userService = inject(UserserviceService);

    const key = userService.getCookieData();

    if(key && key.length > 0) {
        return true;
    } else {
        return false;
    }
};
