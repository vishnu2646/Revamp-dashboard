import { ChangeDetectorRef, Component, Input, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatIconModule } from '@angular/material/icon';
import { MatTreeModule, MatTreeNestedDataSource } from '@angular/material/tree';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { FileNode } from '../types/types';

@Component({
    selector: 'lib-file-explorer',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatTreeModule,
        MatIconModule,
        MatMenuModule
    ],
    templateUrl: './file-explorer.component.html',
    styleUrls: ["./file-expolorer.component.scss"]
})
export class FileExplorerComponent {
    private _data: FileNode[] = [];

    public treeControl = new NestedTreeControl<FileNode>((node) => node.children);

    public dataSource = new MatTreeNestedDataSource<FileNode>();

    public selectedFolder: FileNode | null = null;

    public displayedFilesAndFolders: FileNode[] = [];

    public breadcrumbPath: FileNode[] = [];

    public selectedFileOrFolder: FileNode | null = null;

    public isEditFileOrFolderName: boolean = false;

    public mode: String = 'list';

    @ViewChild('menuTrigger')
    public menuTrigger!: MatMenuTrigger;

    @Input()
    public set data(value: FileNode[]) {
        this.dataSource.data = value;
    }

    public get data(): FileNode[] {
        return this._data;
    }

    constructor(private cd: ChangeDetectorRef) {}

    public hasChild = (_: number, node: FileNode) => !!node.children && node.children.length > 0;

    public selectFolder(folder: FileNode | null): void {
        if(folder === null) {
            return;
        }

        if (this.selectedFolder === folder) {
            this.treeControl.collapse(folder);
            this.selectedFolder = null;
            this.displayedFilesAndFolders  = [];
        } else {
            // Collapse previously selected folder if it exists
            if (this.selectedFolder) {
                this.treeControl.collapse(this.selectedFolder);
            }

            // Set the selected folder and expand it
            this.selectedFolder = folder;
            this.displayedFilesAndFolders = folder.children || [];
            this.breadcrumbPath = this.getBreadcrumbPath(folder);
            this.expandFolderAndChildren(folder);
        }
    }

    public expandFolderAndChildren(folder: FileNode): void {
        this.treeControl.expand(folder);
        if (folder.children) {
            folder.children.forEach((child) => {
                if (child.children) {
                    this.expandFolderAndChildren(child);
                }
            });
        }
    }

    public getAllFiles(folder: FileNode): FileNode[] {
        const files: FileNode[] = [];
        folder.children?.forEach((child) => {
            if (child.type === 'file') {
                files.push(child);
            } else if (child.children) {
                files.push(...this.getAllFiles(child)); // Recursive call for nested folders
            }
        });
        return files;
    }

    public openContextMenu(event: MouseEvent, file: FileNode) {
        event.preventDefault();
        this.selectedFileOrFolder = file;
        this.menuTrigger.openMenu();
    }

    public async handleDetectChanges() {
        await this.cd.detectChanges();
    }

    public reameFolderOrFile(node: FileNode  | null) {
        if(!node) {
            return;
        };
        this.isEditFileOrFolderName = !this.isEditFileOrFolderName;
        this.selectedFileOrFolder = node;
    }

    public deleteFileOrFolder(node: FileNode | null) {
        if(!node) {
            return;
        }

        this.displayedFilesAndFolders = this.displayedFilesAndFolders.filter(dnode => dnode.name !== node.name);
    }

    private  getBreadcrumbPath(folder: FileNode): FileNode[] {
        const path: FileNode[] = [];
        let current: FileNode | null = folder;

        while (current) {
            path.unshift(current);
            current = this.findParent(current, this.dataSource.data);
        }
        return path;
    }

    private findParent(node: FileNode, nodes: FileNode[]): FileNode  | null{
        const stack: { currentNode: FileNode; parent: FileNode | null }[] = nodes.map(n => ({ currentNode: n, parent: null }));

        while (stack.length) {
            const { currentNode, parent } = stack.pop()!;

            // If the node's children contain the target node, we found the parent
            if (currentNode.children && currentNode.children.includes(node)) {
                return currentNode;
            }

            // If there are children, push them onto the stack with the current node as their parent
            if (currentNode.children) {
                currentNode.children.forEach(child =>
                    stack.push({ currentNode: child, parent: currentNode })
                );
            }
        }

        // Return null if no parent is found
        return null
    }
}
