import { type Static, Type } from "@sinclair/typebox";

export const singleParamsSchema = Type.Object({
  id: Type.String({ format: "uuid" }),
});

export type SingleParamsSchemaType = Static<typeof singleParamsSchema>;

export const paramsSchema = Type.Object({
  pageId: Type.String({ format: "uuid" }),
  componentId: Type.String({ format: "uuid" }),
});

export type ParamsSchemaType = Static<typeof paramsSchema>;

const createComponentHeaderSchema = Type.Object({
  type: Type.Literal("header"),
  is_public: Type.Boolean(),
  content: Type.Null(),
  parent_id: Type.Null(),
});

const createComponentFooterSchema = Type.Object({
  type: Type.Literal("footer"),
  is_public: Type.Boolean(),
  content: Type.Null(),
  parent_id: Type.Null(),
});

const createComponentSectionSchema = Type.Object({
  type: Type.Literal("section"),
  content: Type.Null(),
  parent_id: Type.Null(),
});

const createComponentTextSchema = Type.Object({
  type: Type.Literal("text"),
  content: Type.Object({
    textContent: Type.String({ minLength: 1 }),
  }),
  parent_id: Type.Optional(
    Type.Union([Type.String({ format: "uuid" }), Type.Null()]),
  ),
});

const updateComponentTextSchema = Type.Object({
  type: Type.Literal("text"),
  content: Type.Optional(
    Type.Object({
      textContent: Type.Optional(Type.String({ minLength: 1 })),
    }),
  ),
  parent_id: Type.Optional(
    Type.Union([Type.String({ format: "uuid" }), Type.Null()]),
  ),
});

const createComponentButtonSchema = Type.Object({
  type: Type.Literal("button"),
  content: Type.Object({
    textContent: Type.String({ minLength: 1 }),
    hyperlink: Type.String({ minLength: 1 }),
  }),
  parent_id: Type.Optional(
    Type.Union([Type.String({ format: "uuid" }), Type.Null()]),
  ),
});

const updateComponentButtonSchema = Type.Object({
  type: Type.Literal("button"),
  content: Type.Optional(
    Type.Object({
      textContent: Type.Optional(Type.String({ minLength: 1 })),
      hyperlink: Type.Optional(Type.String({ minLength: 1 })),
    }),
  ),
  parent_id: Type.Optional(
    Type.Union([Type.String({ format: "uuid" }), Type.Null()]),
  ),
});

const createComponentImageSchema = Type.Object({
  type: Type.Literal("image"),
  content: Type.Object({
    altText: Type.Optional(
      Type.Union([Type.String({ minLength: 1 }), Type.Null()]),
    ),
  }),
  assetId: Type.String({ format: "uuid" }),
  parent_id: Type.Optional(
    Type.Union([Type.String({ format: "uuid" }), Type.Null()]),
  ),
});

const updateComponentImageSchema = Type.Object({
  type: Type.Literal("image"),
  content: Type.Optional(
    Type.Object({
      altText: Type.Optional(
        Type.Union([Type.String({ minLength: 1 }), Type.Null()]),
      ),
    }),
  ),
  assetId: Type.Optional(Type.String({ format: "uuid" })),
  parent_id: Type.Optional(
    Type.Union([Type.String({ format: "uuid" }), Type.Null()]),
  ),
});

const createComponentVideoSchema = Type.Object({
  type: Type.Literal("video"),
  content: Type.Object({
    altText: Type.Optional(
      Type.Union([Type.String({ minLength: 1 }), Type.Null()]),
    ),
    isLooped: Type.Optional(Type.Boolean()),
  }),
  assetId: Type.String({ format: "uuid" }),
  parent_id: Type.Optional(
    Type.Union([Type.String({ format: "uuid" }), Type.Null()]),
  ),
});

