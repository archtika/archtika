import type { Actions, PageServerLoad } from "./$types";
import { API_BASE_PREFIX } from "$lib/server/utils";
import type { Settings, Header, Footer } from "$lib/db-schema";

export const load: PageServerLoad = async ({ params, fetch, cookies }) => {
  const globalSettingsData = await fetch(
    `${API_BASE_PREFIX}/settings?website_id=eq.${params.websiteId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookies.get("session_token")}`,
        Accept: "application/vnd.pgrst.object+json"
      }
    }
  );

  const headerData = await fetch(`${API_BASE_PREFIX}/header?website_id=eq.${params.websiteId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cookies.get("session_token")}`,
      Accept: "application/vnd.pgrst.object+json"
    }
  });

  const footerData = await fetch(`${API_BASE_PREFIX}/footer?website_id=eq.${params.websiteId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cookies.get("session_token")}`,
      Accept: "application/vnd.pgrst.object+json"
    }
  });

  const globalSettings: Settings = await globalSettingsData.json();
  const header: Header = await headerData.json();
  const footer: Footer = await footerData.json();

  return {
    globalSettings,
    header,
    footer,
    API_BASE_PREFIX
  };
};

export const actions: Actions = {
  updateGlobal: async ({ request, fetch, cookies, params }) => {
    const data = await request.formData();
    const faviconFile = data.get("favicon") as File;

    const headers: Record<string, string> = {
      "Content-Type": "application/octet-stream",
      Authorization: `Bearer ${cookies.get("session_token")}`,
      Accept: "application/vnd.pgrst.object+json",
      "X-Website-Id": params.websiteId
    };

    if (faviconFile) {
      headers["X-Mimetype"] = faviconFile.type;
      headers["X-Original-Filename"] = faviconFile.name;
    }

    const uploadedImageData = await fetch(`${API_BASE_PREFIX}/rpc/upload_file`, {
      method: "POST",
      headers,
      body: faviconFile ? await faviconFile.arrayBuffer() : null
    });

    const uploadedImage = await uploadedImageData.json();

    if (!uploadedImageData.ok && (faviconFile?.size ?? 0 > 0)) {
      return { success: false, message: uploadedImage.message };
    }

    const res = await fetch(`${API_BASE_PREFIX}/settings?website_id=eq.${params.websiteId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookies.get("session_token")}`
      },
      body: JSON.stringify({
        accent_color_light_theme: data.get("accent-color-light"),
        accent_color_dark_theme: data.get("accent-color-dark"),
        favicon_image: uploadedImage.file_id
      })
    });

    if (!res.ok) {
      const response = await res.json();
      return { success: false, message: response.message };
    }

    return {
      success: true,
      message: "Successfully updated global settings"
    };
  },
  updateHeader: async ({ request, fetch, cookies, params }) => {
    const data = await request.formData();
    const logoImage = data.get("logo-image") as File;

    const headers: Record<string, string> = {
      "Content-Type": "application/octet-stream",
      Authorization: `Bearer ${cookies.get("session_token")}`,
      Accept: "application/vnd.pgrst.object+json",
      "X-Website-Id": params.websiteId
    };

    if (logoImage) {
      headers["X-Mimetype"] = logoImage.type;
      headers["X-Original-Filename"] = logoImage.name;
    }

    const uploadedImageData = await fetch(`${API_BASE_PREFIX}/rpc/upload_file`, {
      method: "POST",
      headers,
      body: logoImage ? await logoImage.arrayBuffer() : null
    });

    const uploadedImage = await uploadedImageData.json();

    if (!uploadedImageData.ok && (logoImage?.size ?? 0 > 0)) {
      return { success: false, message: uploadedImage.message };
    }

    const res = await fetch(`${API_BASE_PREFIX}/header?website_id=eq.${params.websiteId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookies.get("session_token")}`
      },
      body: JSON.stringify({
        logo_type: data.get("logo-type"),
        logo_text: data.get("logo-text"),
        logo_image: uploadedImage.file_id
      })
    });

    if (!res.ok) {
      const response = await res.json();
      return { success: false, message: response.message };
    }

    return {
      success: true,
      message: "Successfully updated header"
    };
  },
  updateHome: async ({ request, fetch, cookies, params }) => {
    const data = await request.formData();

    const res = await fetch(`${API_BASE_PREFIX}/home?website_id=eq.${params.websiteId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookies.get("session_token")}`
      },
      body: JSON.stringify({
        main_content: data.get("main-content")
      })
    });

    if (!res.ok) {
      const response = await res.json();
      return { success: false, message: response.message };
    }

    return { success: true, message: "Successfully updated home" };
  },
  updateFooter: async ({ request, fetch, cookies, params }) => {
    const data = await request.formData();

    const res = await fetch(`${API_BASE_PREFIX}/footer?website_id=eq.${params.websiteId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookies.get("session_token")}`
      },
      body: JSON.stringify({
        additional_text: data.get("additional-text")
      })
    });

    if (!res.ok) {
      const response = await res.json();
      return { success: false, message: response.message };
    }

    return {
      success: true,
      message: "Successfully updated footer"
    };
  },
  pasteImage: async ({ request, fetch, cookies, params }) => {
    const data = await request.formData();
    const file = data.get("file") as File;

    const fileData = await fetch(`${API_BASE_PREFIX}/rpc/upload_file`, {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
        Authorization: `Bearer ${cookies.get("session_token")}`,
        Accept: "application/vnd.pgrst.object+json",
        "X-Website-Id": params.websiteId,
        "X-Mimetype": file.type,
        "X-Original-Filename": file.name
      },
      body: await file.arrayBuffer()
    });

    const fileJSON = await fileData.json();

    if (!fileData.ok) {
      return { success: false, message: fileJSON.message };
    }

    return { success: true, message: "Successfully uploaded image", fileId: fileJSON.file_id };
  }
};
