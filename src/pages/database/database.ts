import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { DbService } from '../../services/databases';

import { File } from '@ionic-native/file';
import { DocumentViewer, DocumentViewerOptions } from '@ionic-native/document-viewer';
import { EmailComposer } from '@ionic-native/email-composer';
import { FileUtils } from '../../helpers/file-utils';
import { LoadingController } from 'ionic-angular';

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
  providers: [DocumentViewer, EmailComposer]
})
export class DatabasePage {

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private dbService: DbService,
    private document: DocumentViewer,
    private filePlugin: File,
    private emailComposer: EmailComposer,
    private loadingCtrl: LoadingController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DatabasePage');
  }

  doExportDatabases() {
    this.dbService.dumpAllToFiles();
  }

  doImportDatabases() {
    let loader = this.loadingCtrl.create({
      content: "Restauration de la base de données et redémarrage de l'application, merci de patienter..."
    });
    loader.present({
      disableApp: true
    });
    this.dbService.importArchive(DbService.DUMPS_DIR, 'dump.zip')
      .then(_ => {
        document.location.reload(true)
        loader.dismiss();
      })
  }

  doOpenPdf() {
    let path = this.filePlugin.externalApplicationStorageDirectory;

    var VIEWER_OPTIONS: DocumentViewerOptions = {
      title: 'Test',
      documentView: {
        closeLabel: "OK"
      },
      navigationView: {
        closeLabel: "Fermer"
      },
      email: {
        enabled: true
      },
      print: {
        enabled: true
      },
      openWith: {
        enabled: false
      },
      bookmarks: {
        enabled: false
      },
      search: {
        enabled: false
      },
      autoClose: {
        onPause: false
      }
    };
    console.log(path + 'pdf/test.pdf');
    this.document.viewDocument(path + 'pdf/test.pdf', 'application/pdf', VIEWER_OPTIONS);
  }

  doSendMail() {

    let path = this.filePlugin.externalApplicationStorageDirectory;

    /*this.emailComposer.isAvailable().then((available: boolean) => {
      if (available) {
        console.log('available')
      }
    });*/

    let email = {
      to: 'akim.merabet@cmigroupe.com',
      cc: 'harold.gay@cmigroupe.com',
      bcc: [],
      attachments: [
        path + 'pdf/test.pdf',
        path + 'dumps/dump.zip'
      ],
      subject: 'Cordova Icons',
      body: 'How are you? Nice greetings from Leipzig',
      isHtml: true
    };

    // Send a text message using default options
    this.emailComposer.open(email);
  }

  doFileTest() {
    FileUtils.getFileContentAsString('dumps', 'items').then(content => {
      if (!FileUtils.isError(content))
        console.log(content);
      else
        console.log('Erreur: ' + content);
    })
  }

}
