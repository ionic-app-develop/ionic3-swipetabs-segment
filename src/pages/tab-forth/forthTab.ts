import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-forthTab',
  templateUrl: 'forthTab.html'
})
export class ForthTabPage {
  username: string;
  myHero = 'Windstorm';

  constructor(public navCtrl: NavController) {
	// this.username = 'Alex';
  }

  updatePicture() {
    console.log('Clicked to update picture');
  }

  changeUsername() {
    console.log('Clicked to changeUsername');
  }

  changePassword() {
    console.log('Clicked to logout');
  }

  logout() {
    this.username = '';
  }

  onLogin() {
    this.username = 'Alex';
  }

}