const updateComponentVideoSchema = Type.Object({
  type: Type.Literal("video"),
  content: Type.Optional(
    Type.Object({
      altText: Type.Optional(
        Type.Union([Type.String({ minLength: 1 }), Type.Null()]),
      ),
      isLooped: Type.Optional(Type.Boolean()),
    }),
  ),
  assetId: Type.Optional(Type.String({ format: "uuid" })),
  parent_id: Type.Optional(
    Type.Union([Type.String({ format: "uuid" }), Type.Null()]),
  ),
});

const createComponentAudioSchema = Type.Object({
  type: Type.Literal("audio"),
  content: Type.Object({
    altText: Type.Optional(
      Type.Union([Type.String({ minLength: 1 }), Type.Null()]),
    ),
    isLooped: Type.Optional(Type.Boolean()),
  }),
  assetId: Type.String({ format: "uuid" }),
  parent_id: Type.Optional(
    Type.Union([Type.String({ format: "uuid" }), Type.Null()]),
  ),
});

const updateComponentAudioSchema = Type.Object({
  type: Type.Literal("audio"),
  content: Type.Optional(
    Type.Object({
      altText: Type.Optional(
        Type.Union([Type.String({ minLength: 1 }), Type.Null()]),
      ),
      isLooped: Type.Optional(Type.Boolean()),
    }),
  ),
  assetId: Type.Optional(Type.String({ format: "uuid" })),
  parent_id: Type.Optional(
    Type.Union([Type.String({ format: "uuid" }), Type.Null()]),
  ),
});

export const exampleComponentValues = {
  Header: {
    value: {
      type: "header",
      is_public: true,
      content: null,
      parent_id: null,
    },
  },
  Footer: {
    value: {
      type: "footer",
      is_public: true,
      content: null,
      parent_id: null,
    },
  },
  Section: {
    value: {
      type: "section",
      content: null,
      parent_id: null,
    },
  },
  Text: {
    value: {
      type: "text",
      content: {
        textContent: "Hello, world!",
      },
    },
  },
  Button: {
    value: {
      type: "button",
      content: {
        textContent: "Click me!",
        hyperlink: "https://google.com",
      },
    },
  },
  Image: {
    value: {
      type: "image",
      content: {
        altText: "An image of a cat",
      },
      assetId: "00000000-0000-0000-0000-000000000000",
    },
  },
  Video: {
    value: {
      type: "video",
      content: {
        altText: "A video of a cat",
        isLooped: true,
      },
      assetId: "00000000-0000-0000-0000-000000000000",
    },
  },
  Audio: {
    value: {
      type: "audio",
      content: {
        altText: "An audio of a cat",
        isLooped: true,
      },
      assetId: "00000000-0000-0000-0000-000000000000",
    },
  },
};

export const createComponentSchema = Type.Union(
  [
    createComponentHeaderSchema,
    createComponentFooterSchema,
    createComponentSectionSchema,
    createComponentTextSchema,
    createComponentButtonSchema,
    createComponentImageSchema,
    createComponentVideoSchema,
    createComponentAudioSchema,
  ],
  {
    "x-examples": exampleComponentValues,
  },
);

export type CreateComponentSchemaType = Static<typeof createComponentSchema>;

export const updateComponentSchema = Type.Union(
  [
    updateComponentTextSchema,
    updateComponentButtonSchema,
    updateComponentImageSchema,
    updateComponentVideoSchema,
    updateComponentAudioSchema,
  ],
  {
    "x-examples": exampleComponentValues,
  },
);

export type UpdateComponentSchemaType = Static<typeof updateComponentSchema>;

export const componentPositionSchema = Type.Object({
  row_start: Type.Integer(),
  col_start: Type.Integer({ minimum: 0 }),
  row_end: Type.Integer(),
  col_end: Type.Integer({ minimum: 0 }),
  row_end_span: Type.Integer({ minimum: 0 }),
  col_end_span: Type.Integer({ minimum: 0 }),
});

export type ComponentPositionSchemaType = Static<
  typeof componentPositionSchema
>;
