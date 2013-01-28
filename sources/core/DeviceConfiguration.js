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
 *  @class An vs.core.DeviceConfiguration object describes the device's hardware
 *  and software.
 *  <br /><br />
 *  A global object is visible in the window global scope: 
 *  window.deviceConfiguration.
 *
 *  
 *  @example
 *  var conf = window.deviceConfiguration;
 *  console.log ("OS: " + conf.os);
 *  console.log ("Screen size: " + conf.screenResolution);
 *  console.log ("Screen ratio: " + conf.screenRatio);
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
  
  this.browserDetect ();

  if (window.orientation) this.orientation = window.orientation;
  else if (window.outerWidth > window.outerHeight) this.orientation = 90;
  else this.orientation = 0;
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
 * @const
 * QVGA (320×240) 
 */
DeviceConfiguration.SR_QVGA = 1;

/**
 * @name vs.core.DeviceConfiguration.SR_WQVGA 
 * @const
 * QVGA (400×240) 
 */
DeviceConfiguration.SR_WQVGA = 2;

/**
 * @name vs.core.DeviceConfiguration.SR_HVGA 
 * @const
 * HVGA (480×320) 
 */
DeviceConfiguration.SR_HVGA = 4;

/**
 * @name vs.core.DeviceConfiguration.SR_VGA 
 * @const
 * VGA (640×480) 
 */
DeviceConfiguration.SR_VGA = 5;

/**
 * @name vs.core.DeviceConfiguration.SR_WVGA 
 * @const
 * WVGA (800×480) 
 */
DeviceConfiguration.SR_WVGA = 6;

/**
 * @name vs.core.DeviceConfiguration.SR_FWVGA 
 * @const
 * FWVGA (854×480) 
 */
DeviceConfiguration.SR_FWVGA = 7;

/**
 * @name vs.core.DeviceConfiguration.SR_SVGA 
 * @const
 * SVGA (800×600)
 */
DeviceConfiguration.SR_SVGA = 8;

/**
 * @name vs.core.DeviceConfiguration.SR_XGA 
 * @const
 * XGA (1024×768)
 */
DeviceConfiguration.SR_XGA = 9;

/**
 * @name vs.core.DeviceConfiguration.SR_N_HD 
 * @const
 * nHD (640×360)
 */
DeviceConfiguration.SR_N_HD = 10;

/**
 * @name vs.core.DeviceConfiguration.SR_Q_HD 
 * @const
 * qHD (960×540)
 */
DeviceConfiguration.SR_Q_HD = 11;

/**
 * @name vs.core.DeviceConfiguration.SR_WXGA 
 * @const
 * WXGA (1280×720/768/800)
 */
DeviceConfiguration.SR_WXGA = 12;

/**
 * @name vs.core.DeviceConfiguration.BROWSER_UNKNOWN 
 * @const
 */
DeviceConfiguration.BROWSER_UNKNOWN = 0;

/**
 * @name vs.core.DeviceConfiguration.BROWSER_CHROME
 * @const
 */
DeviceConfiguration.BROWSER_CHROME = 1;

/**
 * @name vs.core.DeviceConfiguration.BROWSER_SAFARI 
 * @const
 */
DeviceConfiguration.BROWSER_SAFARI = 2;

/**
 * @name vs.core.DeviceConfiguration.BROWSER_OPERA 
 * @const
 */
DeviceConfiguration.BROWSER_OPERA = 3;

/**
 * @name vs.core.DeviceConfiguration.BROWSER_FIREFOX 
 * @const
 */
DeviceConfiguration.BROWSER_FIREFOX = 4;

/**
 * @name vs.core.DeviceConfiguration.BROWSER_MSIE 
 * @const
 */
DeviceConfiguration.BROWSER_MSIE = 5;


DeviceConfiguration.prototype = {
  
  /** 
   * Get the device's operating system name.
   * @name vs.core.DeviceConfiguration#os 
   * @type {number}
   */
  os : DeviceConfiguration.OS_UNKNOWN,

  /** 
   * Get the browser name.
   * @name vs.core.DeviceConfiguration#browser 
   * @type {number}
   */
  browser : DeviceConfiguration.BROWSER_UNKNOWN,

  /** 
   * Get the device's screen resolution type.
   * @name vs.core.DeviceConfiguration#screenResolution 
   * @type {number}
   */
  screenResolution : DeviceConfiguration.SR_UNKNOWN,

  /** 
   * Get the device's screen ratio.
   * @name vs.core.DeviceConfiguration#screenRatio 
   * @type {number}
   */
  screenRatio : 0,

  /**
   * @protected
   * @function
   */
  browserDetect : function ()
  {
    function searchString (data)
    {
      var i = data.length;
      while (i--)
      {
        var dataString = data [i].string;
        var dataProp = data [i].prop;
        this.versionSearchString = data[i].versionSearch || data[i].identity;
        if (dataString)
        {
          if (dataString.match (data[i].subString))
          { return data[i].identity; }
        }
        else if (dataProp) { return data[i].identity; }
      }
    }

    this.browser = searchString (DeviceConfiguration._data_browser) ||   
      DeviceConfiguration.BROWSER_UNKNOWN;

    this.os = searchString (DeviceConfiguration._data_OS) ||
      DeviceConfiguration.OS_UNKNOWN;
  },
  
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
      break;
    }
      
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
  },
    
  /**
   * @protected
   * @function
   */
  setActiveStyleSheet : function (pid)
  {
    util.setActiveStyleSheet (pid);
    vs._current_platform_id = pid;
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
 * @private
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
 * @private
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

if (typeof navigator != "undefined")
{
/**
 * @private
 * @const
 */
DeviceConfiguration._data_browser = [
  {
    string: navigator.userAgent,
    subString: "Chrome",
    identity: DeviceConfiguration.BROWSER_CHROME
  },
  {
    string: navigator.vendor,
    subString: "Apple",
    identity: DeviceConfiguration.BROWSER_SAFARI,
    versionSearch: "Version"
  },
  {
    prop: window.opera,
    identity: DeviceConfiguration.BROWSER_OPERA,
    versionSearch: "Version"
  },
  {
    string: navigator.userAgent,
    subString: "Firefox",
    identity: DeviceConfiguration.BROWSER_FIREFOX
  },
  {
    string: navigator.userAgent,
    subString: "MSIE",
    identity: DeviceConfiguration.BROWSER_MSIE,
    versionSearch: "MSIE"
  }
];
}
else DeviceConfiguration._data_browser = [];

if (typeof navigator != "undefined")
{
/**
 * @private
 * @const
 */
DeviceConfiguration._data_OS = [
  {
    string: navigator.platform,
    subString: "Win",
    identity: DeviceConfiguration.OS_WINDOWS
  },
  {
    string: navigator.platform,
    subString: "Mac",
    identity: DeviceConfiguration.OS_MACOS
  },
  {
    string: navigator.platform,
    subString: "Linux",
    identity: DeviceConfiguration.OS_LINUX
  },
  {
     string: navigator.userAgent,
     subString: "iPad|iPhone|iPod",
     identity: DeviceConfiguration.OS_IOS
  },
  {
     string: navigator.userAgent,
     subString: "Android",
     identity: DeviceConfiguration.OS_ANDROID
  }
];
}
else DeviceConfiguration._data_OS = [];

if (typeof window != 'undefined' && !window.deviceConfiguration)
{
  window.deviceConfiguration = new DeviceConfiguration ();
}

/********************************************************************
                      Export
*********************************************************************/
/** @private */
core.DeviceConfiguration = DeviceConfiguration;
