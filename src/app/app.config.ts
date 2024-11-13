import { APP_INITIALIZER, ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';

import { ConfigService } from './services/config/config.service';

export const initializeApp = (configService: ConfigService) => {
    return () => configService.loadConfig()
}

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(routes),
        ConfigService,
        {
            provide: APP_INITIALIZER,
            useFactory: initializeApp,
            deps: [ConfigService],
            multi: true,
        },
        provideAnimationsAsync(),
        provideHttpClient(),
    ]
};
