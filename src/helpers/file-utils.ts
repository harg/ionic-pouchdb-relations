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

  public static getDirectory(path: string): string {
    let parts = path.split('/');
    return parts.reverse().splice(1).reverse().join('/');
  }

  public static getFilename(path: string): string {
    let parts = path.split('/');
    return parts[parts.length - 1];
  }

  static async getFileContent(path: string) {
    let filename = this.getFilename(path);
    let dirname = this.getDirectory(path);
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

  static saveFile(dir: string, filename: string, data: any): Promise<string> {
    let dump_path: string;
    let file_path: string;
    return this.filePlugin.resolveDirectoryUrl(this._root)
      .then(dirEntry => {
        return this.filePlugin.getDirectory(dirEntry, dir, { create: true });
      })
      .then(dirEntry => {
        dump_path = dirEntry.nativeURL;
        return this.filePlugin.createFile(dirEntry.nativeURL, filename, true);
      })
      .then(fileEntry => {
        file_path = fileEntry.nativeURL;
        return this.filePlugin.writeExistingFile(dump_path, filename, data)
      })
      .then(() => {
        console.log(`File wrote : ${file_path}`)
        return file_path
      })
      .catch(err => { console.log(err.message); return 'Error!' });
  }

  static loadFileAsBinaryString(dir: string, filename: string) {
    return this.filePlugin.resolveDirectoryUrl(this._root)
      .then(dirEntry => {
        return this.filePlugin.getDirectory(dirEntry, dir, { create: false });
      })
      .then(dirEntry => {
        return this.filePlugin.getFile(dirEntry, filename, { create: false });
      })
      .then(fileEntry => {
        return this.filePlugin.readAsBinaryString(this._root + dir, filename);
      })
  }

}
