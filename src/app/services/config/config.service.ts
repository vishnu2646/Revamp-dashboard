import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ConfigService {
    private httpClient = inject(HttpClient);

    private config: any;

    public async loadConfig() {
        try {
            const content = await lastValueFrom(this.httpClient.get('/assets/db.json'));
            if(JSON.stringify(content).length > 0 && content) {
                this.config = content;
            }
        } catch (error) {
            console.error(error)
        }
    }

    public getConfig() {
        return this.config?.dataBaseKey;
    }
}
