import BrowserWindow from 'sketch-module-web-view'
import { getWebview } from 'sketch-module-web-view/remote'
import UI from 'sketch/ui'
import Sketch from 'sketch/dom'

const webviewIdentifier = 'symbol-finder.webview'

const getSymbols = (doc, libs = []) => {
  // TODO: get symbols
  const docSymbols = doc.getSymbols();
  const symbolLibs = libs
    .filter(lib => lib.enabled)
    .reduce((acc, lib) => {
      const symbolRefs = lib.getImportableSymbolReferencesForDocument(doc)
        .map(symbol => ({ name: `${lib.name} / ${symbol.name}`, id: symbol.id }));
      
      return [...acc, ...symbolRefs];
    }, []);

  const symbolLocals = docSymbols
    .filter(symbol => !symbol.getLibrary())
    .map(symbol => ({ name: `document / ${symbol.name}`, id: symbol.id }));

  return [...symbolLocals, ...symbolLibs];
}

export default function () {
  const options = {
    identifier: webviewIdentifier,
    width: 640,
    height: 480,
    show: false,
    vibrancy: 'ultra-dark',
    hidesOnDeactivate: false,
    minimizable: false,
    maximizable: false,
  };

  const browserWindow = new BrowserWindow(options);
  const { webContents } = browserWindow;
  const doc = Sketch.getSelectedDocument();
  const libs = Sketch.Library.getLibraries();

  /* ===== BrowserWindow events ===== */
  browserWindow.once('ready-to-show', () => {
    browserWindow.show();
  });

  /* ===== BrowserWindow.webContents events ===== */
  webContents.on('did-finish-load', () => {
    const symbols = JSON.stringify(getSymbols(doc, libs));

    // console.log(symbols);

    webContents
      .executeJavaScript(`displaySymbols(${symbols})`)
      .catch(console.error);
  });

  webContents.on('logSymbols', symbols => {
    console.log(symbols);
  })

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
