import { FastifyInstance } from 'fastify'
import assert from 'node:assert'
import { after, before, describe, it } from 'node:test'
import { app as buildApp } from '../../index.js'
import { exampleComponentValues } from './components-schemas.js'

describe('components', async () => {
    let app: FastifyInstance
    let pageId: string
    let componentId: string
    let componentIdPosition: string

    before(async () => {
        app = buildApp()
        await app.ready()

        await app.kysely.db
            .insertInto('auth.auth_user')
            .values({
                id: 'qkj7ld6pgsqvurgfxaao',
                username: 'testuser',
                email: 'testuser@example.com'
            })
            .onConflict((oc) => oc.column('id').doNothing())
            .execute()

        const website = await app.kysely.db
            .insertInto('structure.website')
            .values({
                user_id: 'qkj7ld6pgsqvurgfxaao',
                title: 'Some title',
                meta_description: 'Some description',
                last_modified_by: 'qkj7ld6pgsqvurgfxaao'
            })
            .returningAll()
            .executeTakeFirstOrThrow()

        const page = await app.kysely.db
            .insertInto('structure.page')
            .values({
                website_id: website.id,
                route: `/initial`,
                title: 'Some page title',
                meta_description: 'Some page description'
            })
            .returningAll()
            .executeTakeFirstOrThrow()

        pageId = page.id

        const component = await app.kysely.db
            .insertInto('components.component')
            .values({
                page_id: pageId,
                type: 'text',
                content: exampleComponentValues.Text.value.content
            })
            .returningAll()
            .executeTakeFirstOrThrow()

        componentId = component.id

        const componentPosition = await app.kysely.db
            .insertInto('components.component')
            .values({
                page_id: pageId,
                type: 'text',
                content: exampleComponentValues.Text.value.content
            })
            .returningAll()
            .executeTakeFirstOrThrow()

        componentIdPosition = componentPosition.id
    })

    after(() => {
        app.close()
    })

    describe('POST /api/v1/pages/{id}/components', () => {
        it('should return 201 when the payload is valid', async () => {
            const res = await app.inject({
                method: 'POST',
                url: `/api/v1/pages/${pageId}/components`,
                headers: {
                    origin: 'http://localhost:3000',
                    host: 'localhost:3000'
                },
                payload: {
                    type: 'text',
                    content: exampleComponentValues.Text.value.content
                }
            })

            assert.deepStrictEqual(res.statusCode, 201)
        })
    })

    describe('GET /api/v1/pages/{id}/components', () => {
        it('should return 200 when an empty array or an array of components is returned', async () => {
            const res = await app.inject({
                method: 'GET',
                url: `/api/v1/pages/${pageId}/components`,
                headers: {
                    origin: 'http://localhost:3000',
                    host: 'localhost:3000'
                }
            })

            assert.deepStrictEqual(res.statusCode, 200)
        })
    })

    describe('GET /api/v1/pages/{pageId}/components/{componentId}', () => {
        it('should return 200 when a component object is returned', async () => {
            const res = await app.inject({
                method: 'GET',
                url: `/api/v1/pages/${pageId}/components/${componentId}`,
                headers: {
                    origin: 'http://localhost:3000',
                    host: 'localhost:3000'
                }
            })

            assert.deepStrictEqual(res.statusCode, 200)
        })
    })

    describe('PATCH /api/v1/pages/{pageId}/components/{componentId}', () => {
        it('should return 200 when a page object is returned', async () => {
            const res = await app.inject({
                method: 'PATCH',
                url: `/api/v1/pages/${pageId}/components/${componentId}`,
                headers: {
                    origin: 'http://localhost:3000',
                    host: 'localhost:3000'
                },
                payload: {
                    type: 'text',
                    content: {
                        textContent: 'This is updated text!'
                    }
                }
            })

            assert.deepStrictEqual(res.statusCode, 200)
        })
    })

    describe('DELETE /api/v1/pages/{pageId}/components/{componentId}', () => {
        it('should return 200 when a page object is returned', async () => {
            const res = await app.inject({
                method: 'DELETE',
                url: `/api/v1/pages/${pageId}/components/${componentId}`,
                headers: {
                    origin: 'http://localhost:3000',
                    host: 'localhost:3000'
                }
            })

            assert.deepStrictEqual(res.statusCode, 200)
        })
    })

    describe('POST /api/v1/components/{id}/position', () => {
        it('should return 200 when a component position object is returned', async () => {
            const res = await app.inject({
                method: 'POST',
                url: `/api/v1/components/${componentIdPosition}/position`,
                headers: {
                    origin: 'http://localhost:3000',
                    host: 'localhost:3000'
                },
                payload: {
                    grid_x: 2,
                    grid_y: 2,
                    grid_width: 2,
                    grid_height: 2
                }
            })

            assert.deepStrictEqual(res.statusCode, 201)
        })
    })

    describe('PATCH /api/v1/components/{id}/position', () => {
        it('should return 200 when a component position object is returned', async () => {
            const res = await app.inject({
                method: 'PATCH',
                url: `/api/v1/components/${componentIdPosition}/position`,
                headers: {
                    origin: 'http://localhost:3000',
                    host: 'localhost:3000'
                },
                payload: {
                    grid_x: 5,
                    grid_y: 4,
                    grid_width: 8,
                    grid_height: 2
                }
            })

            assert.deepStrictEqual(res.statusCode, 200)
        })
    })
})
