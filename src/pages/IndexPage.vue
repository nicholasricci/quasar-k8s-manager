<template>
  <q-page class="flex flex-center"> ciao </q-page>
</template>

<script setup></script>

<!-- <script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "IndexPage",
  data() {
    return {
      name: window.myAPI.doAThing().name,
      namespaces: [],
      namespaceSelected: "",
      error: "",
    };
  },
  mounted() {
    window.k8s.projects().then(({ event, data }) => {
      console.log(event);
      if (data.stderr == null) {
        const lines = data.stdout.split("\n");
        console.log(data);
        lines.splice(0, 2);
        lines.splice(-2);
        const linesTrimmed = lines.map((l) => {
          let trimmedLine = l.trim();
          if (l.includes("*")) {
            trimmedLine = l.replace("*", "").trim();
            namespaceSelected = trimmedLine;
          }
          return trimmedLine;
        });
        this.namespaces = linesTrimmed;
      } else {
        this.error = data.stderr;
      }
    });
  },
});
</script> -->
