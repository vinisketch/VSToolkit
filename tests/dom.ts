/**
 * A browser like environment (happy-dom) for the ui tests: import it first
 * in a ui spec. The requests (the images…) are not sent: they get a 404.
 */
import { GlobalRegistrator } from '@happy-dom/global-registrator';

if (!GlobalRegistrator.isRegistered) {
  GlobalRegistrator.register({
    url: 'http://localhost/',
    settings: {
      fetch: {
        interceptor: {
          beforeAsyncRequest: async ({ window }) => new window.Response('', { status: 404 }),
          beforeSyncRequest: ({ window }) => ({
            status: 404, statusText: 'Not Found', ok: false, url: '', redirected: false,
            headers: new window.Headers(), body: Buffer.from(''),
          }),
        },
      },
    },
  });
}
