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
    const namespaceSelected = ref("");

    async function getNamespaces() {
      const res = await window.k8s.projects();
      if (res.data.error === null) {
        const lines = res.data.stdout.split("\n");
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
        namespaces.value.splice(0, namespaces.value.length, ...linesTrimmed);
        namespacesOptions.value.splice(
          0,
          namespacesOptions.value.length,
          ...linesTrimmed
        );
      }
    }

    async function setNamespace() {
      const res = await window.k8s.setProject({
        project: namespaceSelected.value,
      });
      if (res.data.error !== null) {
        appStore.$patch({
          namespace: namespaceSelected,
        });
        // appStore.namespace = namespaceSelected;
      }
    }

    return {
      getNamespaces,
      setNamespace,
      appStore,
      namespacesOptions,
      namespaces,
      namespaceSelected,
    };
  },
  mounted() {
    this.getNamespaces();
  },
});
</script>
