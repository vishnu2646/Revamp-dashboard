import { CanActivateFn } from '@angular/router';

export const sessionGuard: CanActivateFn = (route, state) => {
    const sessionId = sessionStorage.getItem('key');

    if(sessionId && sessionId.length > 0) {
        return true;
    } else {
        return false;
    }
};
