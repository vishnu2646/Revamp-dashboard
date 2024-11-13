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
