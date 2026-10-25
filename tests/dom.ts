/**
 * A browser like environment (happy-dom) for the ui tests: import it first
 * in a ui spec.
 */
import { GlobalRegistrator } from '@happy-dom/global-registrator';

if (!GlobalRegistrator.isRegistered) {
  GlobalRegistrator.register({ url: 'http://localhost/' });
}
