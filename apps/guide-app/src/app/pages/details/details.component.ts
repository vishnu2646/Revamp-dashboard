import { Component, inject, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserserviceService } from '../../services/user/userservice.service';
import { IUser } from '../../types/types';
import { ModuleRightsService } from '../../services/module/module-rights.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-details',
    standalone: true,
    imports: [],
    templateUrl: './details.component.html',
    styleUrl: './details.component.scss'
})
export class DetailsComponent implements OnInit, OnDestroy {
    private activatedRoute = inject(ActivatedRoute);

    private userService = inject(UserserviceService);

    private moduleService = inject(ModuleRightsService);

    private router = inject(Router);

    private seletcedDataSubscription: Subscription | undefined;

    public userData: any;

    public selectedData: any;


    public ngOnInit() {
        this.handleGetUserData();

        this.selectedData = history.state;

        console.log(this.selectedData);
    }

    public ngOnDestroy(): void {
        // Make sure to unsubscribe when the component is destroyed
        if (this.seletcedDataSubscription) {
            this.seletcedDataSubscription.unsubscribe();
        }
    }

    public handleGetUserData(): void {
        const data: IUser = this.userService.getCookieData() as IUser;
        if(data) {
            this.userData = data;
        }
    }

}
