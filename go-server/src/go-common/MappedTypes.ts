export type Optional<T> = {
    [p in keyof T]?: T[p];
};