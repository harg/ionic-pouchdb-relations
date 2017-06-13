import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { File } from '@ionic-native/file';

import { ItemsPage } from '../pages/items/items';
import { CategoriesPage } from '../pages/categories/categories';
import { ItemNewPage } from '../pages/item_new/item_new';
import { TabsPage } from '../pages/tabs/tabs';

import { DatabasePage } from '../pages/database/database';


import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { DbService } from '../services/databases';

@NgModule({
  declarations: [
    MyApp,
    ItemsPage, CategoriesPage, DatabasePage,
    ItemNewPage,
    TabsPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    ItemsPage, CategoriesPage, DatabasePage,
    ItemNewPage,
    TabsPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    DbService,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    File,
  ]
})
export class AppModule {}
