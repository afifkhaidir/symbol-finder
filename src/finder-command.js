import BrowserWindow from 'sketch-module-web-view'
import { getWebview } from 'sketch-module-web-view/remote'
import UI from 'sketch/ui'
import Sketch from 'sketch/dom'

const webviewIdentifier = 'symbol-finder.webview'

const getSymbols = (doc, libs) => {
  // TODO: get symbols
}

export default function () {
  const options = {
    identifier: webviewIdentifier,
    width: 640,
    height: 480,
    show: false,
    vibrancy: 'ultra-dark'
  };

  const browserWindow = new BrowserWindow(options);
  const { webContents } = browserWindow;
  const doc = Sketch.getSelectedDocument();
  const lib = Sketch.Library.getLibraries();

  /* ===== BrowserWindow events ===== */
  browserWindow.once('ready-to-show', () => {
    browserWindow.show();
  });

  /* ===== BrowserWindow.webContents events ===== */
  webContents.on('did-finish-load', () => {
    UI.message('UI loaded!');
  });

  browserWindow.loadURL(require('../resources/webview.html'))
}


// When the plugin is shutdown by Sketch (for example when the user disable the plugin)
// we need to close the webview if it's open
export function onShutdown() {
  const existingWebview = getWebview(webviewIdentifier)
  if (existingWebview) {
    existingWebview.close()
  }
}
