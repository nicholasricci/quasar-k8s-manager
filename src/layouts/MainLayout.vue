<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title> k8s Manager </q-toolbar-title>
        <q-space />
        <K8sProjects />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <EssentialLink
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref } from "vue";
import EssentialLink from "components/EssentialLink.vue";
import K8sProjects from "src/components/K8sProjects.vue";

const linksList = [
  {
    title: "Home",
    caption: "",
    icon: "home",
    to: "/",
  },
  {
    title: "File Manager",
    caption: "",
    icon: "folder",
    to: "/file-manager",
  },
];

export default defineComponent({
  name: "MainLayout",

  components: {
    EssentialLink,
    K8sProjects,
  },

  setup() {
    const leftDrawerOpen = ref(false);

    return {
      essentialLinks: linksList,
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
    };
  },
});
</script>
