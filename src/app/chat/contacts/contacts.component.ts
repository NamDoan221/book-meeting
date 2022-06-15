import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectionStrategy, ViewRef, ChangeDetectorRef } from '@angular/core';
import { Group } from '../api/group';
import { AuthService } from 'src/app/lib/services/auth.service';
import { cloneDeep } from 'lodash';
import { HnChatService } from '../services/chat.service';
import { User } from '../api/user';

@Component({
  selector: 'hn-chat-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HnContactsComponent implements OnInit {

  public groupsList: Array<Group>;
  public groupsTemp: Array<Group>;
  public selectedGroup: Group;
  public user: User;

  @Input('group') set Group(data: Group) {
    this.selectedGroup = data;
  }

  // tslint:disable-next-line: no-output-on-prefix
  @Output() onChangeGroup = new EventEmitter<Group>();

  constructor(
    private chatService: HnChatService,
    private cdr: ChangeDetectorRef
  ) {
    this.groupsList = [];
    this.selectedGroup = undefined;
  }

  ngOnInit(): void { }

  public detectChanges(): void {
    setTimeout(() => {
      if (this.cdr && !(this.cdr as ViewRef).destroyed) {
        this.cdr.detectChanges();
      }
    });
  }

  public setUser(user: User): void {
    this.user = user;
    this.getGroup();
  }

  async getGroup(): Promise<void> {
    const groupIds = this.user.groups.join(';');
    const result = await this.chatService.getGroupInfo(groupIds);
    this.groupsList = result;
    this.groupsTemp = cloneDeep(this.groupsList);
    this.detectChanges();
  }

  searchGroup(event: any): any {
    if (event.target.value === '') {
      this.groupsList = this.groupsTemp;
      return;
    }
    this.groupsList = this.groupsTemp.filter(
      (group) =>
        this.removeAccents(group.name)
          .toLowerCase()
          .indexOf(this.removeAccents(event.target.value).toLowerCase()) > -1
    );
  }

  removeAccents(str: string): string {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  chooseGroup(group: Group): void {
    this.selectedGroup = group;
    this.onChangeGroup.emit(group);
  }
}
