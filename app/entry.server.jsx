import { PassThrough } from 'node:stream'
import { createReadableStreamFromReadable } from '@react-router/node'
import { ServerRouter } from 'react-router'
import { renderToPipeableStream } from 'react-dom/server'
import { isbot } from 'isbot'
import { addDocumentResponseHeaders } from './shopify.server.js'

export default function handleRequest(
  request,
  responseStatusCode,
  responseHeaders,
  reactRouterContext,
) {
  return new Promise((resolve, reject) => {
    let shellRendered = false
    const userAgent = request.headers.get('user-agent')
    const readyOption = isbot(userAgent) ? 'onAllReady' : 'onShellReady'

    const { pipe, abort } = renderToPipeableStream(
      <ServerRouter context={reactRouterContext} url={request.url} />,
      {
        [readyOption]() {
          shellRendered = true
          const body = new PassThrough()
          const stream = createReadableStreamFromReadable(body)

          addDocumentResponseHeaders(request, responseHeaders)
          responseHeaders.set('Content-Type', 'text/html')
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode,
            }),
          )
          pipe(body)
        },
        onShellError(error) {
          reject(error)
        },
        onError(error) {
          responseStatusCode = 500
          if (shellRendered) {
            console.error(error)
          }
        },
      },
    )

    setTimeout(abort, 5000)
  })
}
