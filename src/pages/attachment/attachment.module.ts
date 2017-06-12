import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AttachmentPage } from './attachment';

@NgModule({
  declarations: [
    AttachmentPage,
  ],
  imports: [
    IonicPageModule.forChild(AttachmentPage),
  ],
  exports: [
    AttachmentPage
  ]
})
export class AttachmentPageModule {}
