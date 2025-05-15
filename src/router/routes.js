const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "", component: () => import("src/pages/LandingPage.vue") },
      { path: "catalog", component: () => import("src/pages/CatalogPage.vue") },
      {
        path: "cart",
        redirect: "/checkout",
      },
      {
        path: "favorites",
        component: () => import("src/pages/FavoritesPage.vue"),
      },
      {
        path: "chat",
        component: () => import("src/pages/Chat.vue"),
        meta: { restrictAdmin: true },
      },
      {
        path: "profile",
        component: () => import("src/pages/Profile.vue"),
        meta: { requiresAuth: true },
      },
      { path: "login", component: () => import("src/pages/Login.vue") },
      {
        path: "editProfile",
        component: () => import("src/pages/EditProfile.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "admin",
        component: () => import("src/pages/AdminPage.vue"),
        meta: { requiresAuth: true, requiresAdmin: true },
      },
      {
        path: "admin/chats",
        component: () => import("src/pages/AdminChatPage.vue"),
        meta: { requiresAuth: true, requiresAdmin: true },
      },
      {
        path: "checkout",
        component: () => import("src/pages/CheckoutPage.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "orders",
        component: () => import("src/pages/OrdersPage.vue"),
        meta: { requiresAuth: true, requiresAdmin: true },
      },
      {
        path: "make-admin",
        component: () => import("src/pages/MakeAdmin.vue"),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
