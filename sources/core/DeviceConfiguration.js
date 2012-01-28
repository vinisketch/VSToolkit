/*
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
 * This represents the mobile device, and provides properties for inspecting
 * the model, version, UUID of the
 * phone, etc.
 * @constructor
 */
 
/**
 *  @class
 *  An vs.core.DeviceConfiguration object, ...
 *
 *  @author David Thevenin
 *
 *  @constructor
 *  Main constructor
 *
 *  @name vs.core.DeviceConfiguration
 */
function DeviceConfiguration ()
{
  this.orientation = null;
  this.deviceId = null;
  this.targets = {};
  
  this.os = DeviceConfiguration.OS_UNKNOWN;
  this.screenResolution = DeviceConfiguration.SR_UNKNOWN;
  this.screenRatio = 0;
}

/**
 * @name vs.core.DeviceConfiguration.OS_UNKNOWN 
 * @const
 */
DeviceConfiguration.OS_UNKNOWN = 0;

/**
 * @name vs.core.DeviceConfiguration.OS_WINDOWS 
 * @const
 */
DeviceConfiguration.OS_WINDOWS = 1;

/**
 * @name vs.core.DeviceConfiguration.OS_MACOS 
 * @const
 */
DeviceConfiguration.OS_MACOS = 2;

/**
 * @name vs.core.DeviceConfiguration.OS_LINUX 
 * @const
 */
DeviceConfiguration.OS_LINUX = 4;

/**
 * @name vs.core.DeviceConfiguration.OS_IOS 
 * @const
 */
DeviceConfiguration.OS_IOS = 5;

/**
 * @name vs.core.DeviceConfiguration.OS_WP7 
 * @const
 */
DeviceConfiguration.OS_WP7 = 6;

/**
 * @name vs.core.DeviceConfiguration.OS_BLACK_BERRY 
 * @const
 */
DeviceConfiguration.OS_BLACK_BERRY = 7;

/**
 * @name vs.core.DeviceConfiguration.OS_SYMBIAN 
 * @const
 */
DeviceConfiguration.OS_SYMBIAN = 8;

/**
 * @name vs.core.DeviceConfiguration.OS_ANDROID 
 * @const
 */
DeviceConfiguration.OS_ANDROID = 9;

/**
 * @name vs.core.DeviceConfiguration.OS_MEEGO 
 * @const
 */
DeviceConfiguration.OS_MEEGO = 10;



/**
 * @name vs.core.DeviceConfiguration.SR_UNKNOWN 
 * @const
 */
DeviceConfiguration.SR_UNKNOWN = 0;

/**
 * @name vs.core.DeviceConfiguration.SR_QVGA 
 * QVGA (320×240) 
 * @const
 */
DeviceConfiguration.SR_QVGA = 1;

/**
 * @name vs.core.DeviceConfiguration.SR_WQVGA 
 * QVGA (400×240) 
 * @const
 */
DeviceConfiguration.SR_WQVGA = 2;

/**
 * @name vs.core.DeviceConfiguration.SR_HVGA 
 * HVGA (480×320) 
 * @const
 */
DeviceConfiguration.SR_HVGA = 4;

/**
 * @name vs.core.DeviceConfiguration.SR_VGA 
 * VGA (640×480) 
 * @const
 */
DeviceConfiguration.SR_VGA = 5;

/**
 * @name vs.core.DeviceConfiguration.SR_WVGA 
 * WVGA (800×480) 
 * @const
 */
DeviceConfiguration.SR_WVGA = 6;

/**
 * @name vs.core.DeviceConfiguration.SR_FWVGA 
 * FWVGA (854×480) 
 * @const
 */
DeviceConfiguration.SR_FWVGA = 7;

/**
 * @name vs.core.DeviceConfiguration.SR_SVGA 
 * SVGA (800×600)
 * @const
 */
DeviceConfiguration.SR_SVGA = 8;

/**
 * @name vs.core.DeviceConfiguration.SR_XGA 
 * XGA (1024×768)
 * @const
 */
DeviceConfiguration.SR_XGA = 9;

/**
 * @name vs.core.DeviceConfiguration.SR_N_HD 
 * nHD (640×360)
 * @const
 */
DeviceConfiguration.SR_N_HD = 10;

/**
 * @name vs.core.DeviceConfiguration.SR_Q_HD 
 * qHD (960×540)
 * @const
 */
DeviceConfiguration.SR_Q_HD = 11;

/**
 * @name vs.core.DeviceConfiguration.SR_WXGA 
 * WXGA (1280×720/768/800)
 * @const
 */
DeviceConfiguration.SR_WXGA = 12;


