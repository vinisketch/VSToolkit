import { Button } from '../../../src/ui';
import type { GuiTest } from './gui-test';

/** [x, y, width, height, style, type] */
const BUTTONS: [number, number, number, number, string?, string?][] = [
  [50, 50, 130, 43],
  [200, 50, 130, 43, Button.GREEN_STYLE],
  [50, 110, 130, 43, Button.GREY_STYLE],
  [200, 110, 130, 43, Button.RED_STYLE],
  [50, 170, 70, 30, undefined, Button.NAVIGATION_TYPE],
  [50, 220, 70, 30, undefined, Button.NAVIGATION_BACK_TYPE],
  [50, 270, 70, 30, undefined, Button.NAVIGATION_FORWARD_TYPE],
  [150, 170, 70, 30, Button.BLACK_STYLE, Button.NAVIGATION_TYPE],
  [150, 220, 70, 30, Button.BLACK_STYLE, Button.NAVIGATION_BACK_TYPE],
  [150, 270, 70, 30, Button.BLACK_STYLE, Button.NAVIGATION_FORWARD_TYPE],
  [250, 170, 70, 30, Button.SILVER_STYLE, Button.NAVIGATION_TYPE],
  [250, 220, 70, 30, Button.SILVER_STYLE, Button.NAVIGATION_BACK_TYPE],
  [250, 270, 70, 30, Button.SILVER_STYLE, Button.NAVIGATION_FORWARD_TYPE],
];

export default {
  name: 'button',
  description: 'the button styles and types',
  image: 'button.jpg',
  run(container) {
    const buttons = BUTTONS.map(([x, y, width, height, style, type]) => {
      const button = new Button({
        position: [x, y], size: [width, height], text: 'hello',
        ...(style && { style }), ...(type && { type }),
      });
      button.init();
      container.appendChild(button.view!);
      return button;
    });
    return () => buttons.forEach(button => button.destroy());
  },
} satisfies GuiTest;
