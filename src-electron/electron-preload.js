/**
 * This file is used specifically for security reasons.
 * Here you can access Nodejs stuff and inject functionality into
 * the renderer thread (accessible there through the "window" object)
 *
 * WARNING!
 * If you import anything from node_modules, then make sure that the package is specified
 * in package.json > dependencies and NOT in devDependencies
 *
 * Example (injects window.myAPI.doAThing() into renderer thread):
 *
 *   import { contextBridge } from 'electron'
 *
 *   contextBridge.exposeInMainWorld('myAPI', {
 *     doAThing: () => {}
 *   })
 *
 * WARNING!
 * If accessing Node functionality (like importing @electron/remote) then in your
 * electron-main.js you will need to set the following when you instantiate BrowserWindow:
 *
 * mainWindow = new BrowserWindow({
 *   // ...
 *   webPreferences: {
 *     // ...
 *     sandbox: false // <-- to be able to import @electron/remote in preload script
 *   }
 * }
 */

import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("k8s", {
  server: () => {
    ipcRenderer.send("k8s-server");
    return new Promise((resolve) =>
      ipcRenderer.once("k8s-server-success", (event, data) =>
        resolve({ event, data })
      )
    );
  },
  login: (credentials) => {
    ipcRenderer.send("k8s-login", credentials);
    return new Promise((resolve) =>
      ipcRenderer.once("k8s-login-success", (event, data) =>
        resolve({ event, data })
      )
    );
  },
  project: () => {
    ipcRenderer.send("k8s-project");
    return new Promise((resolve) =>
      ipcRenderer.once("k8s-project-success", (event, data) =>
        resolve({ event, data })
      )
    );
  },
  setProject: (project) => {
    ipcRenderer.send("k8s-set-project", project);
    return new Promise((resolve) =>
      ipcRenderer.once("k8s-set-project-success", (event, data) =>
        resolve({ event, data })
      )
    );
  },
  projects: () => {
    ipcRenderer.send("k8s-projects");
    return new Promise((resolve) =>
      ipcRenderer.once("k8s-projects-success", (event, data) =>
        resolve({ event, data })
      )
    );
  },
  pods: () => {
    ipcRenderer.send("k8s-pods");
    return new Promise((resolve) =>
      ipcRenderer.once("k8s-pods-success", (event, data) =>
        resolve({ event, data })
      )
    );
  },
  pathPod: (params) => {
    ipcRenderer.send("k8s-pod-path", params);
    return new Promise((resolve) =>
      ipcRenderer.once("k8s-pod-path-success", (event, data) =>
        resolve({ event, data })
      )
    );
  },
  listPod: (params) => {
    ipcRenderer.send("k8s-list-pod", params);
    return new Promise((resolve) =>
      ipcRenderer.once("k8s-list-pod-success", (event, data) =>
        resolve({ event, data })
      )
    );
  },
  downloadFilePod: (params) => {
    ipcRenderer.send("k8s-download-file-pod", params);
    return new Promise((resolve) =>
      ipcRenderer.once("k8s-download-file-pod-success", (event, data) =>
        resolve({ event, data })
      )
    );
  },
});
