//EventRegestry Main
var oMiniFy =  document.getElementById('minifyBtn'),
oDateFilterInput =  document.getElementById('cbDateFilter'),
oCloseBtn =  document.getElementById('closeBtn'),
oSettingsBtn = document.getElementById('settingsBtn');

oMiniFy.addEventListener('click', function (event) {
    ipcRenderer.sendSync("minifyWindow", event);
});

oDateFilterInput.addEventListener('change', function (event) {
    console.log(event.target.value);
    var oFilter = {date: event.target.value};
    if(oFilter.date == ""){oFilter = {}}
    ipcRenderer.sendSync("filterCbMainlist", event, oFilter);
});

oCloseBtn.addEventListener('click', function (event) {
    var bConfirmed = window.confirm("Close App or just minimize");
    if (bConfirmed) {
        ipcRenderer.sendSync("closeWindow", event);
      } else {
        ipcRenderer.sendSync("minifyWindow", event);
      }
});

oSettingsBtn.addEventListener('click', function (event) {
    ipcRenderer.sendSync("showSettings", event);
});