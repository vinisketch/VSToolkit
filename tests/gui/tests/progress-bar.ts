import { ProgressBar } from '../../../src/ui';
import type { GuiTest } from './gui-test';

export default {
  name: 'progressBar',
  description: 'two progress bars progressing (in [0, 100] and [50, 80]), and an indeterminate one',
  image: 'progressBar.jpg',
  run(container) {
    let index = 62;
    const progress1 = new ProgressBar({ position: [50, 50], size: [300, 10], index });
    const progress2 = new ProgressBar({ position: [50, 80], size: [300, 10], indeterminate: true });
    const progress3 = new ProgressBar({ position: [50, 110], size: [100, 10], range: [50, 80], index });
    const bars = [progress1, progress2, progress3];
    for (const bar of bars) {
      bar.init();
      container.appendChild(bar.view!);
    }

    let interval: ReturnType<typeof setInterval> | undefined;
    const start = setTimeout(() => {
      interval = setInterval(() => {
        progress1.index = index;
        progress3.index = index;
        index += 0.1;
        if (index > 100) index = 0;
      }, 10);
    }, 1000);

    return () => {
      clearTimeout(start);
      clearInterval(interval);
      bars.forEach(bar => bar.destroy());
    };
  },
} satisfies GuiTest;
