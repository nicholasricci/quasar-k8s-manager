<template>
  <q-page class="flex">
    <div class="q-pa-md window-height" v-if="headers && pods">
      <q-table
        fluid
        row-key="name"
        :columns="headers"
        :rows="pods"
        :pagination="{ rowsPerPage: 50 }"
      >
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
              <q-btn @click="goToFileManager(props.row.name)" tag="a" link>
                <q-icon name="folder" />
              </q-btn>
              <q-btn @click="goToRsh(props.row.name)" tag="a" link>
                <q-icon name="terminal" />
              </q-btn>
            </q-td>
          </q-tr>
        </template>
      </q-table>

      <q-inner-loading :showing="loading">
        <q-spinner-gears size="50px" color="primary" />
      </q-inner-loading>
    </div>
  </q-page>
</template>

<script>
import { useAppStore } from "src/stores/app-store";
import { useRouter } from "vue-router";
import { ref } from "vue";
import { storeToRefs } from "pinia";

export default {
  name: "FileManagerPage",
  setup() {
    const router = useRouter();
    const appStore = useAppStore();
    const { namespace } = storeToRefs(appStore);

    const headers = ref([]);
    const pods = ref([]);
    const loading = ref(false);

    function goToFileManager(pod) {
      appStore.setPod(pod);
      router.push({
        path: "/file-manager/list-directory",
      });
    }

    function goToRsh(pod) {
      appStore.setPod(pod);
      router.push({
        path: "/file-manager/container-rsh",
      });
    }

    async function getPods() {
      loading.value = true;
      const res = await window.k8s.pods();
      const headersRet = [];
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
        headersRet.push(...headersObjects);
        headersRet.push({
          label: "ACTIONS",
          sortable: false,
          name: "actions",
          field: "actions",
          align: "center",
        });
        headers.value.splice(0, headers.value.length, ...headersRet);
        const podsRet = [];
        lines.forEach((line) => {
          const lineSplitted = line.split(/\s+/);
          const pod = {};
          lineSplitted.forEach((column, index) => {
            const name = headers.value.at(index).field;
            pod[name] = column;
          });
          podsRet.push(pod);
        });
        podsRet.splice(-1, 1);
        pods.value.splice(0, pods.value.length, ...podsRet);
      }
      loading.value = false;
    }

    // watch(
    //   () => namespace,
    //   (n) => {
    //     console.log(n);
    //     getPods();
    //   }
    // );

    return {
      goToFileManager,
      goToRsh,
      getPods,
      appStore,
      namespace,
      headers,
      pods,
      loading,
    };
  },

  async mounted() {
    this.getPods();
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
