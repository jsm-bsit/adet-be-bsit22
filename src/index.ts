import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import postsRoute from './routes/posts.route';

const app = new Hono()

app.get('/', (c) => {
  return c.text('kumusta Hono!')
});

app.route('/posts', postsRoute);

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
