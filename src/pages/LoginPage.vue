<template>
  <q-layout>
    <q-page-container>
      <q-page
        class="window-height window-width row justify-center items-center"
      >
        <div class="column">
          <div class="row">
            <h5 class="text-h5 text-white q-my-md">Company & Co</h5>
          </div>
          <div class="row">
            <q-card square bordered class="q-pa-lg shadow-1">
              <q-card-section>
                <q-form class="q-gutter-md">
                  <q-input
                    square
                    filled
                    clearable
                    v-model="k8sHost"
                    type="uri"
                    label="k8s host"
                  />
                  <q-input
                    square
                    filled
                    clearable
                    v-model="email"
                    type="email"
                    label="email"
                  />
                  <q-input
                    square
                    filled
                    clearable
                    v-model="password"
                    type="password"
                    label="password"
                  />
                </q-form>
              </q-card-section>
              <q-card-actions class="q-px-md">
                <q-btn
                  unelevated
                  color="light-blue-7"
                  size="lg"
                  class="full-width"
                  label="Login"
                  @click="login"
                />
              </q-card-actions>
            </q-card>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import { useRouter, useRoute } from "vue-router";

export default {
  name: "LoginPage",
  setup() {
    const router = useRouter();
    const route = useRoute();

    function goToHome() {
      router.push({
        path: "/",
      });
    }

    return { goToHome };
  },
  data() {
    return {
      k8sHost: "",
      email: "",
      password: "",
    };
  },
  async mounted() {
    const res = await window.k8s.server();
    if (res.data.error === null) {
      this.k8sHost = res.data.stdout;
    }
  },
  methods: {
    async login() {
      const res = await window.k8s.login({
        k8sServer: this.k8sHost,
        email: this.email,
        password: this.password,
      });
      if (res.data.error === null) {
        this.goToHome();
      }
    },
  },
};
</script>

<style>
.q-card {
  width: 360px;
}
</style>
