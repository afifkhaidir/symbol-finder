(function() {
  /* ==========================
   * 01. Global Variables
   * ========================== */
  const app = {
    currentTree: [],
    finder: document.querySelector(".sf-finder"),
    original: [],
    searchInput: document.querySelector(".sf-search input"),
    searchRemove: document.querySelector(".sf-search__remove"),
    symbols: [],
  };


  /* ==========================
   * 02. Methods 
   * ========================== */
  app.clearColumns = (currentLevel) => {
    const elems = [...app.finder.children];

    Array.prototype.forEach.call(elems, (elem, idx) => {
      if (idx > currentLevel) {
        elem.remove();
      }
    });
  }

  app.constructSymbol = original => {
    return original.map(symbol => {
      const levels = symbol.name
        .split("/")
        .map(level => level.trimEnd().trimStart());

      const structuredSymbol = levels.reduce(
        (acc, level, idx) => ({ ...acc, [`level${idx}`]: level }),
        { id: symbol.id, levelCount: levels.length - 1 }
      );

      return structuredSymbol;
    });
  };

  app.getRoots = (symbols, level) => {
    const roots = symbols.reduce((result, symbol) => {
      const rootName = symbol[`level${level}`];
      const isExist = result.some(item => item.name === rootName);

      if (isExist || symbol.levelCount > 0) {
        const restTree = result.filter(item => item.name !== rootName);

        return [
          ...restTree,
          { name: rootName, hasChildren: true, id: '' }
        ]
      }

      return [
        ...result,
        { name: rootName, hasChildren: false, id: symbol.id },
      ]
    }, []);

    // console.log(roots.filter(theRoot => theRoot.name === undefined));

    return roots.sort((a, b) => {
      const rootA = a.name.toUpperCase();
      const rootB = b.name.toUpperCase();
      
      if (rootA < rootB) {
        return -1;
      }
      if (rootA > rootB) {
        return 1;
      }
      return 0;
    })
  };

  app.renderSymbolElement = (symbols, level) => {
    const roots = app.getRoots(symbols, level);
    const col = document.createElement('div');
    
    roots.forEach(rootItem => {
      const row = document.createElement('div');

      row.classList.add('sf-finder-row');

      if (rootItem.hasChildren) {
        row.classList.add('has-children');
      } else {
        row.setAttribute('data-symbol-id', rootItem.id);
      }
      
      row.setAttribute("data-level", level);
      row.innerHTML = rootItem.name;

      col.appendChild(row);
    });

    col.classList.add('sf-finder-col');
    app.finder.appendChild(col);
  };

  app.renderPreviewImage = (previewImg) => {
    const col = document.createElement('div');
    col.classList.add('sf-finder-col');
    col.classList.add('sf-preview');

    app.finder.appendChild(col);
    
    const img = document.createElement('div');
    img.classList.add('sf-preview__img');
    img.setAttribute('data-symbol-id', previewImg.id);
    img.innerHTML = previewImg.html;

    col.appendChild(img);

    const title = document.createElement('h2');
    title.classList.add('sf-preview__title');
    title.innerHTML = previewImg.name;

    col.appendChild(title);
  };

  app.setSelectedRow = elem => {
    /* clear prev selected from the same column */
    const prevSelected = elem.parentNode.querySelector('.selected');

    if (prevSelected) {
      prevSelected.classList.remove('selected');
    }

    elem.classList.add('selected');
  };

  app.saveTreeState = (dirName, level) => {
    app.currentTree = [
      ...app.currentTree.slice(0, level),
      dirName
    ]
  };


  /* ==========================
   * 03. Event Listener
   * ========================== */
  app.searchInput.addEventListener("keyup", () => {
    if (app.searchInput.value !== "") {
      app.searchRemove.classList.add("active");
    } else {
      app.searchRemove.classList.remove("active");
    }
  });

  app.searchRemove.addEventListener("click", () => {
    app.searchInput.value = "";
    app.searchRemove.classList.remove("active");
  });

  document.addEventListener('click', e => {
    if (e.target && e.target.matches('.sf-finder-row')) {
      const level = parseInt(e.target.getAttribute('data-level'));

      /* clear next columns */
      app.clearColumns(level);

      /* if folder, create new column for children */
      if (e.target.matches('.has-children')) {
        const dirName = e.target.innerHTML;

        /* save state of current selected dirName */
        app.saveTreeState(dirName, level);

        const filteredSymbols = app.symbols.reduce((acc, symbol) => {
          const matchCurrentTree = app.currentTree.reduce((match, tree, idx) => {
            if (match === false) {
              return false;
            }
            if (symbol[`level${idx}`] === tree) {
              return true;
            }
            return false;
          }, undefined);
          
          if (matchCurrentTree) {
            return [
              ...acc,
              { ...symbol, levelCount: symbol.levelCount - level - 1 }  // decrement lv count
            ];
          }
          return acc;
        }, []);
  
        /* append new level directory */
        app.renderSymbolElement(filteredSymbols, level + 1);
      } else {
        /* clear next columns */
        app.clearColumns(level);
        
        /* log selected symbols */
        window.postMessage('getSymbolImage', e.target.getAttribute('data-symbol-id'));

        window.postMessage('insertSymbol', e.target.getAttribute('data-symbol-id'));
      }

      /* set row as selected */
      app.setSelectedRow(e.target);
    }

    // if (e.target && e.target.matches('.sf-preview__img')) {
    //   /* log selected symbols */
    //   window.postMessage('insertSymbol', e.target.getAttribute('data-symbol-id'));
    // }
  });

  // disable the context menu (eg. the right click menu) to have a more native feel
  document.addEventListener("contextmenu", e => {
    e.preventDefault();
  });

  
  /* ==========================
   * 04. Global functions
   * called from plugin
   * ========================== */
  window.displaySymbols = originalSymbols => {
    const initialSymbols = app.constructSymbol(originalSymbols);
    
    /* save initial state */
    app.original = originalSymbols;
    app.symbols = initialSymbols;

    /* display ui */
    app.renderSymbolElement(initialSymbols, 0);
  };

  window.setPreviewImage = previewImg => {
    app.renderPreviewImage(previewImg);
  };

  // window.displaySymbols(JSON.parse(symbolDataJson));
})();