DeviceConfiguration.prototype = {
  
  /**
   * Returns the current GUI orientation.
   * <p/>
   * Be careful this API does not return the device orientation, which can be
   * deferent from the GUI orientation.
   * <p/>
   * Use the orientation module to have access to the device orientation.
   *
   * @name vs.core.DeviceConfiguration#getOrientation 
   * @function
   * 
   * @return {integer} returns a integer include in [-90, 0, 90, 180];
   * @public
   */
  getOrientation : function ()
  {
    return this.orientation;
  },
  
  /**
   * @protected
   * @function
   */
  setDeviceId : function (did)
  {
    if (!util.isString (did)) return; 
    
    this.deviceId = did;
    
    if (did.indexOf ("wp7") != -1)
    {
      this.os = DeviceConfiguration.OS_WP7;
      this.screenResolution = DeviceConfiguration.SR_WVGA;
      this.screenRatio = 16/10;
    }
    else if (did.indexOf ("iphone") != -1)
    {
      this.os = DeviceConfiguration.OS_IOS;
      this.screenResolution = DeviceConfiguration.SR_HVGA;
      this.screenRatio = 3/2;
    }
    else if (did.indexOf ("ipad") != -1)
    {
      this.os = DeviceConfiguration.OS_IOS;
      this.screenResolution = DeviceConfiguration.SR_XGA;
      this.screenRatio = 4/3;
    }
    else if (did.indexOf ("nokia_s3") != -1)
    {
      this.os = DeviceConfiguration.OS_SYMBIAN;
      this.screenResolution = DeviceConfiguration.SR_N_HD;
      this.screenRatio = 4/3;
    }
    else if (did.indexOf ("android") != -1)
    {
      this.os = DeviceConfiguration.OS_ANDROID;
      if (did.indexOf ("_3_2") != -1) { this.screenRatio = 3/2; }
      else if (did.indexOf ("_16_10") != -1) { this.screenRatio = 16/10; }
      else if (did.indexOf ("_16_9") != -1) { this.screenRatio = 16/9; }

      var width = window.screen.width;
      var height = window.screen.height;
      if (width > height)
      {
        width = window.screen.height;
        height = window.screen.width;
      }
      
      this.screenResolution =
        DeviceConfiguration._getScreenResolutionCode (width, height);
    }
    else if (did.indexOf ("blackberry") != -1)
    {
      this.os = DeviceConfiguration.OS_BLACK_BERRY;
      if (did.indexOf("_4_3")) { this.screenRatio = 4/3; }
      else if (did.indexOf("_3_2")) { this.screenRatio = 3/2; }
      else if (did.indexOf("_16_10")) { this.screenRatio = 16/10; }
      
      var width = window.screen.width;
      var height = window.screen.height;
      
      this.screenResolution =
        DeviceConfiguration._getScreenResolutionCode (width, height);
    }
  },
  
  /**
   * Set the GUI orientation
   *
   * @name vs.ui.Application#setOrientation 
   * @function
   * @protected
   * @param {number} orientation number include in {0, 180, -90, 90}
   */
  setOrientation : function (orientation, force)
  {
    var pid, device, i, len, id, comp, 
      width = window.innerWidth, height = window.innerHeight, t;
    
    if (this.orientation === orientation)
    { return; }
    
    if (width > height)
    {
      t = height;
      height = width;
      width = t;
    }
  
    for (id in core.Object._obs)
    {
      comp = core.Object._obs [id];
      if (!comp) { continue; }
      
      if (comp._orientationWillChange)
      { comp._orientationWillChange (orientation); }
      if (comp.orientationWillChange)
      { comp.orientationWillChange (orientation); }
    }
    
    for (pid in this.targets)
    {
      device = this.targets [pid];
      if (device.device !== this.deviceId) { continue; }
          
      // verify orientation matching with target id
      if (((orientation !== 0 && orientation !== 180) || 
            pid.indexOf ('_p') === -1) &&
          ((orientation !== 90 && orientation !== -90) || 
            pid.indexOf ('_l') === -1)) continue;
  
      this.setActiveStyleSheet (pid);
      
      this.orientation = orientation;
      
      /**
       * @private
       */
      var orientationDidChangeFct = function ()
      {
        var id, comp;
        for (id in core.Object._obs)
        {
          comp = core.Object._obs [id];
          if (!comp || !comp.orientationDidChange) { continue; }
          
          comp.orientationDidChange (orientation);
        }
      }
      if (!force)
      {
        setTimeout (orientationDidChangeFct, 100);
      }
      else
      {
        orientationDidChangeFct.call (this);
      }
      
      return pid;
    }
  },
    
  /**
   * @protected
   * @function
   */
  setActiveStyleSheet : function (pid)
  {
    util.setActiveStyleSheet (pid);
    window._current_platform_id = pid;
  },
    
  /**
   * @protected
   * @function
   */
  registerTargetId : function (tid, conf)
  {
    this.targets [tid] = conf;
  }
};

/**
 * private
 */
DeviceConfiguration._getScreenResolutionCode = function (width, height)
{
  if (width === 240 && height === 320) return DeviceConfiguration.SR_QVGA;
  if (width === 240 && height === 400) return DeviceConfiguration.SR_WQVGA;
  if (width === 320 && height === 480) return DeviceConfiguration.SR_HVGA;
  if (width === 480 && height === 640) return DeviceConfiguration.SR_VGA;
  if (width === 480 && height === 800) return DeviceConfiguration.SR_WVGA;
  if (width === 320 && height === 854) return DeviceConfiguration.SR_WFVGA;
  if (width === 600 && height === 800) return DeviceConfiguration.SR_SVGA;
  if (width === 768 && height === 1024) return DeviceConfiguration.SR_XGA;
  if (width === 360 && height === 640) return DeviceConfiguration.SR_N_HD;
  if (width === 540 && height === 960) return DeviceConfiguration.SR_Q_HD;
  if (width === 800 && height === 1280) return DeviceConfiguration.SR_WXGA;
}

/**
 * private
 */
DeviceConfiguration._estimateScreenSize = function (metric)
{
  var w = metric.width / metric.xdpi;
  var h = metric.height / metric.ydpi;
  var size = Math.sqrt (w*w + h*h);
  
  if (size < 5) return 3;
  if (size < 8) return 7;
  else return 10;
};

if (typeof window.deviceConfiguration == 'undefined')
{
  window.deviceConfiguration = new DeviceConfiguration ();
}

/********************************************************************
                      Export
*********************************************************************/
/** @private */
core.DeviceConfiguration = DeviceConfiguration;
