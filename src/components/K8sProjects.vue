<template>
  <q-select
    outlined
    v-model="namespaceSelected"
    :options="namespaces"
    @update:model-value="setNamespace()"
    label="Namespaces"
    text-white
    v-if="namespaces"
  >
    <template v-slot:no-option>
      <q-item>
        <q-item-section class="text-grey"> No results </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script>
import { useAppStore } from "src/stores/app-store";
import { defineComponent, ref } from "vue";

export default defineComponent({
  name: "K8sProjects",
  setup() {
    const appStore = useAppStore();
    const namespacesOptions = ref([]);
    const namespaces = ref([]);

    return { appStore, namespacesOptions, namespaces };
  },
  data() {
    return {
      namespaceSelected: "",
      error: "",
    };
  },
  mounted() {
    window.k8s.projects().then(({ event, data }) => {
      if (!data.stderr) {
        const lines = data.stdout.split("\n");
        lines.splice(0, 2);
        lines.splice(-2);
        const linesTrimmed = lines.map((l) => {
          let trimmedLine = l.trim();
          if (l.includes("*")) {
            trimmedLine = l.replace("*", "").trim();
            this.namespaceSelected = trimmedLine;
            this.appStore.setNamespace(this.namespaceSelected);
          }
          return trimmedLine;
        });
        linesTrimmed.splice(-1, 1);
        this.namespaces = linesTrimmed;
        this.namespacesOptions = linesTrimmed;
      } else {
        this.error = data.stderr;
      }
    });
  },
  methods: {
    async setNamespace() {
      const res = await window.k8s.setProject({
        project: this.namespaceSelected,
      });
      if (res.data.error !== null) {
        this.appStore.setNamespace(this.namespaceSelected);
      }
    },
  },
});
</script>
