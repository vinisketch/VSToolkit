import { InOut, Model, connect } from 'vs_toolkit/vs_core';
import { View, toText } from '../../../src/ui';
import type { GuiTest } from './gui-test';

interface Address { address: string }

/** the model */
class Contact extends Model {
  @InOut accessor photo = '';
  @InOut accessor firstname = '';
  @InOut accessor lastname = '';
  @InOut accessor companie = '';
  @InOut accessor tels: string[] = [];
  @InOut accessor addresses: Address[] = [];
}

/** the view of a contact */
class ContactView extends View {
  protected override htmlTemplate = `<div class="contact">
    <img>
    <div class="name"></div>
    <div class="comp"></div>
    <div class="tel"></div>
    <div class="address"></div>
  </div>`;

  #firstname = '';
  #lastname = '';

  #node(selector: string): HTMLElement | null {
    return this.view?.querySelector<HTMLElement>(selector) ?? null;
  }

  #renderName(): void {
    const name = this.#node('.name');
    if (name) name.textContent = `${this.#firstname} ${this.#lastname}`;
  }

  #renderList(selector: string, texts: string[]): void {
    this.#node(selector)?.replaceChildren(...texts.map(text => {
      const line = document.createElement('div');
      line.textContent = text;
      return line;
    }));
  }

  @InOut set photo(v: string) {
    this.#node('img')?.setAttribute('src', v);
  }

  @InOut set firstname(v: string) {
    this.#firstname = toText(v) ?? '';
    this.#renderName();
  }

  @InOut set lastname(v: string) {
    this.#lastname = toText(v) ?? '';
    this.#renderName();
  }

  @InOut set companie(v: string) {
    const companie = this.#node('.comp');
    if (companie) companie.textContent = toText(v) ?? '';
  }

  @InOut set tels(v: string[]) {
    this.#renderList('.tel', v);
  }

  @InOut set addresses(v: Address[]) {
    this.#renderList('.address', v.map(({ address }) => address));
  }
}

/** the view follows the model */
function bind(contact: Contact, view: ContactView): () => void {
  const pipes = [
    connect(contact.$.photo).to(view.$.photo),
    connect(contact.$.firstname).to(view.$.firstname),
    connect(contact.$.lastname).to(view.$.lastname),
    connect(contact.$.companie).to(view.$.companie),
    connect(contact.$.tels).to(view.$.tels),
    connect(contact.$.addresses).to(view.$.addresses),
  ];
  return () => pipes.forEach(pipe => pipe.disconnect());
}

export default {
  name: 'template_mvc',
  description: 'two contacts: John DoeDoe (IBM, 1 phone, 1 address), and Jo DoeDoe (2 phones, another address)',
  image: 'template_mvc.png',
  css: 'template_mvc.css',
  run(container) {
    const view1 = new ContactView();
    view1.init();
    const view2 = new ContactView();
    view2.init();
    container.append(view1.view!, view2.view!);

    const contact1 = new Contact();
    const contact2 = new Contact();
    const unbinds = [bind(contact1, view1), bind(contact2, view2)];

    contact1.assign({
      photo: 'https://data.whicdn.com/images/35834939/large.jpg',
      firstname: 'John',
      lastname: 'Doe',
      companie: 'IBM',
      tels: ['34 8984 4380'],
      addresses: [{ address: '145 bd Saint George, 67000 Toulouse' }],
    });
    contact1.lastname = 'DoeDoe';

    // a copy of the first contact, then changed
    contact2.assign({
      photo: 'https://data.whicdn.com/images/39254141/large.jpg',
      firstname: 'Jo',
      lastname: contact1.lastname,
      companie: contact1.companie,
      tels: [...contact1.tels, '34 8984 4389'],
      addresses: [{ address: '123 bd Saint Michel, 67000 Toulouse' }],
    });

    return () => {
      unbinds.forEach(unbind => unbind());
      [view1, view2, contact1, contact2].forEach(component => component.destroy());
    };
  },
} satisfies GuiTest;
