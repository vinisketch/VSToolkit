import * as winston from 'winston';
import { container } from 'vs_utils';
import { Input, LOGGER, Component} from './dist/vs_core.es.js';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.Console(),
  ],
});
container.registerValue(LOGGER, logger)



// console.log(Input);
//
//
//
// class MyComp extends Component {
//   @Input
//   aProp = 5;
// }
//
// const myComp = new MyComp();
// console.log (myComp)


function trace(value, {kind, name}) {
  if (kind === 'method') {
    return function (...args) {
      console.log(`CALL ${name}: ${JSON.stringify(args)}`);
      const result = value.apply(this, args);
      console.log('=> ' + JSON.stringify(result));
      return result;
    };
  }
}

class StringBuilder {
  #str = '';
  @trace
  add(str) {
    this.#str += str;
  }
  @trace
  toString() {
    return this.#str;
  }
}

const sb = new StringBuilder();
sb.add('Home');
sb.add('page');
assert.equal(
  sb.toString(), 'Homepage'
);
