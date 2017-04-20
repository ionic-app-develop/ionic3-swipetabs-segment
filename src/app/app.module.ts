import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { FirstTabPage } from '../pages/tab-first/firstTab';
import { SecondTabPage } from '../pages/tab-second/secondTab';
import { ThirdTabPage } from '../pages/tab-third/thirdTab';
import { ForthTabPage } from '../pages/tab-forth/forthTab';
import { TabsPage } from '../pages/tabs/tabs';

import { PageToPushPage } from '../pages/page-to-push/page-to-push';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

@NgModule({
  declarations: [
    MyApp,
    FirstTabPage,
    SecondTabPage,
    ThirdTabPage,
    ForthTabPage,
    TabsPage,
    PageToPushPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp)  
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    FirstTabPage,
    SecondTabPage,
    ThirdTabPage,
    ForthTabPage,
    TabsPage,
    PageToPushPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
