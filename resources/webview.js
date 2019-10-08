(function() {
  const app = {
    searchRemove: document.querySelector(".sf-search__remove"),
    searchInput: document.querySelector(".sf-search input"),
    finder: document.querySelector(".sf-finder"),
    symbols: [
      {
        name: "01 Components / Button / Filled",
        id: 1
      },
      {
        name: "01 Components / Button / Ghost",
        id: 2
      },
      {
        name: "01 Components / Button / Transaction",
        id: 3
      },
      {
        name: "01 Components / Ticker / Filled",
        id: 4
      },
      {
        name: "01 Components / Ticker / Ghost",
        id: 5
      },
      {
        name: "01 Components / Bottom Sheet",
        id: 6
      },
      {
        name: "02 Icons / Digital",
        id: 7
      },
      {
        name: "Documentation",
        id: 8
      }
    ]
  };

  /* ===== Methods ===== */
  app.constructSymbol = symbols => {
    return symbols.map(symbol => {
      const levels = symbol.name
        .split("/")
        .map(level => level.trimEnd().trimStart());

      const structuredSymbol = levels.reduce(
        (acc, level, idx) => ({ ...acc, [`level${idx}`]: level }),
        { id: symbol.id, original: symbol.name, levelCount: levels.length - 1 }
      );

      return structuredSymbol;
    });
  };

  app.getRoots = (symbols, level) => {
    return symbols.reduce((result, symbol) => {
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
  };

  app.displaySymbolElement = (symbols, level, parentElem) => {
    const roots = app.getRoots(symbols, level);
    
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

      parentElem.appendChild(row);
    });
  };

  /* ===== Event Listener ====== */
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

  // disable the context menu (eg. the right click menu) to have a more native feel
  document.addEventListener("contextmenu", e => {
    e.preventDefault();
  });

  /* ===== Global function called from plugin ===== */
  window.displaySymbols = symbols => {
    const col = document.createElement('div');
    const initialSymbols = app.constructSymbol(symbols);

    window.initialSymbols = initialSymbols;

    col.classList.add('sf-finder-col');

    app.displaySymbolElement(initialSymbols, 0, col);
    app.finder.appendChild(col);
  };

  // call the wevbiew from the plugin
  window.setRandomNumber = randomNumber => {
    document.getElementById("answer").innerHTML =
      "Random number from the plugin: " + randomNumber;
  };

  // window.displaySymbols(app.symbols);
})();
