/** @license
  Copyright (C) 2009-2012. David Thevenin, ViniSketch SARL (c), and 
  contributors. All rights reserved
  
  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU Lesser General Public License as published
  by the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.
  
  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  GNU Lesser General Public License for more details.
  
  You should have received a copy of the GNU Lesser General Public License
  along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

(function (window, undefined) {

var document = window.document;

/**
  Copyright (C) 2009-2012. David Thevenin, ViniSketch SARL (c), and 
  contributors. All rights reserved
  
  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU Lesser General Public License as published
  by the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.
  
  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  GNU Lesser General Public License for more details.
  
  You should have received a copy of the GNU Lesser General Public License
  along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

/********************************************************************
                   
*********************************************************************/
/** @private */
var vs = window.vs,
  util = vs.util,
  core = vs.core,
  ui = vs.ui,
  fx = vs.fx,
  ext = vs.ext,
  ext_ui = ext.ui,
  ext_fx = ext.fx;
/**
  Copyright (C) 2009-2012. David Thevenin, ViniSketch SARL (c), and 
  contributors. All rights reserved
  
  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU Lesser General Public License as published
  by the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.
  
  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  GNU Lesser General Public License for more details.
  
  You should have received a copy of the GNU Lesser General Public License
  along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

/**
 *  The vs.ext.ui.GMap class
 *
 *  @extends vs.ui.View
 *  @class
 *  GMap provides a widget for embedding maps directly into your application. 
 *  This widget uses the Google GMaps Javascript API V3, especially optimized 
 *  to run on mobile platform.
 *  <p>
 *  The widget allows to add annotations which are marker + information bubble
 *  which are added to the map.
 *  <p>
 *  Events:
 *  <ul> mapload : fire when the map is loaded and ready to use.</ul>
 *  <ul> annotationselect : fire when a marker's information bubble is 
 *       selected.</ul>
 *  <p>
 *  @example
 *  
 *  @author David Thevenin
 *
 * @name vs.ext.ui.GMap
 *  @constructor
 *   Creates a new GMap.
 *
 *  @param {Object} config the configuration structure [mandatory]
 */
var GMap = function (config)
{
  this.parent = vs.ui.View;
  this.parent (config);
  this.constructor = GMap;
  
  this._center = new Array ();
  this._center [0] = 48.83763339660763; 
  this._center [1] = 2.3397827148437544;
  
  if (!GMap.__google_loaded__)
  {
    if (!GMap.__google_wait_loaded__)
    {
      GMap.__google_wait_loaded__ = true;
      vs.util.importFile 
  ("http://maps.google.com/maps/api/js?sensor=true&callback=vs.ext.ui.GMap.__on_laoded", null, null, 'js');
    }
    
    GMap._to_finish_init.push (this);
  }
  
  this.__annotations = {};
};

/**
 * @private
 */
GMap.NO_MARKER = 0;
GMap.DEVICE_IMAGE_MARKER = 1;
GMap.IMAGE_MARKER = 2;

/**
 * @private
 */
GMap._anotation_templates_ = {};
GMap._anotation_templates_ ['default'] = {
  marker: {
    type: GMap.DEVICE_IMAGE_MARKER
  },
  infoWindow :
  "<div class=\"vs_ext_ui_gmap_info\">\
    <div>{title}</div>\
    <div>{subtitle}</div>\
  </div>"
};

/**
 * @private
 */
GMap.__google_wait_loaded__ = false;

/**
 * @private
 */
GMap.__google_loaded__ = false;

/**
 * @private
 */
GMap._to_finish_init = new Array ();

/**
 * @private
 * @function
 */
GMap.__on_laoded = function ()
{
  var i, l; 
  
  GMap.__google_loaded__ = true;
  GMap.__google_wait_loaded__ = false;
  
  createInfoWindowClass ();
  
  for (i = 0, l = GMap._to_finish_init.length; i < l; i ++)
  {
    GMap._to_finish_init [i].finishInit ();
  }
  
  GMap._to_finish_init = null;
}

GMap.prototype = {

 /**********************************************************************
 
 *********************************************************************/

  /**
   * @protected
   * @type {number}
   */
  _zoom: 10,

  /**
   * @protected
   * @type {number}
   */
  _tilt: -1,

  /**
   * @protected
   * @type {boolean}
   */
  _scroll: true,

  /**
   * @protected
   * @type {boolean}
   */
  _tap_to_zoom: true,

  /**
   * @protected
   * @type {number}
   */
  _max_zoom: 20,

  /**
   * @protected
   * @type {number}
   */
  _min_zoom: 1,

  /**
   * @protected
   * @type {boolean}
   */
  _zoom_control: false,

  /**
   * @protected
   * @type {boolean}
   */
  _street_view_control: false,
  
  /**
   * @protected
   * @type {Array<.number>}
   */
  _center: null,
  
  /**
   * @private
   */
  _gmap: null,
  __init_finished: false,

  /**
   * @private
   */
  __annotations: null,

  /*****************************************************************
   *
   ****************************************************************/

  /**
   * @protected
   */
  destructor : function ()
  {
    delete (this._gmap);
    
    vs.ui.View.prototype.destructor.call (this);
  },

  /**
   * @protected
   */
  initComponent : function ()
  {
    vs.ui.View.prototype.initComponent.call (this);
    if (GMap.__google_loaded__)
    {
      this.finishInit ();
    }
  },
  
  /**
   * @private
   */
  finishInit : function ()
  {
    var latLng = new google.maps.LatLng (this._center [0], this._center [1]);
    
    var myOptions = {
      zoom: this._zoom,
      center: latLng,
      disableDefaultUI: true,
      draggable: this._scroll,
      maxZoom: this._max_zoom,
      minZoom: this._min_zoom,
      disableDoubleClickZoom: !this._tap_to_zoom,
      streetViewControl: this._street_view_control,
      streetViewControlOptions: {
        position: google.maps.ControlPosition.LEFT_TOP
      },
      zoomControl: this._zoom_control,
      zoomControlOptions: {
        position: google.maps.ControlPosition.LEFT_BOTTOM,
        style: google.maps.ZoomControlStyle.SMALL
      },
      mapTypeControlOptions: {
        style: google.maps.ControlPosition.HORIZONTAL_BAR
      },
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
     }    
    };
    
    this._gmap = new google.maps.Map (this.view, myOptions);
    
    var self = this;
    setTimeout (function () { clear_view_style (self)}, 0);
  },
  
  /**
   * @private
   */
  __init_did_finish : function ()
  {
    this.__init_finished = true;

//     this.center = this._center;
//     this.maxZoom = this._max_zoom;
//     this.minZoom = this._min_zoom;
//     this.scroll = this._scroll;
//     this.tapToZoom = this._tap_to_zoom;
    this.streetViewControl = this._street_view_control;
    this.zoomControl = this._zoom_control;    

    this.propagate ('mapload');
  },
    
  /**
   * Returns true if the map is ready to use
   *
   * @name vs.ext.ui.GMap#isReady 
   * @function
   * @return Boolean 
   */
  isReady : function ()
  {
    return this.__init_finished;
  },
  
  /**
   * Returns a reference to the Google Maps object.
   * <p/>
   * This object uses the Google GMaps Javascript API V3.
   *
   * @name vs.ext.ui.GMap#getGoogleMapObject 
   * @function
   * @return GMap the google.maps.Map object
   */
  getGoogleMapObject : function ()
  {
    return this._gmap;
  },
  
  /**
   * Shows the center marker of the map
   *
   * @name vs.ext.ui.GMap#showCenterMark 
   * @function
   */
  showCenterMark : function ()
  {
    if (!this._center_mark)
    {
      this._center_mark = new google.maps.Marker({
        position: new google.maps.LatLng (this._center [0], this._center [1]),
        icon: "css/kit/mapCenter.png",
      });
    }
    
    this._center_mark.setMap (this._gmap);
  },

  /**
   * Hides the center marker of the map
   *
   * @name vs.ext.ui.GMap#hideCenterMark 
   * @function
   */
  hideCenterMark : function ()
  {
    if (!this._center_mark)
    { return; }
    
    this._center_mark.setMap (null);
  },

  /**
   * @protected
   * @function
   */
  refresh : function ()
  {
    if (!this._gmap) return;
    
    google.maps.event.trigger (this._gmap, "resize");
  },

