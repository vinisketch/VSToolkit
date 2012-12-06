var page_template_str =
"<div class='page'>\
  <div class='place'>${city}, ${country}</div>\
  <img src='${photo}' />\
  <div class='description'>${description}</div>\
</div>"

var FlipView = vs.core.createClass ({

  /** parent class */
  parent: vs.ui.View,
  
  _current_sheet : null, // the flipping sheet

  _sheet_index : 0,
  _max_index : 0,
  
  _sheet_width: 0,

  _current_sheet_angle: 0,
  _flipping_mode: 0, // 0 : odd, 1: even
  
  // build the flip view
  initComponent : function (event) {
    this._super ();
    
    this.addClassName ('flipView');
    
    this.sheets = [];
    var page_tmp = new vs.ui.Template (page_template_str);
    
    var l = info.length, i = 0;
    this._max_index = (l - 1) >> 1;
    while (i < l) {
      var sheet = new vs.ui.View ().init ();
      sheet.addClassName ('sheet');
      this.add (sheet);
      
      // manage odd face
      var view = page_tmp.compileView ();
      view.configure (info [i++]);
      view.addClassName ('odd');
      sheet.add (view);
      
      // manage even face
      if (i < l) {
        view = page_tmp.compileView ();
        view.configure (info[i++]);
        view.addClassName ('even');
        sheet.add (view);
      }
      // create the last empty page
      else {
        view = new vs.ui.View ().init ();
        view.addClassName ('page even');
        sheet.add (view);
      }
      sheet.view.style.zIndex = (l - i + 1) >> 1;
      this.sheets.push (sheet);
    }
    this.view.addEventListener (vs.core.POINTER_START, this);
  },
  
  handleEvent: function (e)
  {
    // by default cancel any default behavior to avoid scroll for instance
    e.preventDefault ();
        
    switch (e.type)
    {
      case vs.core.POINTER_START:
        if (this._current_sheet) return;
        // prevent multi touch events
        if (vs.core.EVENT_SUPPORT_TOUCH && e.touches.length > 1) { return; }

        // we keep the event
        e.stopPropagation ();
        
        var pos = vs.util.getElementAbsolutePosition (this.view);
        this.__start_x = vs.core.EVENT_SUPPORT_TOUCH ?
          e.touches[0].pageX : e.pageX - pos.x;
        
        if (this.__start_x < 300) {
          if (this._sheet_index === 0) return;
          this._flipping_mode = 1;
          this._current_sheet = this.sheets [this._sheet_index - 1];
        }
        else {
          if (this._sheet_index === this.sheets.length) return;
          this._flipping_mode = 0;
          this._current_sheet = this.sheets [this._sheet_index];
        }
        
        document.addEventListener (vs.core.POINTER_END, this);
        document.addEventListener (vs.core.POINTER_MOVE, this);
        this._current_sheet.view.style.WebkitTransitionDuration = "0";
        
        // change the current zIndex to fix a bug with Chrome
        this._current_z_index = this._current_sheet.view.style.zIndex;
        this._current_sheet.view.style.zIndex = 10000;
        
        this._sheet_width = this._current_sheet.size [0];
        return false;
      break;

      case vs.core.POINTER_MOVE:
        if (!this._current_sheet) return;

        // prevent multi touch events
        if (vs.core.EVENT_SUPPORT_TOUCH && e.touches.length > 1) { return; }

        var pos = vs.util.getElementAbsolutePosition (this.view);

        var dx = this._sheet_width +
          (vs.core.EVENT_SUPPORT_TOUCH ? e.touches[0].pageX : e.pageX) - this.__start_x - pos.x;
        
        if (this._flipping_mode) dx -= (this._sheet_width * 2);

        // cause a flicking bug, manage a small decalage
        if (dx <= -this._sheet_width) dx = -this._sheet_width + 0.001;
        if (dx > this._sheet_width) dx = this._sheet_width;
        this._current_sheet_angle = Math.acos (dx/this._sheet_width);
          
        this._current_sheet.view.style.WebkitTransform = 
          "rotateY(-" + this._current_sheet_angle + "rad)";

        return false;
      break;

      case vs.core.POINTER_END:
        if (!this._current_sheet) return;
        // we keep the event
        e.stopPropagation ();

        this._current_sheet.view.style.WebkitTransitionDuration = "0.5s";
                
        if (!this._flipping_mode) {
          if (this._current_sheet_angle > Math.PI / 2) {
            // finish to flip the page
            // cause a flicking bug, manage a small decalage
            this._current_sheet.view.style.WebkitTransform = 
              "rotateY(-179.9999deg)";

           // change the z-index
           this._current_sheet.view.style.zIndex = this._sheet_index;
           this._sheet_index ++;
          }
          else {
            // reset the current rotation
            this._current_sheet.view.style.WebkitTransform = "rotateY(0deg)";
            this._current_sheet.view.style.zIndex = this._current_z_index;
          }
        }
        else {
          if (this._current_sheet_angle < Math.PI / 2) {
            // finish to flip the page
            this._current_sheet.view.style.WebkitTransform = "rotateY(0deg)";
          
            // change the z-index
            this._current_sheet.view.style.zIndex = 
              this._max_index - this._sheet_index + 1;
            this._sheet_index --;
          }
          else {
            // reset the current rotation
            // cause a flicking bug, manage a small decalage
            this._current_sheet.view.style.WebkitTransform = 
              "rotateY(-179.9999deg)";
            this._current_sheet.view.style.zIndex = this._current_z_index;
          }
        }

        this._current_sheet = null;
        
        document.removeEventListener (vs.core.POINTER_END, this);
        document.removeEventListener (vs.core.POINTER_MOVE, this);
        
        return false;
      break;
    }
  }
});