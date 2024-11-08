import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'filter',
    standalone: true
})
export class FilterPipe implements PipeTransform {

    transform(items: any[], filterValue: String): any[] {
        if(!filterValue) {
            return items;
        }

        if(items.length === 0) return [];

        filterValue = filterValue.toLowerCase();

        return items.filter(item => {
            // Loop over all keys in the object and check if any key contains the filterValue
            return Object.values(item).some(value => {
                // Convert value to string and perform case-insensitive comparison
                return String(value).toLowerCase().includes(String(filterValue));
            });
        });
    }

}
