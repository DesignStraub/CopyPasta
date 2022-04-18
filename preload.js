const {ipcRenderer, contextBridge} = require('electron');
contextBridge.exposeInMainWorld("ipcRenderer",ipcRenderer)

var fnWriteCbItem = function(oEvent){
    var sId = this.parentElement.id;
    ipcRenderer.send("writeCbItem", sId);
}



ipcRenderer.on('renderCbList', function (event,list) {
    var oList = document.getElementById('cbList');
    oList.innerHTML = '';
    for (let index = list.length; index > -1; index--) {
        let oItem = list[index],
        oClipboardListItem = document.createElement('li'),
        textarea = document.createElement('textarea'),
        date = document.createElement('p'),
        deleteButton = document.createElement('button');
        if(oItem){
        //prepare list
        oClipboardListItem.id = oItem.id;
        oClipboardListItem.className = 'cbListItem';

        //prepare textarea
        textarea.disabled = true;
        textarea.className = 'cbTextarea';
        textarea.rows = 4;
        textarea.cols = 50;
        textarea.value = oItem.text;
        
        //prepare date
        date.appendChild(document.createTextNode(oItem.timestamp));
        date.className = 'cbDate';
        //prepare buttons
        deleteButton.innerHTML = '<div class="dripicons-trash"></div>';
        deleteButton.onclick = function(oEvent){
            var sId = this.parentElement.id;
            ipcRenderer.send("deleteCbItem", sId);
        }
        
        deleteButton.className = 'deleteCbListItem';
        //add childs to listitemthis.id
        oClipboardListItem.appendChild(textarea);
        oClipboardListItem.appendChild(date);
        oClipboardListItem.appendChild(deleteButton);

        //add Events to oClipboardListItem
        oClipboardListItem.addEventListener('click', function(oEvent){
            var sId = this.id;
            ipcRenderer.send("writeCbItem", sId);
        });
        oList.appendChild(oClipboardListItem);
        }
        
    }
    

});
ipcRenderer.on('scrollToTop', function (event,list) {
    window.scrollTo(0, 0);
});


