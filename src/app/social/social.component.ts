import { HnChatService } from './../chat/services/chat.service';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../lib/services/auth.service';

@Component({
  selector: 'hn-social',
  templateUrl: './social.component.html',
  styleUrls: ['./social.component.scss']
})
export class HnSocialComponent implements OnInit {

  public users: Array<any>;
  public userLogginName: any;
  constructor(
    private chatService: HnChatService,
    private auth: AuthService
  ) {
    this.users = new Array<any>();
    this.userLogginName = this.auth.getAccountLocalStorage();
  }

  ngOnInit(): void {
  }

  async searchFriend(event): Promise<void> {
    console.log(event.target.value);

    this.users = await this.chatService.getUser(event.target.value);
  }

  async addFriend(event): Promise<void> {
    const data = {
      _id: [event._id, this.userLogginName._id],
      name: `${event.name},${this.userLogginName.name}`
    };
    await this.chatService.createGroup(data);
  }
}
