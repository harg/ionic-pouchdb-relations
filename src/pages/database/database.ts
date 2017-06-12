import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { DbService } from '../../services/databases';

/**
 * Generated class for the DatabasePage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-database',
  templateUrl: 'database.html',
})
export class DatabasePage {

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private dbService: DbService) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DatabasePage');
  }

  doExportDatabases() {
    //this.dbService.categoriesCollection().dump().then(s => console.log(s));
    //this.dbService.dump().then(s => console.log(s));
    this.dbService.dumpAllToFile();
  }

}
