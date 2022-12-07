/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class GlobalEventService {
  private urlReplaceBehaviorSubject: BehaviorSubject<string> = new BehaviorSubject('');
  get UrlReplaceBehaviorSubject() {
    return this.urlReplaceBehaviorSubject;
  }
}
