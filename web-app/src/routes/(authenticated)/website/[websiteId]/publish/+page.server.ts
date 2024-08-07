import { readFile, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { md } from "$lib/utils";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, fetch, cookies, locals }) => {
  const websiteOverviewData = await fetch(
    `http://localhost:3000/website_overview?id=eq.${params.websiteId}`,
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

  generateStaticFiles(websiteOverview);

  return {
    websiteOverview
  };
};

export const actions: Actions = {
  publishWebsite: async ({ request, params, locals }) => {
    const data = await request.formData();
    const websiteOverview = JSON.parse(data.get("website-overview") as string);

    generateStaticFiles(websiteOverview, false);
  }
};

const generateStaticFiles = async (websiteData: any, isPreview: boolean = true) => {
  const templatePath = join(
    process.cwd(),
    "..",
    "templates",
    websiteData.content_type.toLowerCase()
  );

  const indexFile = await readFile(join(templatePath, "index.html"), { encoding: "utf-8" });
  const articleFile = await readFile(join(templatePath, "article.html"), {
    encoding: "utf-8"
  });

  const indexFileContents = indexFile
    .replace(
      "{{logo}}",
      websiteData.logo_type === "text"
        ? `<strong>${websiteData.logo_text}</strong>`
        : `<img src="https://picsum.photos/32/32" />`
    )
    .replace("{{title}}", `<h1>${websiteData.title}</h1>`)
    .replace("{{main_content}}", md.render(websiteData.main_content ?? ""))
    .replace(
      "{{articles}}",
      Array.isArray(websiteData.articles) && websiteData.articles.length > 0
        ? `
          <h2>Articles</h2>
          ${websiteData.articles
            .map(
              (article: { title: string; publication_date: string; meta_description: string }) => {
                const articleFileName = article.title.toLowerCase().split(" ").join("-");

                return `
                  <article>
                    <p>${article.publication_date}</p>
                    <h3>
                      <a href="./articles/${articleFileName}.html">
                        ${article.title}
                      </a>
                    </h3>
                    <p>${article.meta_description ?? "No description provided"}</p>
                  </article>
                `;
              }
            )
            .join("")}
        `
        : "<h2>Articles</h2><p>No articles available at this time.</p>"
    )
    .replace("{{additional_text}}", md.render(websiteData.additional_text ?? ""));

  let uploadDir = "";

  if (isPreview) {
    uploadDir = join(process.cwd(), "static", "user-websites", websiteData.user_id, websiteData.id);
  } else {
    uploadDir = join("/", "var", "www", "archtika-websites", websiteData.user_id, websiteData.id);
  }

  await mkdir(uploadDir, { recursive: true });

  await writeFile(join(uploadDir, "index.html"), indexFileContents);

  await mkdir(join(uploadDir, "articles"), { recursive: true });

  for (const article of websiteData.articles ?? []) {
    const articleFileName = article.title.toLowerCase().split(" ").join("-");

    const articleFileContents = articleFile
      .replace(
        "{{logo}}",
        websiteData.logo_type === "text"
          ? `<strong>${websiteData.logo_text}</strong>`
          : `<img src="https://picsum.photos/32/32" />`
      )
      .replace("{{cover_image}}", `<img src="https://picsum.photos/600/200" />`)
      .replace("{{title}}", `<h1>${article.title}</h1>`)
      .replace("{{publication_date}}", `<p>${article.publication_date}</p>`)
      .replace("{{main_content}}", md.render(article.main_content ?? ""))
      .replace("{{additional_text}}", md.render(websiteData.additional_text ?? ""));

    await writeFile(join(uploadDir, "articles", `${articleFileName}.html`), articleFileContents);
  }
};
