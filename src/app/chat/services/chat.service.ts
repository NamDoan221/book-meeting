import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import { Observable } from 'rxjs';
import { Message } from '../api/message';
import { DOMAIN_SITE } from 'src/app/shared/services/base-url.define';
import { HttpClient, HttpParams } from '@angular/common/http';
import { IFilter } from '../api/filter';

@Injectable()

export class HnChatService {

  private socket = io(`${DOMAIN_SITE()}`, { transports: ['websocket', 'polling', 'flashsocket'] });
  constructor(
    private http: HttpClient
  ) { }

  joinGroup(data: any): any {
    this.socket.emit('join', data);
  }

  newUserJoined(): Observable<Message> {
    const observable = new Observable<Message>(observer => {
      this.socket.on('new user joined', (data: Message) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    });
    return observable;
  }

  leaveGroup(data: any): any {
    this.socket.emit('leave', data);
  }

  userLeftGroup(): Observable<Message> {
    const observable = new Observable<Message>(observer => {
      this.socket.on('left group', (data: Message) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    });
    return observable;
  }

  sendMessage(data: any): any {
    this.socket.emit('message', data);
  }

  typing(data: any): any {
    this.socket.emit('typing', data);
  }
  endTyping(data: any): any {
    this.socket.emit('endTyping', data);
  }

  allUserTyping(): Observable<any> {
    const observable = new Observable<any>(observer => {
      this.socket.on('user typing', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    });
    return observable;
  }

  newMessageReceived(): Observable<Message> {
    const observable = new Observable<Message>(observer => {
      this.socket.on('new message', (data: Message) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    });
    return observable;
  }

  getGroupInfo(groupIds: string): Promise<any> {
    const params = new HttpParams({ fromString: `groups=${groupIds}` });
    return new Promise((resolve, reject) => {
      this.http.get(`${DOMAIN_SITE()}groups/`, { params }).subscribe(result => {
        resolve(result);
      }, err => {
        reject(err);
      });
    });
  }

  getGroupMessage(filter: IFilter): Promise<any> {
    const params = new HttpParams({ fromString: `page=${filter.page}&perpage=${filter.perpage}` });
    return new Promise((resolve, reject) => {
      this.http.get(`${DOMAIN_SITE()}messages/${filter.groupId}`, { params }).subscribe(result => {
        resolve(result);
      }, err => {
        reject(err);
      });
    });
  }

  getUser(name: string): Promise<any> {
    const params = new HttpParams({ fromString: `name=${name}` });
    return new Promise((resolve, reject) => {
      this.http.get(`${DOMAIN_SITE()}users`, { params }).subscribe(result => {
        resolve(result);
      }, err => {
        reject(err);
      });
    });
  }

}
