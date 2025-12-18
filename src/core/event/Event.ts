// /**
//  *  @class
//  *  An Event object, or simply an event, contains information about an
//  *  input action such as a button click or a key down. The Event object contains
//  *  pertinent information about each event, such as where the cursor was located
//  *  or which character was typed.<br>
//  *  When an event is caught by an application component, the callback
//  *  receives as parameters an instance (or sub instance) of this class.
//  *  <p>
//  *  It specifies the source of the event (which object has generated the event),
//  *  the type of the event and an event data.
//  */
// export default class Event {
//   private static eventPool: Event[] = [];
//
//   /**
//    * The event spec. For instance 'click' for a mouse click event.
//    */
//   #type: string | undefined;
//   get type(): string | undefined {
//     return this.#type;
//   }
//
//   /**
//    * The optional data associated to the event.
//    */
//   private data: any | undefined;
//
//   /**
//    * The component which produce the event
//    */
//   public src: EventTarget | undefined;
//
//   /**
//    * [Deprecated] The component which produce the event. <br>
//    * In case of DOM event, the Event is mapped to the DOM event. Then
//    * the developer has access to srcTarget (and many other data).
//    * @deprecated
//    */
//   public srcTarget: EventTarget | undefined;
//
//   /**
//    * @param {string} type the event type [mandatory]
//    * @param {Object} data complementary event data [optional]
//    */
//   constructor(type?: string, data?: any) {
//     if (type) this.configure(type, data);
//   }
//
//   configure(type: string, data?: any): void {
//     this.#type = type;
//     this.data = data;
//   }
//
//   static retain(): Event {
//     if (this.eventPool.length > 0) {
//       return this.eventPool.pop()!;
//     }
//     return new Event();
//   }
//
//   static release(event: Event): void {
//     this.eventPool.push(event);
//   }
// }
