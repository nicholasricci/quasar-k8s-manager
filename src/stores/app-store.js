import { defineStore } from "pinia";

export const useAppStore = defineStore("app", {
  state: () => ({
    namespace: null,
    pod: null,
    podPath: null,
  }),
  getters: {},
  actions: {
    setNamespace(namespace) {
      this.$state.namespace = namespace;
    },
    setPod(pod) {
      this.$state.pod = pod;
    },
    setPodPath(podPath) {
      this.podPath = podPath;
    },
  },
});
