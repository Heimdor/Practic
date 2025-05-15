import { defineRouter } from "#q-app/wrappers";
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from "vue-router";
import routes from "./routes";
import { useAuthStore } from "src/stores/auth";

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function ({ store }) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === "history"
    ? createWebHistory
    : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  // Защита маршрутов
  Router.beforeEach(async (to, from, next) => {
    // Инициализируем хранилище аутентификации
    const authStore = useAuthStore();

    // Проверяем, требуется ли авторизация для маршрута
    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
    const requiresAdmin = to.matched.some(
      (record) => record.meta.requiresAdmin
    );
    const restrictAdmin = to.matched.some(
      (record) => record.meta.restrictAdmin
    );

    // Если пользователь авторизовался и пытается перейти на главную, перенаправляем в профиль
    if (
      to.path === "/" &&
      from.path === "/login" &&
      authStore.isAuthenticated
    ) {
      next({ path: "/profile" });
      return;
    }

    // Если пользователь не авторизован и маршрут требует авторизации, редиректим на страницу входа
    if (requiresAuth && !authStore.isAuthenticated) {
      next({ path: "/login", query: { redirect: to.fullPath } });
    }
    // Если маршрут требует прав администратора, проверяем права
    else if (requiresAdmin && !authStore.isAdmin) {
      next({ path: "/" });
    }
    // Если маршрут ограничен для администраторов и пользователь администратор
    else if (restrictAdmin && authStore.isAdmin) {
      next({ path: "/admin/chats" });
    }
    // Иначе продолжаем переход
    else {
      next();
    }
  });

  return Router;
});