/********************************************************************
                  Annotations management
********************************************************************/

  /**
   * Adds the specified annotation to the map view.
   *
   * @name vs.ext.ui.GMap#addAnnotation 
   * @function
   *
   * @param {string} id The identifier of the marker
   * @param {number} lat The latitude between -90 degrees and +90 degrees
   * @param {number} lon The longitude between -180 degrees and +180 degrees
   * @param {Object} info The information window data (should follow template spec)
   * @param {string} name A annotation type (a specific image can be assign to  
   *    type) [Optional]
   * @return {GMap.Annotation} the annotation id (need for removing it)
   */
  addAnnotation : function (id, lat, lon, info, type)
  {
    if (!this.__init_finished) { return; }
    
    if (!util.isString (id) || !id) id = core.createId ();
    
    var annotation = new GMap.Annotation (this, id, lat, lon, info, type);
    this.__annotations [id] = annotation;
    return annotation;
  },
  
  /**
   * Adds the specified annotation to the map view.
   *
   * @name vs.ext.ui.GMap#setAnnotationTemplate 
   * @function
   *
   * @param {string} name The name
   * @param {Object} marker The marker information
   * @param {string} infoWindow The info window HTML template
   */
  setAnnotationTemplate : function (name, marker, infoWindow)
  {
    if (!util.isString (name) && !name) return;
    
    var default_tmp = GMap._anotation_templates_ ['default'];
    
    GMap._anotation_templates_ [name] = {
      marker: util.clone ((marker)?marker:default_tmp.marker),
      infoWindow: util.clone ((infoWindow)?infoWindow:default_tmp.infoWindow)
    };
  },

  /**
   * Removes a specified annotation from the map view.
   *
   * @name vs.ext.ui.GMap#removeAnnotation
   * @function
   * @param {string/GMap.Annotation} id/annotation The identifier or the annotation
   */
  removeAnnotation : function (id)
  {
    if (!util.isString (id) && id.id) id = id.id;
    var annotation = this.__annotations [id];
    if (!annotation) return;
    
    util.free (annotation);
    delete (this.__annotations [id]);
  },

  /**
   * Removes all annotations from the map view.
   *
   * @name vs.ext.ui.GMap#removeAnnotations 
   * @function
   */
  removeAnnotations : function ()
  {
    for (var id in this.__annotations)
    {
      this.removeAnnotation (id);
    }
  },
  
/********************************************************************
                  Annotations management
********************************************************************/

  /**
   * @name vs.ext.ui.GMap#annotationSelect 
   * @function
   * @protected
   */
  annotationSelect : function (id)
  {
    this.propagate ('annotationselect', id);
  }
};
util.extendClass (GMap, vs.ui.View);

/********************************************************************
                  Define class properties
********************************************************************/

util.defineClassProperties (GMap, {

  'scroll': {
    /** 
     * Allow to scroll the map.
     * By default its set to true
     * @name vs.ext.ui.GMap#scroll 
     * @type {boolean}
     */ 
    set : function (v)
    {
      if (v)
      { this._scroll = true; }
      else
      { this._scroll = false; }
      
      if (!this.__init_finished) { return; }
      
      this._gmap.setOptions ({draggable: this._scroll});
    },
  
    /** 
     * @ignore
     * @type {boolean}
     */ 
    get : function ()
    {
      return this._scroll
    }
  },
  'tapToZoom': {
    /** 
     * Enabled/disabled to zoom after user tap.
     * By default its set to true
     * @name vs.ext.ui.GMap#tapToZoom 
     * @type {boolean}
     */ 
    set : function (v)
    {
      if (v)
      { this._tap_to_zoom = true; }
      else
      { this._tap_to_zoom = false; }
      
      if (!this.__init_finished) { return; }
      
      this._gmap.setOptions ({disableDoubleClickZoom: !this._tap_to_zoom});
    },
  
    /** 
     * @ignore
     * @type {boolean}
     */ 
    get : function ()
    {
      return this._tap_to_zoom
    }
  },
  'maxZoom': {
    /** 
     * Set the maximum authorized map's zoom
     *
     * @name vs.ext.ui.GMap#maxZoom 
     * @type {number}
     */ 
    set : function (v)
    {
      if (!vs.util.isNumber (v)) { return; }
      
      this._max_zoom = v;
      
      if (!this.__init_finished) { return; }
      
      this._gmap.setOptions ({maxZoom: this._max_zoom});
    },
  
    /** 
     * @ignore
     * @type {number}
     */ 
    get : function ()
    {
      return this._max_zoom;
    }
  },
  'minZoom': {
    /** 
     * Set the minimum authorized map's zoom
     *
     * @name vs.ext.ui.GMap#minZoom 
     * @type {number}
     */ 
    set : function (v)
    {
      if (!vs.util.isNumber (v)) { return; }
      
      this._min_zoom = v;
      
      if (!this.__init_finished) { return; }
      
      this._gmap.setOptions ({maxZoom: this._min_zoom});
    },
  
    /** 
     * @ignore
     * @type {number}
     */ 
    get : function ()
    {
      return this._min_zoom;
    }
  },
  'zoomControl': {
    /** 
     * Enabled/disabled the zoom controls.
     * By default its set to false
     * @name vs.ext.ui.GMap#zoomControl 
     * @type {boolean}
     */ 
    set : function (v)
    {
      if (v)
      { this._zoom_control = true; }
      else
      { this._zoom_control = false; }
      
      if (!this.__init_finished) { return; }
      
      this._gmap.setOptions ({zoomControl: this._zoom_control});
    },
  
    /** 
     * @ignore
     * @type {boolean}
     */ 
    get : function ()
    {
      return this._zoom_control
    }
  },
  'zoom': {
    /** 
     * Set the current map zoom
     *
     * @name vs.ext.ui.GMap#zoom 
     * @type {number}
     */ 
    set : function (v)
    {
     if (!vs.util.isNumber (v)) { return; }
      
      if (!this.__init_finished) { return; }
      
      v = Math.floor (v);
      if (v === this._zoom) { return; }
      
      this._zoom = v;
      
      this._gmap.setZoom (this._zoom);
    },
  
    /** 
     * @ignore
     * @type {number}
     */ 
    get : function ()
    {
      if (!this._gmap) { return -1; }
      
      this._zoom = this._gmap.getZoom ();
      return this._zoom
    }
  },
  'tilt': {
    /** 
     * Set the current map tilt
     *
     * @name vs.ext.ui.GMap#tilt 
     * @type {number}
     */ 
    set : function (v)
    {
     if (!vs.util.isNumber (v)) { return; }
      
      if (!this.__init_finished) { return; }
      
      this._tilt = v;
      
      this._gmap.setTilt (v);
    },
  
    /** 
     * @ignore
     * @type {number}
     */ 
    get : function ()
    {
      if (!this._gmap) { return -1; }
      
      this._tilt = this._gmap.getTilt ();
      return this._tilt;
    }
  },
  'streetViewControl': {
    /** 
     * Enabled/disabled the street view access controls.
     * By default its set to false
     * @name vs.ext.ui.GMap#streetViewControl 
     * @type {boolean}
     */ 
    set : function (v)
    {
      if (v)
      { this._street_view_control = true; }
      else
      { this._street_view_control = false; }
      
      if (!this.__init_finished) { return; }
      
      this._gmap.setOptions ({streetViewControl: this._street_view_control});
    },
  
    /** 
     * @ignore
     * @type {boolean}
     */ 
    get : function ()
    {
      return this._street_view_control
    }
  },
  'center': {
    /** 
     * Changes / access the center coordinate of the map
     *
     * Positions is a array of latitude and longitude in degrees.
     * @name vs.ext.ui.GMap#center 
     * @type {Array}
     */ 
    set : function (v)
    {
      if (!this.__init_finished) { return; }
      if (!v) { return; } 
      if (!vs.util.isArray (v) || v.length !== 2) { return; }
      if (!vs.util.isNumber (v[0]) || !vs.util.isNumber(v[1])) { return; }
      
      this._center [0] = v [0];
      this._center [1] = v [1];
      
      var latLng = new google.maps.LatLng (v [0], v [1]);
      this._gmap.setCenter (latLng);
      
      if (this._center_mark)
      {
        this._center_mark.setPosition (latLng);
      }
    },
    
    /** 
     * @ignore
     * @type {Array}
     */ 
    get : function ()
    {
      if (!this._gmap) { return [0, 0]; }
      
      var pos = this._gmap.getCenter();
  
      this._center [0] = pos.lat ();
      this._center [1] = pos.lng ();
      
      return this._center.slice ();
    }
  }
});

