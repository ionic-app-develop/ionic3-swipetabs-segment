import { Component } from '@angular/core';

import { FirstTabPage } from '../tab-first/firstTab';
import { SecondTabPage } from '../tab-second/secondTab';
import { ThirdTabPage } from '../tab-third/thirdTab';
import { ForthTabPage } from '../tab-forth/forthTab';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = FirstTabPage;
  tab2Root = SecondTabPage;
  tab3Root = ThirdTabPage;
  tab4Root = ForthTabPage;

  constructor() {

  }
}
