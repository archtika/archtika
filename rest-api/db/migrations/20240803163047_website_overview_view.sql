-- migrate:up
CREATE VIEW api.website_overview WITH ( security_invoker = ON
) AS
SELECT
  w.id,
  w.user_id,
  w.content_type,
  w.title,
  s.accent_color_light_theme,
  s.accent_color_dark_theme,
  s.favicon_image,
  h.logo_type,
  h.logo_text,
  h.logo_image,
  ho.main_content,
  f.additional_text,
  (
    SELECT
      JSON_AGG(
        JSON_BUILD_OBJECT(
          'title', a.title, 'meta_description', a.meta_description, 'meta_author', a.meta_author, 'cover_image', a.cover_image, 'publication_date', a.publication_date, 'main_content', a.main_content
)
)
    FROM
      internal.article a
    WHERE
      a.website_id = w.id
) AS articles
FROM
  internal.website w
  JOIN internal.settings s ON w.id = s.website_id
  JOIN internal.header h ON w.id = h.website_id
  JOIN internal.home ho ON w.id = ho.website_id
  JOIN internal.footer f ON w.id = f.website_id;

GRANT SELECT ON api.website_overview TO authenticated_user;

-- migrate:down
REVOKE SELECT ON api.website_overview FROM authenticated_user;

DROP VIEW api.website_overview;

