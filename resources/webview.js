(function() {
  /* ==========================
   * 01. Global Variables
   * ========================== */
  const app = {
    currentTree: [],
    finder: document.querySelector(".sf-finder"),
    original: [], // original symbol name from sketch [ONLY UDPDATED ONCE]
    searchInput: document.querySelector(".sf-search input"),
    searchRemove: document.querySelector(".sf-search__remove"),
    symbols: [], // converted symbol name into leveled folder [UPDATED WHILE SEARCHING]
  };


  /* ==========================
   * 02. Methods 
   * ========================== */
  /**
   * Clear following columns
   */
  app.clearColumns = (startLevel, isStartLevelIncluded = false) => {
    const elems = [...app.finder.children];
    const beginLevel = isStartLevelIncluded ? startLevel : startLevel + 1;

    Array.prototype.forEach.call(elems, (elem, idx) => {
      if (idx >= beginLevel) {
        elem.remove();
      }
    });
  }

  /**
   * Construct leveling object from string
   */
  app.constructSymbol = original => {
    return original.map(symbol => {
      const levels = symbol.name
        .split("/")
        .filter(Boolean)
        .map(level => level.trimEnd().trimStart());

      const structuredSymbol = levels.reduce(
        (acc, level, idx) => ({ ...acc, [`level${idx}`]: level }),
        { id: symbol.id, levelCount: levels.length - 1 }
      );

      return structuredSymbol;
    });
  };

  /**
   * Returned filtered symbols which match saved tree
   */
  app.filteredSymbols = (recentLevel) => {
    const symbols = app.symbols.reduce((acc, symbol) => {
      const matchCurrentTree = app.currentTree.reduce((match, tree, idx) => {
        if (match === false) {
          return false;
        }
        if (symbol[`level${idx}`] === tree && symbol.levelCount > recentLevel) {
          return true;
        }
        return false;
      }, undefined);
      
      if (matchCurrentTree) {
        return [
          ...acc,
          { ...symbol, levelCount: symbol.levelCount - recentLevel - 1 }  // decrement lv count
        ];
      }
      return acc;
    }, []);

    // console.log(symbols, app.currentTree);
    return symbols;
  }

  /**
   * Get roots [Array] of the new level
   */
  app.getRoots = (symbols, level) => {
    const roots = symbols.reduce((result, symbol) => {
      const rootName = symbol[`level${level}`];
      const isExist = result.some(item => item.name === rootName);

      if (symbol.levelCount > 0) {
        const restTree = result.filter(item => (
          item.name !== rootName ||
          item.name == rootName && !item.hasChildren
        ));

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

  /**
   * append new level directory
   */
  app.renderSymbolElement = (symbols, level) => {
    const roots = app.getRoots(symbols, level);
    const col = document.createElement('div');
    
    roots.forEach(rootItem => {
      const row = document.createElement('div');
      const rowText = document.createTextNode(rootItem.name);

      if (rootItem.hasChildren) {
        row.classList.add('has-children');
      } else {
        // const img = document.createElement('img');

        // img.setAttribute('src', 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSIjOUZBNkIwIiBkPSJNMTkgNi40MUwxNy41OSA1IDEyIDEwLjU5IDYuNDEgNSA1IDYuNDEgMTAuNTkgMTIgNSAxNy41OSA2LjQxIDE5IDEyIDEzLjQxIDE3LjU5IDE5IDE5IDE3LjU5IDEzLjQxIDEyeiIvPjxwYXRoIGQ9Ik0wIDBoMjR2MjRIMHoiIGZpbGw9Im5vbmUiLz48L3N2Zz4=');
        
        row.setAttribute('data-symbol-id', rootItem.id);
        // row.appendChild(img);
      }

      row.classList.add('sf-finder-row');
      row.appendChild(rowText);
      row.setAttribute("data-level", level);

      col.appendChild(row);
    });

    col.classList.add('sf-finder-col');
    app.finder.appendChild(col);
  };

  /** 
   * Render SVG image from sketch
   */
  app.renderPreviewImage = ({ id, html, name }) => {
    const col = document.createElement('div');
    col.classList.add('sf-finder-col');
    col.classList.add('sf-preview');

    app.finder.appendChild(col);
    
    const img = document.createElement('img');
    img.classList.add('sf-preview__img');
    img.setAttribute('data-symbol-id', id);
    img.setAttribute('src', `data:image/svg+xml;base64,${window.btoa(html)}`);

    col.appendChild(img);

    const title = document.createElement('h2');
    title.classList.add('sf-preview__title');
    title.innerHTML = name;

    col.appendChild(title);
  };

  /**
   * clear prev selected, set row as selected
   */
  app.setSelectedRow = elem => {
    const prevSelected = elem.parentNode.querySelector('.selected');

    if (prevSelected) {
      prevSelected.classList.remove('selected');
    }

    elem.classList.add('selected');
  };

  /**
   * save state of current selected dirName
   */
  app.saveTreeState = (dirName, level) => {
    app.currentTree = [
      ...app.currentTree.slice(0, level),
      dirName
    ]
  };
  
  /**
   * get string symbol from the nearest '/' before search string
   * 
   * input: 'utton' of 'components / button / main'
   * output: 'button / main'
   */
  app.getTrimmedSymbolName = (key, words) => {
    const slashIdx = words
      .slice(0, words.toLowerCase().indexOf(key.toLowerCase()))
      .split('')
      .reduce((a, c, idx) => (c === '/' ? idx : a), 0);

    return words.slice(slashIdx);
  };


  /* ==========================
   * 03. Event Listener
   * ========================== */
  app.searchInput.addEventListener("keyup", () => {
    const val = app.searchInput.value;

    if (val !== "") {
      const filteredSymbol = app.original.reduce((res, { id, name: symbolName }) => {
        return symbolName.toLowerCase().indexOf(val.toLowerCase()) !== -1
          ? [...res, { id, name: app.getTrimmedSymbolName(val, symbolName) }]
          : res;
      }, []);

      app.symbols = app.constructSymbol(filteredSymbol);
      app.clearColumns(0, true);
      app.renderSymbolElement(app.symbols, 0);
      app.searchRemove.classList.add("active");
    } else {
      app.symbols = app.constructSymbol(app.original);
      app.clearColumns(0, true);
      app.renderSymbolElement(app.symbols, 0);
      app.searchRemove.classList.remove("active");
    }
  });

  app.searchRemove.addEventListener("click", () => {
    app.searchInput.value = "";
    app.symbols = app.constructSymbol(app.original);
    app.clearColumns(0, true);
    app.renderSymbolElement(app.symbols, 0);
    app.searchRemove.classList.remove("active");
  });

  document.addEventListener('click', e => {
    if (e.target && e.target.matches('.sf-finder-row')) {
      const level = parseInt(e.target.getAttribute('data-level'));

      app.clearColumns(level);

      /* if folder, create new column for children */
      if (e.target.matches('.has-children')) {
        const dirName = e.target.textContent;

        app.saveTreeState(dirName, level);
        app.renderSymbolElement(app.filteredSymbols(level), level + 1);
      } else {
        /* log selected symbols */
        window.postMessage('getSymbolImage', e.target.getAttribute('data-symbol-id'));

        /* insert selected symbol */
        window.postMessage('insertSymbol', e.target.getAttribute('data-symbol-id'));
      }

      app.setSelectedRow(e.target);
    }
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

    app.renderSymbolElement(initialSymbols, 0);
  };

  window.setPreviewImage = previewImg => {
    app.renderPreviewImage(previewImg);
  };

  // window.displaySymbols(JSON.parse(symbolDataJson));
})();