/**
 * @private
 */
var clear_view_style_nb_cur = 0;

/**
 * @private
 * @function
 */
var clear_view_style = function (map)
{
  map.__init_did_finish ();
}

/********************************************************************
                      Export
*********************************************************************/

/**
 *  The GMap.Annotation class
 *
 *  @extends vs.ui.View
 *  @class
 *  Creates a marker with the options specified. If a map is specified, the 
 *  marker is added to the map upon construction. Note that the position must be 
 *  set for the marker to display
 *
 * Events:
 *  <ul> mapload : fire when the map is loaded and ready to use.
 *  </ul>
 *  <p>
 *  @example
 *  
 * @author David Thevenin
 * @name vs.ext.ui.GMap.Annotation
 * @private
 *
 * @constructor
 *  Creates a new GMap.Annotation.
 *
 */
GMap.Annotation = function (map, id, lat, lon, info, type)
{
  this.map = map;
  this.id = id;
  this.info = info;
  this.type = (type)?type:'default';
  
  this._coordinate = new google.maps.LatLng (lat, lon);
  
  var template = GMap._anotation_templates_ [this.type];
  if (!template) template = GMap._anotation_templates_ ['default'];
  
  this.image = null;

  if (template.marker.type == GMap.DEVICE_IMAGE_MARKER)
  {
    var os_device = window.deviceConfiguration.os;
    if (os_device == vs.core.DeviceConfiguration.OS_SYMBIAN)
    {
      this.image = new google.maps.MarkerImage ('css/kit/symbian_marker.png',
        new google.maps.Size (48, 51),
        new google.maps.Point (0,0),
        new google.maps.Point (24, 48));
    }
    else if (os_device == vs.core.DeviceConfiguration.OS_WP7)
    {
      this.image = new google.maps.MarkerImage ('css/kit/wp7_marker.png',
        new google.maps.Size (15, 31),
        new google.maps.Point (0,0),
        new google.maps.Point (0, 31));
    }
    else
    {
      this.image = new google.maps.MarkerImage ('css/kit/ios_marker.png',
        new google.maps.Size (32, 41),
        new google.maps.Point (0,0),
        new google.maps.Point (8, 36));
    }
  }
  else if (template.marker.type == GMap.IMAGE_MARKER)
  {
    this.image = new google.maps.MarkerImage (template.marker.url);
  }
  
  if (this.image)
  {     
    this._gmarker = new google.maps.Marker({
      position: this._coordinate,
      icon: this.image,
      map: map._gmap,
      animation: google.maps.Animation.DROP
    });
  
    var self = this;
    google.maps.event.addListener (this._gmarker, 'click', function() {
      self.onselect ();
    });
  }
  else
  {
    this._infoWindow = new GMap.InfoWindow (this.map, id, lat, lon, type);
    this._infoWindow.setCoordinate (lat, lon);
    this._infoWindow.setInfo (info);
  }
}

GMap.Annotation.prototype = {
  
  /**
   * @ignore
   */
  destructor : function ()
  {
    if (this._gmarker)
    {
      this._gmarker.setMap (null);
      delete (this._gmarker);
    }
    if (this._infoWindow) free (this._infoWindow);
    if (this.image) delete (this.image);
    delete (this._coordinate);
    
    this.map = undefined;
  },

  /**
   *  on select management
   *  @ignore
   */
  onselect : function ()
  {
    this.showInfoWindow ();
  },
  
  /**
   *  Show the info Window
   *  @ignore
   */
  showInfoWindow : function ()
  {
    if (!this.map._infoWindow)
    {
      this.map._infoWindow = new GMap.InfoWindowWithMarker (this.map);
      this.map._infoWindow.setMarker (this);
    }
    else
    {
      this.map._infoWindow.setMarker (this);
    }
  }
}

/********************************************************************
                  Define class properties
********************************************************************/

util.defineClassProperties (GMap.Annotation, {

  'coordinate': {
    /** 
     * Sets/get the new center point of the annotation. [latitude, longitude]
     * @name vs.ext.ui.GMap.Annotation#coordinate 
     * @type {Array}
     */ 
    set : function (pos)
    {
      if (!util.isArray (pos) && pos.length != 2) return;
      
      delete (this._coordinate);
      this._coordinate = new google.maps.LatLng (pos[0], pos[1]);
      
      if (this._gmarker)
      {
        this._gmarker.setPosition (this._coordinate);
      }
    },
  
    /** 
     * @ignore
     * @type {Array}
     */ 
    get : function ()
    {
      return [this._coordinate.lat (), this._coordinate.lng ()]; 
    }
  },
  'info': {
    /** 
     * Set/returns annotation information
     * @type {Object}
     */ 
    set : function (v)
    {
      this._info = v;
      if (this._infoWindow) this._infoWindow.setInfo (v);
    },
  
    /** 
     * @ignore
     * @type {boolean}
     */ 
    get : function ()
    {
      return this._info
    }
  }
});


