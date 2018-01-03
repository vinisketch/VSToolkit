function launchTest (test_view)
{
  var svg = new vs_ui.SVGView ().init ();
  test_view.appendChild (svg.view);  
  svg.href = "panel.svg#vis_haut";
  svg.viewBox = [100, 0, 30, 20];

  svg = new vs_ui.SVGView ().init ();
  test_view.appendChild (svg.view);
  svg.position = [0, 50];
  svg.viewBox = [0, 0, 300, 200];
  svg.href = "panel.svg";

  svg = new vs_ui.SVGView ().init ();
  test_view.appendChild (svg.view);
  svg.position = [0, 350];
  svg.href = "panel.svg#strobe_on";
  svg.viewBox = [45, 50, 50, 50];

  svg = new vs_ui.SVGView ().init ();
  test_view.appendChild (svg.view);
  svg.position = [60, 350];
  svg.href = "panel.svg#strobe_off";
  svg.viewBox = [45, 80, 50, 50];
}
