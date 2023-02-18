const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "", component: () => import("pages/IndexPage.vue") },
      {
        path: "/file-manager",
        component: () => import("pages/FileManagerPage.vue"),
      },
      {
        path: "/file-manager/list-directory",
        component: () => import("pages/FileManagerListDirectoryPage.vue"),
      },
    ],
  },
  {
    path: "/login",
    component: () => import("pages/LoginPage.vue"),
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
