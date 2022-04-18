
var oCloseTut = document.getElementById('closeTutBtn'),
oGotTut = document.getElementById('gotItBtn');

oCloseTut.addEventListener('click', function (event) {
    ipcRenderer.sendSync("hideTut", event);
});

oGotTut.addEventListener('click', function (event) {
    ipcRenderer.sendSync("hideTut", event);
});
