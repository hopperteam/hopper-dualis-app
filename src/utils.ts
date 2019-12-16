import * as express from 'express';
import * as crypto from 'crypto';

import Log from './log';

export function handleError(err: Error, log: Log, res: express.Response, statusCode: number = 400) {
    log.error(err.message);
    res.status(statusCode);
    res.json({
        "status": "error",
        "reason": err.message
    });
}

export function encryptPassword(password: string): string {
    return "hello";
}

export function decryptPassword(password: string): string {
    return "hello";
}

export function getKeyPair(passphrase: string): any {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem',
            cipher: 'aes-256-cbc',
            passphrase: passphrase
        }
    });
    return { privateKey: privateKey, publicKey: publicKey };
}

/*
export function generateId(): string {
    const hash = crypto.createHash('sha256');
    hash.update(crypto.randomBytes(128).toString('base64'));
    return hash.digest('hex');
}

export function decryptContent(key: string, content: any): any {
    content = JSON.parse(Buffer.from(content, "base64").toString());

    let decryptedHash = crypto.publicDecrypt(Buffer.from(key, "base64"), Buffer.from(content.verify, "base64")).toString();
    const sha256 = crypto.createHash("sha256");
    sha256.update(JSON.stringify(content.data));
    let createdHash = sha256.digest("hex");
    if (decryptedHash != createdHash)
        throw new Error("Verification failed");

    return content.data;
}
*/