<template>
  <q-page class="flex">
    <div class="q-pa-md window-height" v-if="pod">
      <div
        class="row no-wrap items-center q-mt-md q-pa-sm bg-grey-3 rounded-borders"
      >
        <q-breadcrumbs class="q-mb-md">
          <q-breadcrumbs-el
            v-for="(b, i) in breadcrumbs"
            :label="b"
            :key="i"
            @click="refreshFiles(b)"
          />
        </q-breadcrumbs>

        <q-space />

        <q-file outlined v-model="fileToUpload" class="q-mr-sm">
          <template v-slot:prepend>
            <q-icon name="attach_file" />
          </template>
        </q-file>
        <q-btn @click="uploadFile()">Upload</q-btn>
      </div>

      <q-table
        fluid
        row-key="name"
        :columns="headers"
        :rows="files"
        :pagination="{ rowsPerPage: 50 }"
      >
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
                size="sm"
                flat
                text-color="primary"
                :label="props.row.filename"
                @click="goInsideDir(props.row.filename)"
                v-if="props.row.permissions[0] === 'd'"
              />
              <span v-else>{{ props.row.filename }}</span>
            </q-td>
            <q-td key="actions" :props="props">
              <q-btn
                size="sm"
                flat
                text-color="black"
                @click="downloadFile(props.row.filename)"
                v-if="props.row.permissions[0] === '-'"
              >
                <q-icon name="download" />
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
import { useQuasar } from "quasar";

export default {
  name: "FileManagerListDirectoryPage",
  setup() {
    const $q = useQuasar();
    const router = useRouter();
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
    const loading = ref(false);
    const fileToUpload = ref(null);

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
      loading.value = true;
      const res = await window.k8s.listPod({ pod: pod, path: path });
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
        filesRet.splice(-1, 1);
        files.value.splice(0, files.value.length, ...filesRet);
      }
      loading.value = false;
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

    async function downloadFile(filename) {
      loading.value = true;
      const res = await window.k8s.downloadFilePod({
        pod,
        path: appStore.podPath,
        filename,
      });
      if (res.data.error === null) {
        $q.notify({
          message: `${filename} download in ~/Downloads folder`,
          color: "primary",
        });
      }
      loading.value = false;
    }

    async function uploadFile() {
      loading.value = true;
      const res = await window.k8s.uploadFilePod({
        pod,
        path: appStore.podPath,
        pathFileToUpload: fileToUpload.value.path,
        filenameToUpload: fileToUpload.value.name,
      });
      if (res.data.error === null) {
        $q.notify({
          message: `${fileToUpload.value.name} upload in ${pod}:${appStore.podPath} folder`,
          color: "primary",
        });
      }
      loading.value = false;
      getPodListings(appStore.podPath);
    }

    return {
      goToContainer,
      getPodPath,
      getPodListings,
      downloadFile,
      uploadFile,
      refreshFiles,
      goInsideDir,
      appStore,
      pod,
      headers,
      files,
      breadcrumbs,
      loading,
      fileToUpload,
    };
  },
  mounted() {
    this.getPodPath();
    this.getPodListings("");
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
