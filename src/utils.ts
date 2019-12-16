import * as express from 'express';
import * as crypto from 'crypto';
import { Config } from "./config";

import Log from './log';

export function handleError(err: Error, log: Log, res: express.Response, statusCode: number = 400) {
    log.error(err.message);
    res.status(statusCode);
    returnMessage("Error: " + err.message, res);
}

export function returnMessage(msg: string, res: express.Response) {
    res.redirect("/?msg=" + encodeURIComponent(msg));
}

export function encryptPassword(password: string): string {
    let encr = crypto.publicEncrypt(Config.instance.publicKey, Buffer.from(password));
    return encr.toString('base64');
}

export function decryptPassword(password: string): string {
    let decr = crypto.privateDecrypt({
        key: Config.instance.privateKey,
        passphrase: Config.instance.passphrase
    }, Buffer.from(password, 'base64'));
    return decr.toString();
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

export function encryptContent(content: any): any {
    content = JSON.stringify(content);
    const sha = crypto.createHash('sha256');
    sha.update(content);
    let hash = sha.digest('hex');
    let encryptedHash = crypto.privateEncrypt(
        {
            key: Config.instance.privateKey,
            passphrase: Config.instance.passphrase
        },
        Buffer.from(hash));
    let result = Buffer.from(JSON.stringify({ "verify": encryptedHash.toString(), "data": content })).toString('base64');
    return result;
}
