import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { ConstantDefines } from '../defines/constant.define';

@Injectable({
  providedIn: 'root',
})
export class CacheService {
  public setKey(key: string, data: string) {
    localStorage.setItem(key, CryptoJS.AES.encrypt(data, ConstantDefines.CRYPTO_KEY).toString());
  }

  public getKey(key: string) {
    const data = localStorage.getItem(key);
    if (!data) {
      return undefined;
    }
    return CryptoJS.AES.decrypt(data, ConstantDefines.CRYPTO_KEY).toString(CryptoJS.enc.Utf8);
  }

  public clearAll() {
    localStorage.clear();
  }
}