/**
 * @private
 */
function createInfoWindowClass ()
{
  /**
   *  The GMap.InfoWindow class
   *
   *  @extends vs.ui.View
   *  @class
   *  Creates an info window with the given options
   *
   * Events:
   *  <ul> mapload : fire when the map is loaded and ready to use.
   *  </ul>
   *  <p>
   *  @example
   *  
   * @author David Thevenin
   * @name GMap.InfoWindow
   *
   * @ignore
   * @constructor
   *  Creates a new GMap.InfoWindow.
   *
   */
  GMap.InfoWindow = function (map, id, type, lat, lon)
  {    
    this.vs_map = map;
    this.id = id;
    this.type = type;
    
    if (!map) return;
    this.setCoordinate (lat, lon);

    // Initialization
    this.setValues ({map: this.vs_map._gmap});
  };
  GMap.InfoWindow.prototype = new google.maps.OverlayView;
  
  /**
   * @ignore
   */
  GMap.InfoWindow.prototype.destructor = function ()
  {
    this.setMap (null);
    
    this.marker = undefined;
    this.vs_map = undefined;
  },
    
  /**
   * @ignore
   */
  GMap.InfoWindow.prototype.hide = function ()
  {
    if (!this.view) return;
 
    this.view.style.display = 'none';
  };
  
  /**
   * @ignore
   */
  GMap.InfoWindow.prototype.show = function ()
  {
    if (!this.view) return;
 
    this.view.style.display = 'block';
  };
  
  /**
   * @ignore
   */
  GMap.InfoWindow.prototype.setMarker = function (marker)
  {
    if (this.marker)
    {
      this.unbind ('position');
    }
    this.marker = marker;
    this.id = this.marker.id;
    this.type = this.marker.type;
    this.info = this.marker.info;
    this.bindTo ('position', this.marker._gmarker, 'position');
    
    this.instanciateView (this.type, this.info);
  };
  
  /**
   * @ignore
   */
  GMap.InfoWindow.prototype.setCoordinate = function (lat, lon)
  {
    if (this.position) delete (this.position);
    this.position = new google.maps.LatLng (lat, lon);
  };
  
  /**
   * @ignore
   */
  GMap.InfoWindow.prototype.setType = function (type)
  {
    this.type = type;
    this.instanciateView (this.type, this.info);
  };
  
  /**
   * @ignore
   */
  GMap.InfoWindow.prototype.setInfo = function (data)
  {
    this.info = data;
    this.instanciateView (this.type, this.info);
  };
    
  /**
   * @ignore
   */
  GMap.InfoWindow.prototype.instanciateView = function (type, info)
  {
    var div = document.createElement ('div');
    var template = GMap._anotation_templates_ [type];
    if (!template) template = GMap._anotation_templates_ ['default'];
    var text = template.infoWindow;
    
    if (info) for (key in info)
    {
      var value = info[key]; value = (value)?value:"";
      text = text.replace ('{' + key + '}', value);
    }
    util.safeInnerHTML (div, text);
    
    if (!this.view) this.createView ();
    
    util.safeInnerHTML (this.view, div.firstElementChild.innerHTML);
    this.view.className = div.firstElementChild.className;
  };
  
  /**
   * @ignore
   */
  GMap.InfoWindow.prototype.createView = function ()
  {
    if (this.view) return;
    
    this.view = document.createElement ('div');
 
    vs.addPointerListener (this.view, core.POINTER_START, this);
  };
  
  /**
   * @ignore
   */
  GMap.InfoWindow.prototype.handleEvent = function (e)
  {
    var self = this;
    
    switch (e.type)
    {
      case core.POINTER_START:
        // prevent multi touch events
        if (e.nbPointers > 1) { return; }
        
        vs.addPointerListener (document, core.POINTER_END, this);
        vs.addPointerListener (document, core.POINTER_MOVE, this);
        this.__start_x = e.pointerList[0].pageX;
        this.__start_y = e.pointerList[0].pageY;
        
        if (this.marker) this.removeMapEvent ();
        util.addClassName (this.view, "selected");
        return false;
      break;

      case core.POINTER_MOVE:

        var dx = e.pointerList[0].pageX - this.__start_x;
        var dy = e.pointerList[0].pageY - this.__start_y;
          
        if (Math.abs (dx) + Math.abs (dy) < 10)
        {
          // we keep the event
          e.preventDefault ();
          return false;
        }
 
        vs.removePointerListener (document, core.POINTER_END, this);
        vs.removePointerListener (document, core.POINTER_MOVE, this);
        if (this.marker) setTimeout (function () {self.initMapEvent ();}, 0);
        util.removeClassName (this.view, "selected");
 
        return false;
      break;

      case core.POINTER_END:

        // we keep the event
        e.stopPropagation ();
        e.preventDefault ();

        vs.removePointerListener (document, core.POINTER_END, this);
        vs.removePointerListener (document, core.POINTER_MOVE, this);
        if (this.marker) setTimeout (function () {self.initMapEvent ();}, 0);
        util.removeClassName (this.view, "selected");
        
        this.vs_map.annotationSelect (this.id);

        return false;
      break;
    }
  };

  /**
   * Implement this method to initialize the overlay DOM elements.
   * This method is called once after setMap() is called with a valid map.
   * @ignore
   */
  GMap.InfoWindow.prototype.onAdd = function ()
  {
    if (!this.view) this.createView ();
    
    var pane = this.getPanes().floatPane;
    pane.appendChild (this.view);
    
    // Ensures the label is redrawn if the text or position is changed.
    var self = this;
    this.listeners_ = [
    google.maps.event.addListener(this, 'position_changed',
      function() { self.draw(); }),
    ];
  };
  
  /**
   * Implement this method to remove your elements from the DOM. This method
   * is called once following a call to setMap(null)
   * @ignore
   */
  GMap.InfoWindow.prototype.onRemove = function ()
  {
    this.view.parentNode.removeChild(this.view);
    
    // Label is removed from the map, stop updating its position/text.
    for (var i = 0, I = this.listeners_.length; i < I; ++i) {
      google.maps.event.removeListener(this.listeners_[i]);
    }
  };
  
  /**
   * Implement this method to draw or update the overlay. 
   * @ignore
   */
  GMap.InfoWindow.prototype.draw = function ()
  {
    var projection = this.getProjection ();
    var position = projection.fromLatLngToDivPixel (this.get ('position'));
    
    var div = this.view;
    div.style.display = 'block';
    div.style.visibility = 'hidden';
    
    var icon_w = 0;
    if (this.marker)
    {
      icon_w = 10;
      var icon = this.marker._gmarker.getIcon ();
      if (icon) icon_w += icon.size.height;
    }

    // update position to correctly manage the info bubble size
    setTimeout (function ()
    {
      var width = div.offsetWidth;
      var height = div.offsetHeight;
      
      div.style.left = position.x - Math.ceil(width/2) + 'px';
      div.style.top = position.y - height - icon_w + 'px';
      div.style.visibility = 'visible';
    }, 0);
  };

  /**
   * @ignore
   */
  GMap.InfoWindow.prototype.initMapEvent = function ()
  {
    if (this.map_listener) return;

    var self = this;
    this.map_listener = google.maps.event.addListener
      (this.vs_map._gmap, 'click', function() {
        self.hide ();
      });
  };

  /**
   * @ignore
   */
  GMap.InfoWindow.prototype.removeMapEvent = function ()
  {
    if (!this.map_listener) return;
 
    google.maps.event.removeListener (this.map_listener);
    this.map_listener = undefined;
  };

  /**
   *  The GMap.InfoWindowWithMarker class
   *
   *  @extends vs.ui.View
   *  @class
   *  Creates an info window with the given options
   *
   * Events:
   *  <ul> mapload : fire when the map is loaded and ready to use.
   *  </ul>
   *  <p>
   *  @example
   *  
   * @author David Thevenin
   * @name GMap.InfoWindow
   *
   * @ignore
   * @constructor
   *  Creates a new GMap.InfoWindow.
   *
   */
  GMap.InfoWindowWithMarker = function (map)
  {    
    this.vs_map = map;

    // Initialization
    this.setValues ({map: this.vs_map._gmap});
    this.initMapEvent ();
  };
  util.extendClass (GMap.InfoWindowWithMarker, GMap.InfoWindow);
}
/********************************************************************
                      Export
*********************************************************************/
/** @private */
ext_ui.GMap = GMap;
/**
  Copyright (C) 2009-2012. David Thevenin, ViniSketch SARL (c), and 
  contributors. All rights reserved
  
  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU Lesser General Public License as published
  by the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.
  
  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  GNU Lesser General Public License for more details.
  
  You should have received a copy of the GNU Lesser General Public License
  along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

/**
 *  The vs.ext.ui.Carousel class
 *
 *  @extends vs.ui.View
 *  @class
 *  Carousel presents a slide carousel. This carousel can be controller
 *  by a swipe on the screen or through methods (goToNextView, ...)
 *  <p>
 *  Carousel is a vs.ui.View. You can set the view size, to defined the bound
 *  inside children's view will be draw. Children are fixed
 *  on top left of the carousel.
 *  <p>
 *  Although carousel views are displayed vertically by default, you can
 *  use the orientation property to have it display horizontally.
 *  <p>
 *  You can set a delegate to be informed when the view will change
 *  (after a swipe or a method call).
 *
 *  <p>
 *  Delegate should implement:
 *  <ul>
 *    <li/>carouselViewWillChange : function (view /*vs.ui.View /)
 *  </ul>
 *  <p>
 *  @example
 *  var carousel = new Carousel (config);
 *  // set child component view (you can add instantiated view or component name
 *  carousel.add (view1);
 *  carousel.add (view2);
 *  carousel.add (view3);
 *  carousel.add (view4);
 *  // change the orientation
 *  carousel.orientation = vs.fx.SlideController.VERTICAL
 *  // set a delegate
 *  var delegate = {};
 *  delegate.carouselViewWillChange = function (view) { ... };
 *  carousel.delegate = delegate;
 *  
 *  @author David Thevenin
 *  @name vs.ext.ui.Carousel
 *
 *  @constructor
 *   Creates a new Carousel.
 *
 *  @param {Object} config the configuration structure [mandatory]
 */
