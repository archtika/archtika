import { redirect } from "@sveltejs/kit";
import { API_BASE_PREFIX, apiRequest } from "$lib/server/utils";

export const handle = async ({ event, resolve }) => {
  if (!event.url.pathname.startsWith("/api/")) {
    const userData = await apiRequest(event.fetch, `${API_BASE_PREFIX}/account`, "GET", {
      headers: {
        Accept: "application/vnd.pgrst.object+json",
        Authorization: `Bearer ${event.cookies.get("session_token")}`
      },
      returnData: true
    });

    if (!userData.success && !["/login", "/register"].includes(event.url.pathname)) {
      throw redirect(303, "/login");
    }

    if (userData.success) {
      if (["/login", "/register"].includes(event.url.pathname)) {
        throw redirect(303, "/");
      }

      event.locals.user = userData.data;
    }
  }

  return await resolve(event);
};

export const handleFetch = async ({ event, request, fetch }) => {
  if (event.locals.user) {
    request.headers.set("Authorization", `Bearer ${event.cookies.get("session_token")}`);
  }

  return fetch(request);
};
