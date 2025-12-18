import * as winston from 'winston';
// @ts-ignore
import { container, applyMixins, SupportMixins } from 'vs_utils';
// @ts-ignore
import { Input, LOGGER, Component} from './dist/vs_core.es.js';
import { BaseIdentifiable } from "./src/core/BaseIdentifiable";
import { EventSource } from "./src/core/event";

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



console.log(Input);



class MyComp extends Component {
  // @Input aProp = 5;
  constructor() {
    super();
  }
}

const myComp = new MyComp();
console.log (myComp)


//
// class Test extends SupportMixins {
//   constructor() {
//     super();
//   }
// }
//
// class Test2 extends Test {
//   constructor() {
//     super();
//   }
// }
//
// class MyMixin {
//   myFunction () {
//     console.log('MyMixin.myFunction')
//   }
// }
//
//
//
// interface Test extends MyMixin {}
//
// applyMixins(Test, [MyMixin]);
// // type Test = Test & MyMixin;
//
// const t = new Test2();
//
// console.log(t)
// t.myFunction();