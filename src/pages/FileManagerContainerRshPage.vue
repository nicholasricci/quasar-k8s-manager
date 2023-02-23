<template>
  <q-page class="flex">
    <div class="q-pa-md window-height">
      <div id="terminal" style="height: 80%"></div>
      <q-inner-loading :showing="loading">
        <q-spinner-gears size="50px" color="primary" />
      </q-inner-loading>
    </div>
  </q-page>
</template>

<script>
import { useAppStore } from "src/stores/app-store";
import { ref } from "vue";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";

export default {
  name: "FileManagerContainerRshPage",
  data() {
    return {
      term: null,
      port: null,
    };
  },
  setup() {
    const appStore = useAppStore();
    const loading = ref(false);

    function toggleLoading() {
      loading.value = !loading.value;
    }

    return {
      toggleLoading,
      appStore,
      loading,
    };
  },
  async mounted() {
    this.toggleLoading();
    const res = await window.k8s.rshPod({ pod: this.appStore.pod });
    const { port } = res.data;
    this.port = port;
    if (port !== null) {
      const wss = new WebSocket(`ws://localhost:${port}`);

      // Create and attach xtermjs terminal on DOM
      this.term = new Terminal({ cursorBlink: true });
      const fitAddon = new FitAddon();
      this.term.loadAddon(fitAddon);
      this.term.open(document.getElementById("terminal"));
      this.term.onData((data) => wss.send(data));
      wss.onmessage = (data) => {
        this.term.write(data.data);
      };
      fitAddon.fit();
    }
    this.toggleLoading();
  },
  async unmounted() {
    const res = await window.k8s.closeSocket({ port: this.port });
    console.log(res);
  },
};
</script>

<style>
.q-card {
  width: 360px;
}
.q-pa-md {
  width: 100%;
  height: 100%;
}
</style>
