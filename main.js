const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const {exec} = require('child_process');
const fs = require('fs');
const { isPrimitive } = require('util');

indexFile = path.join(__dirname, 'src', 'index.html');
preload = path.join(__dirname, 'src', 'preload.js');

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    resizable: false,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });
  win.loadFile(indexFile)
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

sendData = function(event, data)
{
  console.log(data);
  event.reply('output',data);
};

runTask = function(task, event)
{
  exec(task, (error,stdout, stderr) => {
    if(error){
      sendData(event, error);
      return;
    }
    if(stderr){
      sendData(event, stderr);
      return;
    }
    sendData(event, stdout);
  });
};

const langtmp = {
  "cpp" : {
    run: (file, dir) => `g++ -o ${path.join(dir, 'main.exe')} ${path.join(dir, file)} && ${path.join(dir,"main.exe")}`,
  },
  "py" : {
    run: (file, dir) => `python3 ${path.join(dir, file)}`
  }
};

class Shit
{
    #shitField
    constructor(x)
    {
        this.#shitField = x;
    }
    getshit()
    {
        return{
            j: this.#shitField
        }
    }
};

var shit = new Shit(10);

ipcMain.on('run', (event, arg) => {

  var codePromise = new Promise((res, rej)=>{
    var [things, code] = [arg.slice(0, arg.indexOf('$$$')), 
      arg.slice(arg.indexOf('$$$') + 3)];
    var [lang, dir] = [things.slice(0, things.indexOf('@')), 
      things.slice(things.indexOf('@') + 1)];

    fs.writeFileSync(dir, code)
    res( dir.split('\\'));
  });

  codePromise.then((data) => {   
    var file = data[data.length - 1];
    var lang = file.slice(file.indexOf('.') + 1);
    var dir = '';
    
    for(var i = 0; i < data.length - 1; i++) dir += (data[i] + '\\');
    runTask(langtmp[lang].run(file, dir),event);
  });
  
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})