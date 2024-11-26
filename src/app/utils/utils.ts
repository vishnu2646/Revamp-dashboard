export function groupData<T>(data: T[], key: string): Record<string, T[]> {
    return data.reduce((result, item: any) => {
        const groupKey = String(item[key]);
        if (!result[groupKey]) {
            result[groupKey] = [];
        }
        result[groupKey].push(item);
        return result;
    }, {} as Record<string, T[]>);
}

export const isDefined = (data: any) => {
    return typeof data !== 'undefined';
}


export const mapRelatedTable = (data: any) => {

    const table1 = data.Table1;

    table1.forEach((item: any) => {
        const primeValue = item.Primevalue;

        if(primeValue !== '') {
            for(const [tableName, array] of Object.entries(data)) {
                const entries = array as any;
                if(tableName !== 'Table' && tableName !== 'Table1' && tableName !== 'Tabl2') {
                    const options = entries.map((option: any) => ({
                        value: option[primeValue],
                        label: option[item.UserValue],
                    }));

                    if(options.some((option: any) => option.value !== undefined)){
                        item.options = options;
                        break;
                    }
                }
            }
        } else {
            for(const [tableName, array] of Object.entries(data)) {
                const entries = array as any;

                if(tableName !== 'Table' && tableName !== 'Table1' && tableName !== 'Table2') {
                    const options = entries.map((item: any) => ({
                        value: item.DefaultValue
                    }));
                    if(options.some((option: any) => option.value !== undefined)){
                        item.options = options;
                        break;
                    }
                }
            }
        }

    });

    return data;
}


// export function groupByData<T>(collection:T[],key: keyof T){
//     const groupedResult = Map.groupBy(collection, key);

//     return groupedResult
// }
