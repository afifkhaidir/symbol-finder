(function() {
  const app = {
    searchRemove: document.querySelector('.sf-search__remove'),
    searchInput: document.querySelector('.sf-search input'),
    sfCol: document.querySelector('.sf-finder-col'),
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
      row.innerHTML = item.name;

      app.sfCol.appendChild(row);
    });
  }

  // call the plugin from the webview
  document.getElementById('button').addEventListener('click', () => {
    window.postMessage('nativeLog', 'Called from the webview')
  })

  // call the wevbiew from the plugin
  window.setRandomNumber = (randomNumber) => {
    document.getElementById('answer').innerHTML = 'Random number from the plugin: ' + randomNumber
  }
  

}());
