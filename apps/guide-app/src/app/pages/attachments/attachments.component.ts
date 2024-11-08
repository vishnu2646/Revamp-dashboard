import { Component } from '@angular/core';
import { FileExplorerComponent } from 'file-explorer';
import { MatIconModule } from '@angular/material/icon';
import { FileNode } from 'libs/file-explorer/src/types/types';

@Component({
    selector: 'app-attachments',
    standalone: true,
    imports: [
        FileExplorerComponent,
        MatIconModule
    ],
    templateUrl: './attachments.component.html',
    styleUrl: './attachments.component.scss'
})
export class AttachmentsComponent {
    public data: FileNode[] = [
        {
            name: 'Documents',
            type: 'folder',
            children: [
                {
                    name: 'Resume.docx',
                    type: 'file'
                },
                {
                    name: 'Project',
                    type: 'folder',
                    children: [
                        {
                            name: 'Proposal.pdf',
                            type: 'file'
                        }
                    ]
                },
            ],
        },
        {
            name: 'Pictures',
            type: 'folder',
            children: [
                {
                    name: 'Vacation.jpg',
                    type: 'file'
                }
            ],
        },
        {
            name: 'Documents',
            type: 'folder',
            children: [
                {
                    name: 'Resume.docx',
                    type: 'file'
                },
                {
                    name: 'Project',
                    type: 'folder',
                    children: [
                        {
                            name: 'Proposal.pdf',
                            type: 'file'
                        }
                    ]
                },
            ],
        },
        {
            name: 'Pictures',
            type: 'folder',
            children: [{ name: 'Vacation.jpg', type: 'file' }],
        },
        {
            name: 'Documents',
            type: 'folder',
            children: [
                { name: 'Resume.docx', type: 'file' },
                { name: 'Project', type: 'folder', children: [{ name: 'Proposal.pdf', type: 'file' }] },
            ],
        },
        {
            name: 'Pictures',
            type: 'folder',
            children: [{ name: 'Vacation.jpg', type: 'file' }],
        },
    ];

    public mode: String = 'list';

    public handleUpload() {

    }
}
