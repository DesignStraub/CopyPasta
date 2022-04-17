//EventRegestry Main
var oKill =  document.getElementById('killAllEntrys;');

oMiniFy.addEventListener('click', function (event) {
    var bConfirmed = window.confirm("Delete all Entrys?");
    if (bConfirmed) {
        ipcRenderer.sendSync("killAllEntrys", event);
    }
});
s