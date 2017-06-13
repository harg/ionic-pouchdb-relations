import { File } from '@ionic-native/file';


export class FileUtils {

  private static _filePlugin: File = null;
  private static _root: string;

  static get filePlugin() : File {
    if(this._filePlugin == null) {
      this._filePlugin = new File();
      this._root = FileUtils.filePlugin.externalApplicationStorageDirectory;
    }
    return this._filePlugin;
  }

  /**
   * renvois le contenu du fichier en string
   *
   * @param dirname repertoire depuis le root ex: dumps
   * @param filename le nom du fichier ex: test.pdf
   */
  static async getFileContentAsString(dirname: string, filename: string) {
    return this.filePlugin.resolveDirectoryUrl(FileUtils._root)
      .then(dirEntry => {
        return this.filePlugin.getDirectory(dirEntry, dirname, { create: false, exclusive: false});
      })
      .then(dirEntry => {
        return this.filePlugin.getFile(dirEntry, filename, { create: false, exclusive: false});
      })
      .then(fileEntry => {
        return this.filePlugin.readAsText(FileUtils._root + dirname, filename);
      })
      .catch(err => { return err.message });
  }

  static async getFileContent(path: string) {
    var parts = path.split('/');
    var filename = parts[parts.length - 1];
    var dirname = parts.reverse().splice(1).reverse().join('/');
    return this.filePlugin.resolveDirectoryUrl(dirname)
      .then(dirEntry => {
        return this.filePlugin.getFile(dirEntry, filename, { create: false, exclusive: false});
      })
      .then(fileEntry => {
        return this.filePlugin.readAsText(dirname, filename);
      })
      .catch(err => { return err.message });
  }

  static errors = ['NOT_FOUND_ERR', 'SECURITY_ERR', 'ABORT_ERR', 'NOT_READABLE_ERR',
    'ENCODING_ERR', 'NO_MODIFICATION_ALLOWED_ERR', 'INVALID_STATE_ERR', 'SYNTAX_ERR',
    'INVALID_MODIFICATION_ERR', 'QUOTA_EXCEEDED_ERR', 'TYPE_MISMATCH_ERR', 'PATH_EXISTS_ERR'];

  static isError(message: string): boolean {
    return this.errors.indexOf(message) > -1;
  }

}
