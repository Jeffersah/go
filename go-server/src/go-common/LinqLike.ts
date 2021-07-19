export function GroupBy<T>(arr: T[], keySelector: (item: T) => string): { [key: string]: T[] } {
    const result: { [key: string]: T[] } = {};
    for (const item of arr) {
        const key = keySelector(item);
        if (!result[key]) {
            result[key] = [];
        }
        result[key].push(item);
    }
    return result;
}

export function WithDistinct<T, TK>(arr: T[], keySelector: (item: T) => TK, eq?: (a: TK, b: TK) => boolean): T[] {
    const equalityComparer = eq ?? ((a, b) => a === b);
    const keys: TK[] = [];
    const results: T[] = [];
    for (const item of arr) {
        const key = keySelector(item);
        if(keys.some(k => equalityComparer(k, key))) {
            continue;
        }
        results.push(item);
    }
    return results;
}

export function Distinct<T>(arr: T[], eq?: (a: T, b: T) => boolean): T[] {
    const equalityComparer = eq ?? ((a, b) => a === b);
    const result:T[] = [];
    for(const item of arr) {
        if(!result.some(r => equalityComparer(r, item))) {
            result.push(item);
        }
    }
    return result;
}