import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DatabasePage } from './database';

@NgModule({
  declarations: [
    DatabasePage,
  ],
  imports: [
    IonicPageModule.forChild(DatabasePage),
  ],
  exports: [
    DatabasePage
  ]
})
export class DatabasePageModule {}
