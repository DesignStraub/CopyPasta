
var oKill =  document.getElementById('killAllEntrys'),
oCloseSettings = document.getElementById('closeSettBtn');

oKill.addEventListener('click', function (event) {
    var bConfirmed = window.confirm("Delete all Entrys?");
    if (bConfirmed) {
        ipcRenderer.sendSync("killAllEntrys", event);
    }
});


oCloseSettings.addEventListener('click', function (event) {
        ipcRenderer.sendSync("hideSettings", event);
});
