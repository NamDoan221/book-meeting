import {
  Component, OnDestroy, OnInit, ViewChild, ElementRef, ChangeDetectionStrategy,
  ChangeDetectorRef, ViewRef, ViewChildren, QueryList
} from '@angular/core';
import { Group } from './api/group';
import { HnChatService } from './services/chat.service';
import * as moment from 'moment';
import { Message } from './api/message';
import { AuthService } from '../shared/services/auth.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { IFilter } from './api/filter';
import { User } from './api/user';
import { HnContactsComponent } from './contacts/contacts.component';

@Component({
  selector: 'hn-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HnChatComponent implements OnInit, OnDestroy {
  public user: User;
  public group: Group;
  public messageContent: string;
  public messageArray: Array<Message>;
  public isViewMore: boolean;
  public typing: boolean;
  public userTyping = new Subject<string>();
  private scrollContainer: any;
  private isNearBottom = false;
  public filter: IFilter;
  public isHasMessage: boolean;
  public loading: boolean;

  @ViewChild('message') message: ElementRef;
  @ViewChild('scroll', { static: false }) scroll: ElementRef;
  @ViewChildren('item') itemElements: QueryList<any>;
  @ViewChild('contact') contact: HnContactsComponent;

  constructor(
    private chatService: HnChatService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef) {
    this.messageArray = [];
    this.user = {
      name: '',
      avatar: 'https://stock.wikimini.org/w/images/9/95/Gnome-stock_person-avatar-profile.png',
    };
    this.group = undefined;
    this.isViewMore = false;
    this.userTyping.pipe(
      debounceTime(2000),
      distinctUntilChanged())
      .subscribe(() => {
        this.chatService.endTyping({ user: this.user, group: this.group });
        this.message.nativeElement.blur();
      });

    this.filter = {
      page: 1,
      perpage: 15
    };
  }

  private onItemElementsChanged(): void {
    if (this.isNearBottom) {
      this.scrollToBottom();
    }
  }

  private scrollToBottom(): void {
    this.scrollContainer.scroll({
      top: this.scrollContainer.scrollHeight,
      left: 0,
      behavior: 'smooth'
    });
  }

  scrolled(event: any): void {
    this.isNearBottom = this.isUserNearBottom();
    if (this.isNearBottom && this.isHasMessage) {
      this.getGroupMessage();
    }

  }

  private isUserNearBottom(): boolean {
    const threshold = 50;
    const position = this.scrollContainer.scrollTop + this.scrollContainer.offsetHeight;
    const height = this.scrollContainer.scrollHeight;
    return position > height - threshold;
  }

  public detectChanges(): void {
    setTimeout(() => {
      if (this.cdr && !(this.cdr as ViewRef).destroyed) {
        this.cdr.detectChanges();
      }
    });
  }

  join(): void {
    this.chatService.joinGroup({
      user: this.user,
      group: this.group._id,
      time: moment(),
    });
    this.getGroupMessage();
  }

  async getGroupMessage(): Promise<boolean> {
    if (this.loading) {
      return;
    }
    this.loading = true;
    try {
      this.filter.groupId = this.group._id;
      const result = await this.chatService.getGroupMessage(this.filter);
      this.loading = false;
      this.messageArray = [...this.messageArray, ...result.data];
      this.scrollContainer = this.scroll.nativeElement;
      this.itemElements.changes.subscribe(_ => this.onItemElementsChanged());
      this.detectChanges();
      if (result.currentPage < result.pageCount) {
        this.filter.page = ++result.currentPage;
        return this.isHasMessage = true;
      }
      this.isHasMessage = false;
    } catch (error) {
      this.loading = false;
      console.log(error);
    }
  }

  leave(): void {
    this.chatService.leaveGroup({
      user: this.user,
      group: this.group._id,
      time: moment(),
    });
    this.group = undefined;
    this.messageArray = [];
  }

  sendMessage(): void {
    if (!this.messageContent) {
      return;
    }
    this.chatService.sendMessage({
      user: this.user,
      group: this.group._id,
      time: moment(),
      message: this.messageContent,
    });
    this.messageContent = '';
  }

  async getUser(): Promise<void> {
    const result = await this.auth.getAccount();
    this.auth.setAccountLocalStorage(result);
    this.user = result;
    this.contact.setUser(this.user);
    this.detectChanges();
  }

  viewMore(): void {
    this.isViewMore = !this.isViewMore;
  }

  hiddenViewMore(): void {
    this.isViewMore = false;
  }

  handlerChooseGroup(group: Group): void {
    if (this.group && group._id === this.group._id) {
      return;
    }
    this.group = group;
    this.filter.page = 1;
    this.messageArray = [];
    this.isNearBottom = false;
    this.join();
  }

  checkTime(mes, mesBefore): boolean {
    if (!mes || !mesBefore) {
      return;
    }
    const duration = moment.duration(moment(mes.time).diff(moment(mesBefore.time)));
    const minute = duration.asMinutes();
    if (minute > 1.5) {
      return true;
    }
    return false;
  }

  onTyping(): void {
    this.chatService.typing({ user: this.user, group: this.group });
  }

  ngOnInit(): void {
    this.getUser();

    this.chatService
      .newUserJoined()
      .subscribe((data) => this.messageArray.push(data));

    this.chatService
      .userLeftGroup()
      .subscribe((data) => this.messageArray.push(data));

    this.chatService
      .newMessageReceived()
      .subscribe(async (data) => {
        this.messageArray.push(data);
        this.detectChanges();
      });
    this.chatService
      .allUserTyping()
      .subscribe((data) => {
        if (data.user.name !== this.user.name) {
          this.typing = data.typing;
        }
      });
  }

  ngOnDestroy(): void {
    this.userTyping.unsubscribe();
  }
}