function Carousel (config)
{
  this.parent = vs.ui.View;
  this.parent (config);
  this.constructor = Carousel;
  
  this.__indicators_list = {};
}

/**
 * Horizontal carousel (defaut)
 * @name vs.ext.ui.Carousel.HORIZONTAL
 * @const
 */
Carousel.HORIZONTAL = vs.fx.SlideController.HORIZONTAL;

/**
 * Vertical carousel
 * @name vs.ext.ui.Carousel.VERTICAL
 * @const
 */
Carousel.VERTICAL = vs.fx.SlideController.VERTICAL;

Carousel.prototype = {

 /**********************************************************************
 
 *********************************************************************/

   /**
   * @protected
   * @type {boolean}
   */
  _indicators_visibility : true,
  
   /**
   * @protected
   * @type {Object}
   */
  _delegate: null,

  /**
   *
   * @protected
   * @type {number}
   */
  _orientation : Carousel.HORIZONTAL,

  /**
   * The vs.fx.SlideController that will manage the carousel slide
   * @private
   * @type {vs.fx.SlideController}
   */
  _slideController : null,
  
  /**
   * The indicators view
   * @private
   * @type {DivHtmlElement}
   */
  __indicators : null,
  
  /**
   * The selected indicator view
   * @private
   * @type {SpanHtmlElement}
   */
  __selected_indicator : null,
  
  /**
   * The list of indicators
   * @private
   * @type {Object.<string>}
   */
  __indicators_list : null,
  
  /**
   * Indicator change timer
   * @private
   * @type {number}
   */
  __indicators_timer : 0,  
  
 /**********************************************************************
                  In/Out properties declarations 
  *********************************************************************/


 /**********************************************************************
 
 *********************************************************************/
  
  /**
   * @protected
   */
  destructor : function ()
  {
    util.free (this._slideController);

    vs.ui.View.prototype.destructor.call (this);
  },
  
  /**
   * @protected
   * @function
   */
  initComponent : function ()
  {
    vs.ui.View.prototype.initComponent.call (this);
        
    this.__indicators =
      this.view.querySelector ('.vs_ext_ui_carousel >.indicators');
    vs.util.addClassName (this.__indicators, 'horizontal');

    this._slideController = new vs.fx.SlideController (this);
    this._slideController.delegate = this;
    this._slideController.isTactile = true;
    this._slideController.animationMode = vs.fx.SlideController.PIXEL;
    this._slideController.init ();
  },
  
  /**
   * @protected
   * @function
   */
  refresh : function ()
  {
    if (this._slideController && this._slideController.refresh)
    { this._slideController.refresh (); }

    vs.ui.View.prototype.refresh.call (this);
  },
  
 /**********************************************************************
 
 *********************************************************************/
 
  /**
   * @private
   * @function
   */
  controllerViewWillChange : function (from_comp, to_comp, controller)
  {
    if (this.__indicators_timer)
    {
      clearTimeout (this.__indicators_timer);
      __indicators_timer = 0;
    }
    
    var i_id = to_comp.id, self = this;
    this.__indicators_timer = setTimeout (function ()
    {
      if (self.__selected_indicator)
      {
        vs.util.removeClassName (self.__selected_indicator, 'selected');
      }
      self.__selected_indicator = self.__indicators_list [i_id];
      vs.util.addClassName (self.__selected_indicator, 'selected');
    }, 500);
    
    if (this._delegate && this._delegate.carouselViewWillChange)
    {
      this._delegate.carouselViewWillChange (to_comp);
    }
  },
   
   /**
   *  Add a child component to the carousel
   *  <p>
   *  The component can be a graphic component (vs.ui.View) or
   *  a non graphic component (vs.core.EventSource).
   *  In case of vs.ui.View its mandatory to set the extension.
   *  <p>
   *  @example
   *  var carousel = new Carousel (config);
   *  carousel.init ();
   *  // instanced component
   *  var comp = new AComponent (data);
   *  carousel.add (comp);
   *
   * @name vs.ext.ui.Carousel#add
   * @function
   * @param {vs.ui.View} child The component to add.
   */
  add : function (child)
  {
    vs.ui.View.prototype.add.call (this, child, 'children');
    this.push (child)
  },

   /**
   *  Add a child component to the carousel
   *  <p>
   *  The component must be a graphic component (vs.ui.View).
   *  It will be instantiated, init and added automaticaly
   *  <p>
   *  @example
   *  var carousel = new Carousel (config);
   *  carousel.init ();
   *  myController.push ('AComponent1', data1);
   *  myController.push ('AComponent1', data2);
   *  myController.push ('AComponent2', data3);
   *
   * @name vs.ext.ui.Carousel#push
   * @function
   * @param {vs.ui.View | String} comp The GUI component or the component
   *     name to instanciate   
   * @param {Object} config Configuration structure need to build the 
   *     component.
   */
  push : function (child, config)
  {
    // Test if the component is already added
    if (this.isChild (child))
    {
      if (this._slideController.isStateExit (child.id))
      { return; }
    }
    
    var span, state_id = this._slideController.push (child, config);
    
    span = document.createElement ('span');
    
    this.__indicators.appendChild (span);
    this.__indicators_list [state_id] = span;
  },

  /**
   *  Remove the specified child component from this component.
   * 
   *  @example
   *  myObject.remove (myButton);
   *
   * @name vs.ext.ui.Carousel#remove
   * @function
   * @param {vs.core.EventSource} child The component to be removed.
   */
  remove : function (child)
  {
    if (!child || !child.id)
    { return; }
    
    var span = this.__indicators_list [child.id];
    
    this.__indicators.removeChild (span);
    delete (this.__indicators_list [child.id]);

    vs.ui.View.prototype.remove.call (this, child);
  },

  /**
   * Remove all panels
   * @name vs.ext.ui.Carousel#removeAllChildren
   * @function
   */
  removeAllChildren : function ()
  {
    for (var id in this.__indicators_list)
    {
      var comp = vs.core.Object._obs [id];
      this.remove (comp);
    }
  },

 /**********************************************************************
 
 *********************************************************************/
 
  /**
   * Go to the next view
   * @name vs.ext.ui.Carousel#goToNextView
   * @function
   */
  goToNextView : function ()
  {
    this._slideController.goToNextView ();
  },
 
  /**
   * Go to the previous view
   * @name vs.ext.ui.Carousel#goToPreviousView
   * @function
   */
  goToPreviousView : function ()
  {
    this._slideController.goToPreviousView ();
  },

  /**
   *  Go to the view specified by its id
   *
   * @name vs.ext.ui.Carousel#goToView
   * @param {string} id The component id
   * @function
   */
  goToView : function (id)
  {
    this._slideController.goToViewId (id);
  },

  /**
   *  Go to the view specified by its position (index start at 0)
   *
   * @name vs.ext.ui.Carousel#goToViewAt
   * @param {number} index The component index
   * @function
   */
  goToViewAt : function (index)
  {
    this._slideController.goToViewAt (index);
  }
};
util.extendClass (Carousel, vs.ui.View);

