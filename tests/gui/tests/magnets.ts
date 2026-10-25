import { Button, ProgressBar, View } from '../../../src/ui';
import type { GuiTest } from './gui-test';

function box(position: number[], size: number[], color?: string): View {
  const view = new View({ position, size, layout: View.ABSOLUTE_LAYOUT });
  view.init();
  if (color) view.setStyle('background-color', color);
  return view;
}

export default {
  name: 'magnets',
  description: 'nested views attached by magnets: red centered, blue at the bottom, yellow at the right, ' +
    'the button at the left and the progress bar at the top',
  image: 'magnets.jpg',
  run(container) {
    const root = box([0, 0], [400, 500]);
    container.appendChild(root.view!);

    const red = box([0, 10], [300, 400], 'red');
    root.add(red);
    const blue = box([20, 50], [230, 210], 'blue');
    red.add(blue);
    const yellow = box([30, 100], [200, 100], 'yellow');
    blue.add(yellow);

    const progress = new ProgressBar({ position: [50, 10], size: [100, 10] });
    progress.init();
    yellow.add(progress);
    const button = new Button({ position: [50, 40], text: 'Huhh' });
    button.init();
    yellow.add(button);

    red.magnet = View.MAGNET_CENTER;
    blue.magnet = View.MAGNET_BOTTOM;
    yellow.magnet = View.MAGNET_RIGHT;
    button.magnet = View.MAGNET_LEFT;
    progress.magnet = View.MAGNET_TOP;

    return () => root.destroy();
  },
} satisfies GuiTest;
