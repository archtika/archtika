import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ params, fetch, cookies }) => {
  const websiteData = await fetch(
    `http://localhost:${process.env.ARCHTIKA_API_PORT}/website?id=eq.${params.websiteId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookies.get("session_token")}`,
        Accept: "application/vnd.pgrst.object+json"
      }
    }
  );

  const homeData = await fetch(
    `http://localhost:${process.env.ARCHTIKA_API_PORT}/home?website_id=eq.${params.websiteId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookies.get("session_token")}`,
        Accept: "application/vnd.pgrst.object+json"
      }
    }
  );

  const website = await websiteData.json();
  const home = await homeData.json();

  return {
    website,
    home
  };
};