/********************************************************************
                  Define class properties
********************************************************************/

util.defineClassProperties (Carousel, {

  'size': {
    /** 
     * Getter|Setter for size. Gives access to the size of the GUI Object
     * @name vs.ext.ui.Carousel#size 
     * @function.
     * @type {Array.<number>}
     */ 
    set : function (v)
    {
      if (!v) { return; } 
      if (!util.isArray (v) || v.length !== 2) { return; }
      if (!util.isNumber (v[0]) || !util.isNumber(v[1])) { return; }
      
      this._size [0] = v [0];
      this._size [1] = v [1];
      
      if (!this.view) { return; }
      this._updateSize ();
  
      if (this._slideController && this._slideController.refresh)
      { this._slideController.refresh (); }
    },
    
    /**
     * @type {Array.<number>}
     * @ignore
     */
    get : function ()
    {
      var view = this.view;
       if (view && view.parentNode)
      {
        this._size [0] = view.offsetWidth;
        this._size [1] = view.offsetHeight;
      }
      return this._size.slice ();
    }
  },
  'delegate': {

    /** 
     * Set the delegate.
     * It should implements following methods
     *  <ul>
     *    <li/>carouselViewWillChange : function (view /* vs.ui.View /)
     *  </ul>
     * @name vs.ext.ui.Carousel#delegate 
     * @type Object
     */ 
    set : function (v)
    {
      this._delegate = v;
    }
  },
  'indicatorsVisibility': {

    /** 
     * Set indicators visible or not
     * <p>
     * By default its set to true
     * @name vs.ext.ui.Carousel#indicatorsVisibility 
     * @type boolean
     */ 
    set : function (v)
    { 
      if (v)
      {
        this._indicators_visibility = true;
        __setVisible (this.__indicators, true);
      }
      else
      {
        this._indicators_visibility = false
        __setVisible (this.__indicators, false);
      }
    }
  },
  'orientation': {

    /** 
     * Getter|Setter for the tab bar style
     * @name vs.ext.ui.Carousel#orientation 
     * @type String
     */ 
    set : function (v)
    {
      if (v !== Carousel.HORIZONTAL &&
          v !== Carousel.VERTICAL) { return; }
      
      if (this._orientation === v) { return; }
      if (v === Carousel.HORIZONTAL)
      {
        vs.util.removeClassName (this.__indicators, 'vertical');
        vs.util.addClassName (this.__indicators, 'horizontal');
      }
      else
      {
        vs.util.removeClassName (this.__indicators, 'horizontal');
        vs.util.addClassName (this.__indicators, 'vertical');
      }
      this._orientation = v;
      this._slideController.orientation = v;
    },
  
    /** 
     * @return {String}
     * @ignore
     */ 
    get : function ()
    {
      return this._orientation;
      }
    }
  }
);

/********************************************************************
                      Export
*********************************************************************/
/** @private */
ext_ui.Carousel = Carousel;
/**
  Copyright (C) 2009-2012. David Thevenin, ViniSketch SARL (c), and 
  contributors. All rights reserved
  
  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU Lesser General Public License as published
  by the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.
  
  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  GNU Lesser General Public License for more details.
  
  You should have received a copy of the GNU Lesser General Public License
  along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

/**
 *  The vs.ext.ui.Accordion class
 *
 *  @extends vs.ui.View
 *  @class
 *  The Accordion class is a subclass of View that allows you to show
 *  a set of panels which can be collapsed or expanded.
 *  <p/>
 *  Events:
 *  <ul>
 *    <li /> panel_select: Fired after a panel is expanded. Data = index
 *           of the panel (zero-indexed number)
 *  </ul>
 *  <p>
 *  @example
 *  var config = {};
 *  var config.id = vs.core.createId ();
 *
 *  var accordion = new vs.ext.ui.Accordion ();
 *  accordion.init ();
 *  accordion.size = [300, 500];
 *  
 *  accordion.add (obj1);
 *  accordion.add (tabList3);
 *  accordion.add (vv);
 *
 *  @author David Thevenin
 *
 * @name vs.ext.ui.Accordion 
 *  @constructor
 *   Creates a new vs.ext.ui.Accordion.
 *
 * @param  {Object} config The configuration structure [mandatory]
*/
var Accordion = function (config)
{
  this.parent = ui.View;
  this.parent (config);
  this.constructor = Accordion;
  
  this.__ab_a_items = [];
}

