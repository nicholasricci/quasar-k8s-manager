import { app, BrowserWindow, nativeTheme, ipcMain } from "electron";
import path from "path";
import os from "os";
import { WebSocket, WebSocketServer } from "ws";

// needed in case process is undefined under Linux
const platform = process.platform || os.platform();

try {
  if (platform === "win32" && nativeTheme.shouldUseDarkColors === true) {
    require("fs").unlinkSync(
      path.join(app.getPath("userData"), "DevTools Extensions")
    );
  }
} catch (_) {}

let mainWindow;
let wss;
let ptyProcess;

function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    icon: path.resolve(__dirname, "icons/icon.png"), // tray icon
    width: 1000,
    height: 600,
    useContentSize: true,
    webPreferences: {
      contextIsolation: true,
      sandbox: false,
      // More info: https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/electron-preload-script
      preload: path.resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD),
    },
  });

  mainWindow.loadURL(process.env.APP_URL);

  if (process.env.DEBUGGING) {
    // if on DEV or Production with debug enabled
    mainWindow.webContents.openDevTools();
  } else {
    // we're on production; no access to devtools pls
    mainWindow.webContents.on("devtools-opened", () => {
      mainWindow.webContents.closeDevTools();
    });
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();

    console.log("after create window");
  }
});

ipcMain.on("k8s-server", (event) => {
  console.log("main: received k8s-server event.");

  const cp = require("child_process");
  cp.exec("oc whoami --show-server", function (error, stdout, stderr) {
    event.sender.send("k8s-server-success", { error, stdout, stderr });
    console.log("main: sent k8s-server-success event.");
  });
});

ipcMain.on("k8s-login", (event, data) => {
  console.log("main: received k8s-login event.");

  const { k8sServer, email, password } = data;
  const cp = require("child_process");
  cp.exec(
    `oc login -u ${email} -p ${password} ${k8sServer}`,
    function (error, stdout, stderr) {
      event.sender.send("k8s-login-success", { error, stdout, stderr });
      console.log("main: sent k8s-login-success event.");
    }
  );
});

ipcMain.on("k8s-project", (event) => {
  console.log("main: received k8s-project event.");

  const cp = require("child_process");
  cp.exec("oc project", function (error, stdout, stderr) {
    event.sender.send("k8s-project-success", { error, stdout, stderr });
    console.log("main: sent k8s-project-success event.");
  });
});

ipcMain.on("k8s-set-project", (event, data) => {
  console.log("main: received k8s-set-project event.");

  const { project } = data;
  const cp = require("child_process");
  cp.exec(`oc project ${project}`, function (error, stdout, stderr) {
    event.sender.send("k8s-set-project-success", { error, stdout, stderr });
    console.log("main: sent k8s-set-project-success event.");
  });
});

ipcMain.on("k8s-projects", (event) => {
  console.log("main: received k8s-projects event.");

  const cp = require("child_process");
  cp.exec("oc projects", function (error, stdout, stderr) {
    event.sender.send("k8s-projects-success", { error, stdout, stderr });
    console.log("main: sent k8s-projects-success event.");
  });
});

ipcMain.on("k8s-pods", (event) => {
  console.log("main: received k8s-pods event.");

  const cp = require("child_process");
  cp.exec(`oc get pods`, function (error, stdout, stderr) {
    event.sender.send("k8s-pods-success", { error, stdout, stderr });
    console.log("main: sent k8s-pods-success event.");
  });
});

ipcMain.on("k8s-pod-path", (event, data) => {
  console.log("main: received k8s-pod-path event.");

  const { pod } = data;
  const cp = require("child_process");
  cp.exec(`oc exec ${pod} -i -t -- pwd`, function (error, stdout, stderr) {
    event.sender.send("k8s-pod-path-success", { error, stdout, stderr });
    console.log("main: sent k8s-pod-path-success event.");
  });
});

ipcMain.on("k8s-list-pod", (event, data) => {
  console.log("main: received k8s-list-pod event.");

  const { pod, path } = data;
  const cp = require("child_process");
  cp.exec(
    `oc exec ${pod} -i -t -- ls -l ${path}`,
    function (error, stdout, stderr) {
      event.sender.send("k8s-list-pod-success", { error, stdout, stderr });
      console.log("main: sent k8s-list-pod-success event.");
    }
  );
});

ipcMain.on("k8s-download-file-pod", (event, data) => {
  console.log("main: received k8s-download-file-pod event.");

  const { pod, path, filename } = data;
  const cp = require("child_process");
  cp.exec(
    `oc cp ${pod}:${path}/${filename} ~/Downloads/`,
    function (error, stdout, stderr) {
      event.sender.send("k8s-download-file-pod-success", {
        error,
        stdout,
        stderr,
      });
      console.log("main: sent k8s-download-file-pod-success event.");
    }
  );
});

ipcMain.on("k8s-upload-file-pod", (event, data) => {
  console.log("main: received k8s-upload-file-pod event.");

  const { pod, path, pathFileToUpload, filenameToUpload } = data;
  const cp = require("child_process");
  cp.exec(
    `oc cp ${pathFileToUpload} ${pod}:${path}/${filenameToUpload}`,
    function (error, stdout, stderr) {
      event.sender.send("k8s-upload-file-pod-success", {
        error,
        stdout,
        stderr,
      });
      console.log("main: sent k8s-upload-file-pod-success event.");
    }
  );
});

ipcMain.on("k8s-rsh-pod", (event, data) => {
  console.log("main: received k8s-rsh-pod event.");

  const { pod } = data;
  const shell = os.platform() === "win32" ? "powershell.exe" : `bash`;
  const pty = require("node-pty");

  // Start PTY process
  ptyProcess = pty.spawn(shell, ["-c", `oc rsh ${pod}`], {
    name: "xterm-color",
    cwd: process.env.HOME, // Which path should terminal start
    env: process.env, // Pass environment variables
  });

  const port = 3323;
  wss = new WebSocketServer({ port });
  wss.on("connection", (ws) => {
    ws.on("message", (data) => {
      ptyProcess.write(data);
    });

    ptyProcess.onData(function (data) {
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN && client === ws) {
          client.send(data);
        }
      });
    });
  });

  event.sender.send("k8s-rsh-pod-success", { port });

  console.log("main: sent k8s-rsh-pod-success event.");
});

ipcMain.on("k8s-close-socket", (event, data) => {
  console.log("main: received k8s-close-socket event.");

  const { port } = data;

  wss.close((e) => {
    event.sender.send("k8s-close-socket-success", { error: e });
  });
  ptyProcess.kill();

  console.log("main: sent k8s-close-socket-success event.");
});
