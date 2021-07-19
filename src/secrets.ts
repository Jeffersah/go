const possibleChars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function GenerateSecret() {
    let result = '';
    for (let i = 0; i < 32; i++) {
        result += possibleChars[Math.floor(Math.random() * possibleChars.length)];
    }
    return result;
}