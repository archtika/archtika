import { readFile, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { md } from "$lib/utils";
import type { Actions, PageServerLoad } from "./$types";
import { API_BASE_PREFIX } from "$lib/server/utils";
import { render } from "svelte/server";
import BlogIndex from "$lib/templates/blog/BlogIndex.svelte";
import BlogArticle from "$lib/templates/blog/BlogArticle.svelte";
import DocsIndex from "$lib/templates/docs/DocsIndex.svelte";
import DocsArticle from "$lib/templates/docs/DocsArticle.svelte";
import { dev } from "$app/environment";

export const load: PageServerLoad = async ({ params, fetch, cookies, parent }) => {
  const websiteOverviewData = await fetch(
    `${API_BASE_PREFIX}/website_overview?id=eq.${params.websiteId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookies.get("session_token")}`,
        Accept: "application/vnd.pgrst.object+json"
      }
    }
  );

  const websiteOverview = await websiteOverviewData.json();
  const { website } = await parent();

  generateStaticFiles(websiteOverview);

  const websitePreviewUrl = `${dev ? "http://localhost:18000" : process.env.ORIGIN}/previews/${websiteOverview.id}/index.html`;

  return {
    websiteOverview,
    websitePreviewUrl,
    website
  };
};

export const actions: Actions = {
  publishWebsite: async ({ fetch, params, cookies }) => {
    const websiteOverviewData = await fetch(
      `${API_BASE_PREFIX}/website_overview?id=eq.${params.websiteId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cookies.get("session_token")}`,
          Accept: "application/vnd.pgrst.object+json"
        }
      }
    );

    const websiteOverview = await websiteOverviewData.json();
    generateStaticFiles(websiteOverview, false);

    return { success: true, message: "Successfully published website" };
  }
};

const generateStaticFiles = async (websiteData: any, isPreview: boolean = true) => {
  let head = "";
  let body = "";

  switch (websiteData.content_type) {
    case "Blog":
      {
        ({ head, body } = render(BlogIndex, {
          props: {
            favicon: websiteData.favicon_image
              ? `${API_BASE_PREFIX}/rpc/retrieve_file?id=${websiteData.favicon_image}`
              : "",
            title: websiteData.title,
            logoType: websiteData.logo_type,
            logo:
              websiteData.logo_type === "text"
                ? websiteData.logo_text
                : `${API_BASE_PREFIX}/rpc/retrieve_file?id=${websiteData.logo_image}`,
            mainContent: md(websiteData.main_content ?? "", false),
            articles: websiteData.articles ?? [],
            footerAdditionalText: md(websiteData.additional_text ?? "")
          }
        }));
      }
      break;
    case "Docs":
      {
        ({ head, body } = render(DocsIndex, {
          props: {
            favicon: websiteData.favicon_image
              ? `${API_BASE_PREFIX}/rpc/retrieve_file?id=${websiteData.favicon_image}`
              : "",
            title: websiteData.title,
            logoType: websiteData.logo_type,
            logo:
              websiteData.logo_type === "text"
                ? websiteData.logo_text
                : `${API_BASE_PREFIX}/rpc/retrieve_file?id=${websiteData.logo_image}`,
            mainContent: md(websiteData.main_content ?? "", false),
            articles: websiteData.articles ?? [],
            footerAdditionalText: md(websiteData.additional_text ?? "")
          }
        }));
      }
      break;
  }

  const indexFileContents = head.concat(body);

  let uploadDir = "";

  if (isPreview) {
    uploadDir = join("/", "var", "www", "archtika-websites", "previews", websiteData.id);
  } else {
    uploadDir = join("/", "var", "www", "archtika-websites", websiteData.id);
  }

  await mkdir(uploadDir, { recursive: true });
  await writeFile(join(uploadDir, "index.html"), indexFileContents);
  await mkdir(join(uploadDir, "articles"), {
    recursive: true
  });

  for (const article of websiteData.articles ?? []) {
    const articleFileName = article.title.toLowerCase().split(" ").join("-");

    let head = "";
    let body = "";

    switch (websiteData.content_type) {
      case "Blog":
        {
          ({ head, body } = render(BlogArticle, {
            props: {
              favicon: websiteData.favicon_image
                ? `${API_BASE_PREFIX}/rpc/retrieve_file?id=${websiteData.favicon_image}`
                : "",
              title: article.title,
              logoType: websiteData.logo_type,
              logo:
                websiteData.logo_type === "text"
                  ? websiteData.logo_text
                  : `${API_BASE_PREFIX}/rpc/retrieve_file?id=${websiteData.logo_image}`,
              coverImage: article.cover_image
                ? `${API_BASE_PREFIX}/rpc/retrieve_file?id=${article.cover_image}`
                : "",
              publicationDate: article.publication_date,
              mainContent: md(article.main_content ?? ""),
              footerAdditionalText: md(websiteData.additional_text ?? "")
            }
          }));
        }
        break;
      case "Docs":
        {
          ({ head, body } = render(DocsArticle, {
            props: {
              favicon: websiteData.favicon_image
                ? `${API_BASE_PREFIX}/rpc/retrieve_file?id=${websiteData.favicon_image}`
                : "",
              title: article.title,
              logoType: websiteData.logo_type,
              logo:
                websiteData.logo_type === "text"
                  ? websiteData.logo_text
                  : `${API_BASE_PREFIX}/rpc/retrieve_file?id=${websiteData.logo_image}`,
              coverImage: article.cover_image
                ? `${API_BASE_PREFIX}/rpc/retrieve_file?id=${article.cover_image}`
                : "",
              publicationDate: article.publication_date,
              mainContent: md(article.main_content ?? ""),
              footerAdditionalText: md(websiteData.additional_text ?? "")
            }
          }));
        }
        break;
    }

    const articleFileContents = head.concat(body);

    await writeFile(join(uploadDir, "articles", `${articleFileName}.html`), articleFileContents);
  }

  const commonStyles = await readFile(`${process.cwd()}/template-styles/common-styles.css`, {
    encoding: "utf-8"
  });
  const specificStyles = await readFile(
    `${process.cwd()}/template-styles/${websiteData.content_type.toLowerCase()}-styles.css`,
    {
      encoding: "utf-8"
    }
  );
  await writeFile(
    join(uploadDir, "styles.css"),
    commonStyles
      .concat(specificStyles)
      .replace(
        /--color-accent:\s*(.*?);/,
        `--color-accent: ${websiteData.accent_color_dark_theme};`
      )
      .replace(
        /@media\s*\(prefers-color-scheme:\s*dark\)\s*{[^}]*--color-accent:\s*(.*?);/,
        (match) =>
          match.replace(
            /--color-accent:\s*(.*?);/,
            `--color-accent: ${websiteData.accent_color_light_theme};`
          )
      )
  );
};
