import { HnChatService } from './../chat/services/chat.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'hn-social',
  templateUrl: './social.component.html',
  styleUrls: ['./social.component.scss']
})
export class HnSocialComponent implements OnInit {

  public users: Array<any>;
  constructor(
    private chatService: HnChatService
  ) {
    this.users = new Array<any>();
  }

  ngOnInit(): void {
  }

  async searchFriend(event): Promise<void> {
    console.log(event.target.value);

    this.users = await this.chatService.getUser(event.target.value);
  }

  addFriend(event): void {
    console.log(event);

  }
}