/** 
 * Widgets keep there size and position
 * @see vs.ext.ui.Accordion#stretch 
 * @name vs.ext.ui.Accordion.STRETCH_NONE 
 * @const
 */
Accordion.STRETCH_NONE = 0;

/** 
 * Widgets size fit the panel view size
 * @see vs.ext.ui.Accordion#stretch 
 * @name vs.ext.ui.Accordion.STRETCH_FILL 
 * @const
 */
Accordion.STRETCH_FILL = 1;


Accordion.prototype = {
  
  /*****************************************************************
   *               private/protected members
   ****************************************************************/

  /**
   * @protected
   */
  _stretch: Accordion.STRETCH_NONE,
  
  /**
   * @private
   */
  __ab_a_items: undefined,
  
  /**
   * @private
   */
  __ab_a_current_index: undefined,
    
  /**
   * @private
   */
  __ab_a_head_height: 33,
    
  /*****************************************************************
   *                 
   ****************************************************************/
  
  /**
   *  Add the child component to the accordion and set the panel title.
   *  <p>
   *  Call push is similar to call add followed by setPanelTitle.
   *  <p>
   *
   * @name vs.ext.ui.Accordion#push 
   * @function
   * @param {vs.ui.View} child The component to be added.
   * @param {String} title the new panel title
   */
  push : function (child, title)
  {
    if (!child) { return; }
    this.add (child);
    var index = this._getIndexForChild (child)
    this.setPanelTitle (index, title);
  },
  
  /**
   *  Add the specified child component to this component.
   *  <p>
   *  The add is a lazy add! The child's view can be already in
   *  the HTML DOM. In that case, the add methode do not modify the DOM.
   *  <p>
   *
   * @name vs.ext.ui.Accordion#add
   * @function
   * @param  {vs.ui.View} child The component to be added.
   */
  add : function (child)
  {
    if (!child) { return; }
    var view, index, result;
    
    if (!child.id) { child.id = vs.core.createId (); }
    
    index = this.__ab_a_items.length;
    
    result = this._createView (child, 'Section ' + (index + 1), index);
    this.view.appendChild (result.dt);
    ui.View.prototype.add.call (this, child, 'children', result.dd);
    
    this.__ab_a_items.push (result);
    this._updateSizePanel ();
  },
  
  /**
   *  Remove the specified child component from this component.
   * 
   *  @example
   *  myObject.remove (myButton);
   *
   * @name vs.ext.ui.Accordion#remove 
   * @function
   * @param  {vs.core.EventSource} child The component to be removed.
   */
  remove : function (child)
  {
    var index = this._getIndexForChild (child), panel;
    if (index === -1)
    { return; }
    
    ui.View.prototype.remove.call (this, child);
    panel = this.__ab_a_items [index];
    panel.dd.removeChild (child.view);
    this.view.removeChild (panel.dt);
    vs.removePointerListener (panel.dt, core.POINTER_START, this);
    delete (panel.dt);
    delete (panel.dd);
    delete (panel);
    
    this.__ab_a_items.remove (index);

    if (index === this.__ab_a_current_index)
    // Show the first panel
    {
      this.__ab_a_current_index = null;
      this.expandPanel (0);
    }
    else
    // update widget size (and children) to fit with the new available space
    { this._updateSizePanel (); }
  },
  
  /**
   * @private
   */
  _getIndexForChild : function (child)
  {
    if (!child) { return -1; }
    
    var index, panel;
    
    for (index = 0; index < this.__ab_a_items.length; index++)
    {
      panel = this.__ab_a_items [index];
      if (!panel || !panel.dd)
      { continue; }
      if (panel.dd.__child === child)
      { return index; }
    }
    return -1;
  },
  
  /**
   * @private
   */
  _createView : function (child, title, index)
  {
    var panel = {}, mode;
    
    panel.dt = document.createElement ('dt');
    util.setElementInnerText (panel.dt, title);
    panel.title = title;

    panel.dd = document.createElement ('dd');      
    if (this._stretch === Accordion.STRETCH_FILL)
    {
      child.position = [0, 0];
    }
    panel.dd.appendChild (child.view);
    
    mode = (index)?'collapsed':'expanded'

    panel.dd.setAttribute ("class", mode);
    panel.dt.setAttribute ("class", mode);
    panel.dd.__child = child
    panel.child = child;

    if (mode === 'collapsed')
    {
      panel.dd.style.width = '100%';
      panel.dd.style.height = '0px';
    }
    else
    {
      panel.dd.style.width = '100%';
      panel.dd.style.height = child._size [1] + 'px';
      this.__ab_a_current_index = index;
    }
        
    if (this._stretch === Accordion.STRETCH_FILL)
    {
      child.size = [this._size[0] - 2, this._size[1]];
    }
    panel.dt.__dd = panel.dd;
    panel.dt.__index = index;
    vs.addPointerListener (panel.dt, core.POINTER_START, this);
    return panel;
  },
  
  /**
   *  Expand a part of the accordion.
   *  <p>
   *  The index can be zero-indexed number to match the position or the title of 
   *  the panel you want to open.
   *  <p>
   *  @example
   *  var accordion = new vs.ext.ui.Accordion (conf);
   *  ....
   *  accordion.expandPanel (2);
   *  accordion.expandPanel ('Section 2');
   *
   * @name vs.ext.ui.Accordion#expandPanel 
   * @function
   * @param  {number | String} index position or title of the panel to open
   */
  expandPanel: function (index)
  {
    var panel, i;
    
    if (util.isNumber (index) && index >= 0 && 
        index < this.__ab_a_items.length)
    {
      if (index === this.__ab_a_current_index)
      {
        return;
      }
      
      panel = this.__ab_a_items [this.__ab_a_current_index];
      if (panel)
      {
        util.removeClassName (panel.dt, 'expanded');
        util.addClassName (panel.dt, 'collapsed');
        util.removeClassName (panel.dd, 'expanded');
        util.addClassName (panel.dd, 'collapsed');
        panel.dd.style.height = '0px';
      }
  
      panel = this.__ab_a_items [index];
      util.removeClassName (panel.dt, 'collapsed');
      util.addClassName (panel.dt, 'expanded');
      util.removeClassName (panel.dd, 'collapsed');
      util.addClassName (panel.dd, 'expanded');
  
      this.__ab_a_current_index = index;
      this._updateSizePanel ();
      this.propagate ('panel_select', index);
      return;
    }
    if (util.isString (index))
    {
      for (i = 0; i < this.__ab_a_items.length; i++)
      {
        panel = this.__ab_a_items [i];
        if (panel.title === index)
        {
          this.expandPanel (i);
          return;
        }
      }
    }
  },
  
  /**
   *  Set a title for a give panel
   *  <p>
   *  The index can be zero-indexed number to match the position or the title of 
   *  the panel you want to open.
   *  <p>
   *  @example
   *  var accordion = new vs.ext.ui.Accordion (conf);
   *  ....
   *  accordion.setPanelTitle (2, 'info 2');
   *  accordion.setPanelTitle ('Section 1', 'info 1');
   *
   * @name vs.ext.ui.Accordion#setPanelTitle 
   * @function
   * @param  {number | String} index position or title of the panel to open
   * @param  {String} title the new panel title
   */
  setPanelTitle: function (index, title)
  {
    var panel, i;
    
    if (util.isNumber (index) && index >= 0 && 
        index < this.__ab_a_items.length)
    {
      panel = this.__ab_a_items [index];
      panel.title = title;
      util.setElementInnerText (panel.dt, title);
      
      return;
    }
    if (util.isString (index))
    {
      for (i = 0; i < this.__ab_a_items.length; i++)
      {
        panel = this.__ab_a_items [i];
        if (panel.title === index)
        {
          this.setPanelTitle (i, title);
          return;
        }
      }
    }
  },
  
  /********************************************************************
                    GUI Utilities
  ********************************************************************/

  /**
   * @ignore
   */
  show: function ()
  {
    vs.ui.View.prototype.show.call (this);
    
    this._updateSizePanel ();
  },
  
  /**
   * @ignore
   */
  refresh: function ()
  {
    vs.ui.View.prototype.refresh.call (this);
    
    this._updateSizePanel ();
  },
  
  /**
   * @private
   */
  _updateSize: function ()
  {
    vs.ui.View.prototype._updateSize.call (this);
    
    this._updateSizePanel ();
  },
  
  /**
   * @private
   */
  _updateSizePanel: function ()
  {
    var height, panel, i;
    panel = this.__ab_a_items [this.__ab_a_current_index];
    if (panel)
    {
      height = this._size [1];
      this.__ab_a_head_height = panel.dt.offsetHeight;
      height -= this.__ab_a_items.length * this.__ab_a_head_height + 2;
      panel.dd.style.height = height + 'px';
      if (this._stretch === Accordion.STRETCH_FILL)
      {
        panel.child.size = [this._size[0] - 2, height];
      }
    }
  },
  
  /*****************************************************************
   *               Events management
   ****************************************************************/

  /**
   * @private
   */
  handleEvent : function (e)
  {
    var elem = e.target, self = this, pageY, pageX, delta;
    
    if (elem.nodeType !== 1)
    {
      elem = elem.parentElement;
    }
    if (e.type === core.POINTER_START)
    {
      // prevent multi touch events
      if (e.nbPointers > 1) { return; }
      
      e.stopPropagation ();
      e.preventDefault ();
      
      if (util.hasClassName (elem, 'expanded'))
      { return false; }

      vs.addPointerListener (document, core.POINTER_MOVE, this, false);
      vs.addPointerListener (document, core.POINTER_END, this, false);
      
      this.__touch_start_x = e.pointerList[0].pageX;
      this.__touch_start_y = e.pointerList[0].pageY;

      this.__elem = elem;

      if (this.__elem_to_unselect)
      {
        util.removeClassName (this.__elem_to_unselect, 'selected');
        this.__elem_to_unselect = null;
      }
      this.__list_time_out = setTimeout (function ()
      {
        util.addClassName (self.__elem, 'selected');
        self.__list_time_out = 0;
      }, 0); //ui.View.SELECT_DELAY);
    }
    else if (e.type === core.POINTER_MOVE)
    {
      e.stopPropagation ();
      e.preventDefault ();

      pageX = e.pointerList[0].pageX;
      pageY = e.pointerList[0].pageY;
      delta = 
        Math.abs (pageY - this.__touch_start_y) + 
        Math.abs (pageX - this.__touch_start_x);  
                
      // this is a move, not a selection => deactivate the selected element
      // if needs
      if (this.__elem && (delta > ui.View.MOVE_THRESHOLD * 2))
      {
        if (this.__list_time_out)
        {
          clearTimeout (this.__list_time_out);
          this.__list_time_out = 0;
        }
        else
        {
          util.removeClassName (this.__elem, 'selected');
        }
        this.__elem = null;
      }            
    }
    else if (e.type === core.POINTER_END)
    {
      e.stopPropagation ();
      e.preventDefault ();

      // Stop tracking when the last finger is removed from this element
      vs.removePointerListener (document, core.POINTER_MOVE, this);
      vs.removePointerListener (document, core.POINTER_END, this);
                  
      // a item is selected. propagate the change
      if (this.__elem)
      {
        if (this.__list_time_out)
        {
          clearTimeout (this.__list_time_out);

          util.addClassName (self.__elem, 'selected');
        }

        this.__elem_to_unselect = this.__elem;
        this.__list_time_out = setTimeout (function ()
        {
          util.removeClassName (self.__elem_to_unselect, 'selected');
          self.__elem_to_unselect = null;
          self.__list_time_out = 0;
        }, ui.View.UNSELECT_DELAY);
        
        if (util.isNumber (elem.__index))
        {
          this.expandPanel (elem.__index);
        }
      }

      this.__elem = null;
    }
          
    return false;
  }
}
util.extendClass (Accordion, vs.ui.View);

