import { inject, Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ngxCsv } from 'ngx-csv';
import * as XLSX from 'xlsx';

@Injectable({
    providedIn: 'root'
})
export class ExportService {

    private sanitizer = inject(DomSanitizer);

    private printContent: any;

    public handleDownLoad() {
        window.location.href='http://example.com/myuri/report?param=x';
    }

    public handleExportService(type: String, tableBody: any, tableHead: String[], title: String) {
        const fileName = `${title}.xlsx`;

        const fullData = tableBody;

        const headers = tableHead.map(col => col);

        const rows = fullData.map((element: any) => {
            return tableHead.map((column: any) => element[column]);
        });

        const data = [headers, ...rows];

        if(type === 'xlsx') {
            this.writeExcel(data, fileName);
        } else if (type === 'csv') {
            this.writeCSV(data, title, tableHead);
        }
    }

    private writeExcel(data: any, fileName: string) {
        const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(data);

        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

        XLSX.writeFile(wb, fileName);
    }

    private writeCSV(data: any, fileName: String, header: String[]) {
        const options = {
            fieldSeparator: ',',
            quoteStrings: '"',
            showLabels: true,
            showTitle: true,
            title: fileName,
            useBom: true,
            headers: header,
        };
        new ngxCsv(data, fileName.toString(), options);
    }

    public handleShowPreview(data: any) {
        this.printContent = this.sanitizer.bypassSecurityTrustHtml(data);
        if(this.printContent) {
            this.handlePrint();
        }
    }

    public handlePrint() {
        const printWindow = window.open('', '', 'height=600,width=800');
        console.log(this.printContent);
        printWindow?.document.write(this.printContent['changingThisBreaksApplicationSecurity']);
        printWindow?.document.close();
        printWindow?.print();
    }
}
