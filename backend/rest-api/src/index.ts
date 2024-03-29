import Fastify from 'fastify'
import {
    TypeBoxTypeProvider,
    TypeBoxValidatorCompiler
} from '@fastify/type-provider-typebox'
import fastifyAutoload from '@fastify/autoload'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { ajvFilePlugin } from '@fastify/multipart'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const envToLogger = {
    development: {
        transport: {
            target: 'pino-pretty',
            options: {
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname'
            }
        }
    },
    production: false,
    test: false
}

export function app() {
    const fastify = Fastify({
        logger: envToLogger[process.env.NODE_ENV as keyof typeof envToLogger],
        ajv: {
            plugins: [
                function (ajv: any) {
                    ajv.addKeyword({ keyword: 'x-examples' })
                },
                ajvFilePlugin
            ]
        }
    }).withTypeProvider<TypeBoxTypeProvider>()

    fastify.register(fastifyAutoload, {
        dir: join(__dirname, 'plugins')
    })

    fastify.register(fastifyAutoload, {
        dir: join(__dirname, 'modules'),
        options: Object.assign({ prefix: '/api/v1' }),
        ignoreFilter: (path) =>
            path.includes('schemas') ||
            path.includes('controller') ||
            path.includes('tests'),
        autoHooks: true,
        cascadeHooks: true
    })

    return fastify
}

if (
    process.argv[1] === new URL(import.meta.url).pathname ||
    process.env.pm_id !== undefined
) {
    const fastify = app()
    fastify.listen({ port: 3000 })
}
