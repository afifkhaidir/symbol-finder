import BrowserWindow from 'sketch-module-web-view'
import { getWebview } from 'sketch-module-web-view/remote'
import UI from 'sketch/ui'
import Sketch from 'sketch/dom'

const webviewIdentifier = 'symbol-finder.webview';

const getSymbols = (doc, libs = []) => {
  const docSymbols = doc.getSymbols();
  const symbolLibs = libs
    .filter(lib => lib.enabled)
    .reduce((acc, lib) => {
      const symbolRefs = lib.getImportableSymbolReferencesForDocument(doc)
        .map(symbol => ({
          name: `${lib.name} / ${symbol.name}`,
          id: symbol.id,
          reference: symbol,
        }));
      
      return [...acc, ...symbolRefs];
    }, []);

  const symbolLocals = docSymbols
    .filter(symbol => !symbol.getLibrary())
    .map(symbol => ({
      name: `Document / ${symbol.name}`,
      id: symbol.symbolId,
      reference: symbol,
    }));
  
  return [...symbolLocals, ...symbolLibs];
}

const getSVGString = (layerInstance) => {
  var svgString;
  var layer = layerInstance.sketchObject;

  try {
    var ancestry = MSImmutableLayerAncestry.ancestryWithMSLayer(layer);
    var exportRequest = MSExportRequest.exportRequestsFromLayerAncestry(ancestry).firstObject();
    exportRequest.format = 'svg';
    var exporter = MSExporter.exporterForRequest_colorSpace_(exportRequest, NSColorSpace.sRGBColorSpace());
    var svgData = exporter.data();
    svgString = NSString.alloc().initWithData_encoding(svgData, NSUTF8StringEncoding);
  }
  catch(err) {
    console.error(err);
  }

  return svgString;
}

export default function () {
  const options = {
    title: 'Symbol Finder',
    identifier: webviewIdentifier,
    width: 640,
    height: 480,
    show: false,
    vibrancy: 'ultra-dark',
    hidesOnDeactivate: false,
    minimizable: false,
    maximizable: false,
    alwaysOnTop: true,
  };

  const browserWindow = new BrowserWindow(options);
  const { webContents } = browserWindow;
  const { Library, SymbolInstance, Page } = Sketch;
  const doc = Sketch.getSelectedDocument();
  const libs = Library.getLibraries();
  const symbols = getSymbols(doc, libs);
  const symbolsCompact = symbols.map(({ name, id }) => ({ name, id }));
  const symbolsPage = Page.getSymbolsPage(doc) || Page.createSymbolsPage();


  /* ===== BrowserWindow events ===== */
  browserWindow.once('ready-to-show', () => {
    browserWindow.show();
  });

  /* ===== BrowserWindow.webContents events ===== */
  webContents.on('did-finish-load', () => {
    webContents
      .executeJavaScript(`displaySymbols(${JSON.stringify(symbolsCompact)})`)
      .catch(console.error);
  });

  webContents.on('getSymbolImage', symbolId => {
    /* create new symbol instance */
    if (symbolId) {
      const ref = symbols.find(symbol => symbol.id === symbolId).reference;
      const masterSymbol = ref.type === 'ImportableObject'
        ? ref.import()
        : ref;
      const instance = new SymbolInstance({
        name: 'current sf symbol',
        symbolId: masterSymbol.symbolId,
        parent: symbolsPage,
        frame: masterSymbol.frame,
      });
      const symbolSVG = getSVGString(instance).replace(/\n/g, '');
      const previewImg = {
        html: symbolSVG,
        name: masterSymbol.name,
        id: masterSymbol.symbolId,
      };

      webContents
        .executeJavaScript(`setPreviewImage(${JSON.stringify(previewImg)})`)
        .catch(console.error);

      /* remove temp instance */
      instance.remove();
    }
  });

  webContents.on('insertSymbol', symbolId => {
    if (symbolId) {
      const ref = symbols.find(symbol => symbol.id === symbolId).reference;
      const masterSymbol = ref.type === 'ImportableObject'
        ? ref.import()
        : ref;

      if (masterSymbol) {
        try {
          const nativeDocument = doc.sketchObject;
          const symbolRef = MSSymbolMasterReference.referenceForShareableObject(masterSymbol.sketchObject);
          const insertAction = nativeDocument.actionsController().actionForID("MSInsertSymbolAction");
          const tempMenuItem = NSMenuItem.alloc().init();
    
          tempMenuItem.setRepresentedObject([symbolRef]);
          insertAction.doPerformAction(tempMenuItem);
        } catch(e) {
            console.log("Exception: " + e);
        }
      } else {
        console.log("Error: ", symbolId);
      }
    }
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
