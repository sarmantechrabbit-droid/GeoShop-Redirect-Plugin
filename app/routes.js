import { index, route } from '@react-router/dev/routes'

export default [
  index('routes/_index.jsx'),
  route('auth/login', 'routes/auth.login.jsx'),
  route('auth/*', 'routes/auth.$.jsx'),
  route('app', 'routes/app.jsx', [
    index('routes/app._index.jsx'),
    route('settings', 'routes/app.settings.jsx'),
    route('preview', 'routes/app.preview.jsx'),
  ]),
  route('api/settings', 'routes/api.settings.jsx'),
  route('api/public-settings', 'routes/api.public-settings.jsx'),
]
