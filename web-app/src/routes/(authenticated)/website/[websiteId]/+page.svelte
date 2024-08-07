<script lang="ts">
  import { enhance } from "$app/forms";
  import WebsiteEditor from "$lib/components/WebsiteEditor.svelte";
  import { ALLOWED_MIME_TYPES } from "$lib/utils";
  import SuccessOrError from "$lib/components/SuccessOrError.svelte";
  import type { ActionData, PageServerData } from "./$types";
  import Modal from "$lib/components/Modal.svelte";

  const { data, form } = $props<{ data: PageServerData; form: ActionData }>();
</script>

<SuccessOrError success={form?.success} message={form?.message} />

<WebsiteEditor
  id={data.website.id}
  title={data.website.title}
  previewContent={data.home.main_content}
>
  <section>
    <h2>Global</h2>
    <form
      action="?/updateGlobal"
      method="POST"
      enctype="multipart/form-data"
      use:enhance={() => {
        return async ({ update }) => {
          await update({ reset: false });
        };
      }}
    >
      <label>
        Light accent color:
        <input
          type="color"
          name="accent-color-light"
          value={data.globalSettings.accent_color_light_theme}
          pattern="\S(.*\S)?"
          required
        />
      </label>
      <label>
        Dark accent color:
        <input
          type="color"
          name="accent-color-dark"
          value={data.globalSettings.accent_color_dark_theme}
          pattern="\S(.*\S)?"
          required
        />
      </label>
      <div class="file-field">
        <label>
          Favicon:
          <input type="file" name="favicon" accept={ALLOWED_MIME_TYPES.join(", ")} />
        </label>
        {#if data.globalSettings.media}
          <Modal id="preview-favicon-global-{data.globalSettings.website_id}" text="Preview">
            <img
              src={`http://localhost:5173/${data.globalSettings.media.file_system_path}`}
              alt={data.globalSettings.media.original_name}
            />
          </Modal>
        {/if}
      </div>

      <button type="submit">Submit</button>
    </form>
  </section>

  <section>
    <h2>Header</h2>

    <form
      action="?/updateHeader"
      method="POST"
      enctype="multipart/form-data"
      use:enhance={() => {
        return async ({ update }) => {
          await update({ reset: false });
        };
      }}
    >
      <label>
        Logo type:
        <select name="logo-type">
          <option value="text" selected={"text" === data.header.logo_type}>Text</option>
          <option value="image" selected={"image" === data.header.logo_type}>Image</option>
        </select>
      </label>
      <label>
        Logo text:
        <input
          type="text"
          name="logo-text"
          value={data.header.logo_text}
          pattern="\S(.*\S)?"
          required={data.header.logo_type === "text"}
        />
      </label>
      <div class="file-field">
        <label>
          Logo image:
          <input
            type="file"
            name="logo-image"
            accept={ALLOWED_MIME_TYPES.join(", ")}
            required={data.header.logo_type === "image"}
          />
        </label>
        {#if data.header.media}
          <Modal id="preview-logo-header-{data.header.website_id}" text="Preview">
            <img
              src={`http://localhost:5173/${data.header.media.file_system_path}`}
              alt={data.header.media.original_name}
            />
          </Modal>
        {/if}
      </div>

      <button type="submit">Submit</button>
    </form>
  </section>

  <section>
    <h2>Home</h2>

    <form
      action="?/updateHome"
      method="POST"
      use:enhance={() => {
        return async ({ update }) => {
          await update({ reset: false });
        };
      }}
    >
      <label>
        Main content:
        <textarea name="main-content" rows="20" required>{data.home.main_content}</textarea>
      </label>

      <button type="submit">Submit</button>
    </form>
  </section>

  <section>
    <h2>Footer</h2>

    <form
      action="?/updateFooter"
      method="POST"
      use:enhance={() => {
        return async ({ update }) => {
          await update({ reset: false });
        };
      }}
    >
      <label>
        Additional text:
        <textarea name="additional-text" rows="5" maxlength="250" required
          >{data.footer.additional_text}</textarea
        >
      </label>

      <button type="submit">Submit</button>
    </form>
  </section>
</WebsiteEditor>
