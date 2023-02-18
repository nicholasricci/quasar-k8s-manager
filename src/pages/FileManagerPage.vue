<template>
  <q-page class="flex flex-center">
    <div class="q-pa-md" v-if="headers && pods">
      <q-table fluid :columns="headers" :rows="pods" row-key="name">
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="name" :props="props">
              {{ props.row.name }}
            </q-td>
            <q-td key="ready" :props="props">
              {{ props.row.ready }}
            </q-td>
            <q-td key="status" :props="props">
              {{ props.row.status }}
            </q-td>
            <q-td key="restarts" :props="props">
              {{ props.row.restarts }}
            </q-td>
            <q-td key="age" :props="props">
              {{ props.row.age }}
            </q-td>
            <q-td key="actions" :props="props">
              <q-btn @click="goToListDirectory(props.row.name)" tag="a" link>
                <q-icon name="folder" />
              </q-btn>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>
  </q-page>
</template>

<script>
import { useAppStore } from "src/stores/app-store";
import { useRouter, useRoute } from "vue-router";

export default {
  name: "FileManagerPage",
  data() {
    return {
      headers: [],
      pods: [],
    };
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const appStore = useAppStore();

    function goToFileManager() {
      router.push({
        path: "/file-manager/list-directory",
      });
    }

    return { goToFileManager, appStore };
  },
  async mounted() {
    const res = await window.k8s.pods();
    const headers = [];
    if (res.data.error === null) {
      const stdout = res.data.stdout;
      const lines = stdout.split("\n");
      const headersObjects = lines
        .splice(0, 1)[0]
        .split(/\s+/)
        .map((h) => {
          return {
            label: h.trim(),
            sortable: true,
            field: h.trim().toLowerCase(),
            name: h.trim().toLowerCase(),
            align: "left",
          };
        });
      headers.push(...headersObjects);
      headers.push({
        label: "ACTIONS",
        sortable: false,
        name: "actions",
        field: "actions",
        align: "center",
      });
      this.headers = headers;
      const pods = [];
      lines.forEach((line) => {
        const lineSplitted = line.split(/\s+/);
        const pod = {};
        lineSplitted.forEach((column, index) => {
          const name = headers.at(index).field;
          pod[name] = column;
        });
        pods.push(pod);
      });
      this.pods = pods;
    }
  },
  methods: {
    goToListDirectory(pod) {
      this.appStore.setPod(pod);
      this.goToFileManager();
    },
  },
};
</script>

<style>
.q-card {
  width: 360px;
}
</style>
