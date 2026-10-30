import { SVGView } from '../../../src/ui';
import type { GuiTest } from './gui-test';

/** [href, position, view box] */
const SVGS: [string, number[] | undefined, number[]][] = [
  ['panel.svg#vis_haut', undefined, [100, 0, 30, 20]],
  ['panel.svg', [0, 50], [0, 0, 300, 200]],
  ['panel.svg#strobe_on', [0, 350], [45, 50, 50, 50]],
  ['panel.svg#strobe_off', [60, 350], [45, 80, 50, 50]],
];

export default {
  name: 'svg',
  description: 'a screw, the whole panel, and the strobe on and off, from panel.svg',
  image: 'svg.png',
  run(container) {
    const views = SVGS.map(([href, position, viewBox]) => {
      const svg = new SVGView({ href, viewBox, ...(position && { position }) });
      svg.init();
      container.appendChild(svg.view!);
      return svg;
    });
    return () => views.forEach(view => view.destroy());
  },
} satisfies GuiTest;
