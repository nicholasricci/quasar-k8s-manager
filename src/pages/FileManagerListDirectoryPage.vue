<template>
  <q-page class="flex">
    <div class="q-pa-md" v-if="pod">
      <q-breadcrumbs class="q-mb-md">
        <q-breadcrumbs-el
          v-for="(b, i) in breadcrumbs"
          :label="b"
          :key="i"
          @click="refreshFiles(b)"
        />
      </q-breadcrumbs>
      <q-table fluid :columns="headers" :rows="files" row-key="name">
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="permissions" :props="props">
              {{ props.row.permissions }}
            </q-td>
            <q-td key="links" :props="props">
              {{ props.row.links }}
            </q-td>
            <q-td key="owner" :props="props">
              {{ props.row.owner }}
            </q-td>
            <q-td key="group" :props="props">
              {{ props.row.group }}
            </q-td>
            <q-td key="size" :props="props">
              {{ props.row.size }}
            </q-td>
            <q-td key="month" :props="props">
              {{ props.row.month }}
            </q-td>
            <q-td key="day" :props="props">
              {{ props.row.day }}
            </q-td>
            <q-td key="time" :props="props">
              {{ props.row.time }}
            </q-td>
            <q-td key="filename" :props="props">
              <q-btn
                flat
                text-color="primary"
                :label="props.row.filename"
                v-if="props.row.permissions[0] === 'd'"
                @click="goInsideDir(props.row.filename)"
              />
              <span v-else>{{ props.row.filename }}</span>
            </q-td>
            <q-td key="actions" :props="props">
              <!-- <q-btn @click="goToListDirectory(props.row.name)" tag="a" link>
                <q-icon name="folder" />
              </q-btn> -->
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
import { ref } from "vue";
import path from "path";

export default {
  name: "FileManagerListDirectoryPage",
  setup() {
    const router = useRouter();
    const route = useRoute();
    const appStore = useAppStore();
    const pod = appStore.pod;

    const headers = [
      {
        label: "PERMISSIONS",
        sortable: false,
        name: "permissions",
        field: "permissions",
        align: "left",
      },
      {
        label: "NUMBER OF LINKS",
        sortable: false,
        name: "links",
        field: "links",
        align: "center",
      },
      {
        label: "OWNER",
        sortable: true,
        name: "owner",
        field: "owner",
        align: "center",
      },
      {
        label: "GROUP",
        sortable: true,
        name: "group",
        field: "group",
        align: "center",
      },
      {
        label: "SIZE",
        sortable: true,
        name: "size",
        field: "size",
        align: "center",
      },
      {
        label: "MONTH",
        sortable: true,
        name: "month",
        field: "month",
        align: "center",
      },
      {
        label: "DAY",
        sortable: true,
        name: "day",
        field: "day",
        align: "center",
      },
      {
        label: "TIME",
        sortable: true,
        name: "time",
        field: "time",
        align: "center",
      },
      {
        label: "FILENAME",
        sortable: true,
        name: "filename",
        field: "filename",
        align: "left",
      },
      {
        label: "ACTIONS",
        sortable: false,
        name: "actions",
        field: "actions",
        align: "center",
      },
    ];
    const files = ref([]);
    const breadcrumbs = ref([]);

    function goToContainer() {
      router.push({
        path: "/file-manager/",
      });
    }

    async function getPodPath() {
      const res = await window.k8s.pathPod({ pod: this.pod });
      if (res.data.error === null) {
        const stdout = res.data.stdout;
        const lines = stdout.split("\n");
        lines.splice(-1, 1);
        appStore.podPath = lines[0];
        const pwd = lines[0].split("/");
        pwd.splice(0, 1);
        const paths = ["/"].concat(pwd);
        breadcrumbs.value.splice(0, breadcrumbs.value.length, ...paths);
      }
    }

    async function getPodListings(path) {
      const res = await window.k8s.listPod({ pod: pod, path: path });
      console.log(res.data);
      if (res.data.error === null) {
        const stdout = res.data.stdout;
        const lines = stdout.split("\n");
        lines.splice(0, 1);
        const filesRet = [];
        lines.forEach((line) => {
          const lineSplitted = line.split(/\s+/);
          const file = { filename: "" };
          lineSplitted.forEach((column, index) => {
            if (index < 8) {
              const name = headers.at(index).field;
              file[name] = column;
            } else {
              file.filename = file.filename + column;
            }
          });
          filesRet.push(file);
        });
        files.value.splice(0, files.value.length, ...filesRet);
      }
    }

    async function refreshFiles(pathPiece) {
      const posPathPiece = breadcrumbs.value.indexOf(pathPiece, 0);
      breadcrumbs.value.splice(posPathPiece + 1, breadcrumbs.value.length);
      this.path = breadcrumbs.value.join("/");
      appStore.setPodPath(this.path);
      getPodListings(this.path);
    }

    async function goInsideDir(filename) {
      breadcrumbs.value.push(filename);
      this.path = breadcrumbs.value.join("/");
      appStore.setPodPath(this.path);
      getPodListings(this.path);
    }

    return {
      goToContainer,
      getPodPath,
      getPodListings,
      refreshFiles,
      goInsideDir,
      appStore,
      pod,
      headers,
      files,
      breadcrumbs,
    };
  },
  mounted() {
    this.getPodPath();
    this.getPodListings("");
  },
  method: {},
};
</script>

<style>
.q-card {
  width: 360px;
}
</style>
