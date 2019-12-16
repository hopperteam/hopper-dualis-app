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

export function encryptContent(subscribeRequest: any): any {
    let contentJSON = JSON.stringify(subscribeRequest);
    const sha = crypto.createHash('sha256');
    sha.update(contentJSON);
    let hash = Buffer.from(sha.digest('hex'));
    let encrypted = crypto.privateEncrypt(
        {
            key: Config.instance.privateKey,
            passphrase: Config.instance.passphrase
        },
        hash);
    let obj = {"verify":encrypted.toString('base64'), "data": subscribeRequest};
    console.log(obj)
    return Buffer.from(JSON.stringify(obj)).toString('base64');
}
