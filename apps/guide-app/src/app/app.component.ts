import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FileExplorerComponent } from 'file-explorer';
import { FileNode } from 'libs/file-explorer/src/types/types';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        RouterOutlet,
        FileExplorerComponent
    ],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
    title = 'guide-app';
}
