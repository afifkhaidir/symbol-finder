(function() {
  const app = {
    searchRemove: document.querySelector('.sf-search__remove'),
    searchInput: document.querySelector('.sf-search input'),
    sfCol: document.querySelector('.sf-finder-col'),
    symbols: [
      {
        name: "01 Components / Button / Filled",
        id: 1,
      },
      {
        name: "01 Components / Button / Ghost",
        id: 2,
      },
      {
        name: "01 Components / Button / Transaction",
        id: 3,
      },
      {
        name: "01 Components / Ticker / Filled",
        id: 4,
      },
      {
        name: "01 Components / Ticker / Ghost",
        id: 5,
      },
      {
        name: "02 Icons / Digital",
        id: 6,
      },
    ],
  };

  /* ===== Event Listener ====== */
  app.searchInput.addEventListener('keyup', () => {
    if (app.searchInput.value !== "") {
      app.searchRemove.classList.add('active');
    } else {
      app.searchRemove.classList.remove('active');
    }
  });

  app.searchRemove.addEventListener('click', () => {
    app.searchInput.value = "";
    app.searchRemove.classList.remove('active');
  });

  // disable the context menu (eg. the right click menu) to have a more native feel
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault()
  })

  /* ===== Global function called from plugin ===== */
  window.displaySymbols = (symbols) => {
    symbols.forEach(item => {
      const row = document.createElement('div');

      row.classList.add('sf-finder-row');
      row.classList.add('has-child');
      row.innerHTML = item.name;

      app.sfCol.appendChild(row);
    });
  }

  // call the wevbiew from the plugin
  window.setRandomNumber = (randomNumber) => {
    document.getElementById('answer').innerHTML = 'Random number from the plugin: ' + randomNumber
  }
  
  window.displaySymbols(app.symbols);

}());