util.defineClassProperty (Accordion, 'stretch',
{
  /**
   * Configure widgets to fit the view or to keep its original size.
   * <p>The property can take four values : 
   * <ul>
   *   <li/>vs.ext.ui.Accordion.STRETCH_NONE;
   *   <li/>vs.ext.ui.Accordion.STRETCH_FILL;
   * </ul>
   * @name vs.ext.ui.Accordion#stretch 
   * @type {number}
   */
  set : function (v)
  {
    if (!util.isNumber (v)) { return; }
    if (v !== Accordion.STRETCH_FILL &&
        v !== Accordion.STRETCH_NONE)
    { return; }
    
    this._stretch = v;
    
    if (this._stretch === Accordion.STRETCH_FILL)
    {
      util.addClassName (this.view, 'fill');
    }
    else
    {
      util.removeClassName (this.view, 'fill');
    }
    this._updateSizePanel ();
  },

  /*****************************************************************
   *
   ****************************************************************/

  /**
   * Get the image stretch mode (vs.ext.ui.Accordion.STRETCH_FILL or 
   * vs.ext.ui.Accordion.STRETCH_NONE)
   * @return {number}
   */
  get : function ()
  {
    return this._stretch;
  }
});

/********************************************************************
                      Export
*********************************************************************/
/** @private */
ext_ui.Accordion = Accordion;


GMap.prototype.html_template = "\
<div class='vs_ext_ui_gmap'></div>\
";

Carousel.prototype.html_template = "\
<div class='vs_ext_ui_carousel' x-hag-hole='children'>\
  <div class='indicators'></div>\
</div>\
";

Accordion.prototype.html_template = "\
<dl class='vs_ext_ui_accordion' x-hag-hole='children'></dl>\
";

})(window);