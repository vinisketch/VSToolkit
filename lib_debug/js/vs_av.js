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
  av = vs.av;

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
 
 Use code from Canto.js Copyright 2010 David Flanagan
*/

/**
 *  The vs.av.Video class
 *
 *  @extends vs.ui.View
 *  @class
 *  Implements {@link vs.core.Task}.
 *  <p>
 *  The vs.av.Video class allow to show a movie clip or other video streams.
 *  <p>
 *  Events:
 *  <ul>
 *    <li /> volumechange: Fired after the volume attribute or the muted attribute has changed.
 *    <li /> error: An error occurs while fetching the media data.
 *    <li /> ended : Fired when playback has stopped because the end of the media resource was reached.
 *    <li /> playing : Fired when playback has started.
 *    <li /> play : Playback has begun. Fired after the play() method has returned, or when the
 *           autoplay property has caused playback to begin.
 *    <li /> pause : Playback has been paused. Fired after the pause() method has returned.
 *  </ul>
 *  <p>
 * The delegate has to implement:
 *  <ul>
 *    <li/>taskDidStop : function (vs.core.Task)
 *    <li/>taskDidPause : function (vs.core.Task)
 *    <li/>taskDidEnd : function (vs.core.Task)
 *  </ul>
 *  @author David Thevenin
 *
 *  @constructor
 *   Creates a new vs.av.Video.
 *
 *  @example
 *   var myVideo = new vs.av.Video ({id:'my_video'});
 *   myVideo.init ();
 *
 *   myVideo.src = "http://yourlink.mp4";
 *   myVideo.poster = "http://yourlink.jpg";
 *   myVideo.controls = true;
 *   myVideo.loop = true;
 *   myVideo.play ();
 *
 * @name vs.av.Video 
 *
 * @param {Object} config The configuration structure [mandatory]
*/
function Video (config)
{
  if (config && !config.size) { config.size = [320, 200]; }
  
  this.parent = ui.View;
  this.parent (config);
  this.constructor = Video;
}

/**
 * Error code
 * @name vs.av.Video.UNKNOWN_ERR
 * @const
 */
Video.UNKNOWN_ERR = 0;

/**
 * Error code: The fetching process for the media resource was aborted by the 
 * user agent at the user's request.
 * @name vs.av.Video.MEDIA_ERR_ABORTED
 * @const
 */
Video.MEDIA_ERR_ABORTED = 1;

/**
 * Error code: A network error of some description caused the user agent to 
 * stop fetching the media resource, after the resource was established to
 * be usable
 * @name vs.av.Video.MEDIA_ERR_NETWORK
 * @const
 */
Video.MEDIA_ERR_NETWORK = 2;

/**
 * Error code: An error of some description occurred while decoding the
 * media resource, after the resource was established to be usable.
 * @name vs.av.Video.MEDIA_ERR_DECODE
 * @const
 */
Video.MEDIA_ERR_DECODE = 3;

/**
 * Error code: The media resource indicated by the src attribute was not 
 * suitable.
 * @name vs.av.Video.MEDIA_ERR_SRC_NOT_SUPPORTED
 * @const
 */
Video.MEDIA_ERR_SRC_NOT_SUPPORTED = 4;

Video.prototype = {

  /**
   * TaskDelegate.
   * Methods are called when state changes (stop | pause)
   * Should implements: 
   *  <ul>
   *    <li/>taskDidStop : function (vs.core.Task)
   *    <li/>taskDidPause : function (vs.core.Task)
   *    <li/>taskDidEnd : function (vs.core.Task)
   *  </ul>
   * @name vs.av.Video#delegate 
   *@property
  */
  delegate : null,
  
  /*****************************************************************
   *                          State
   ****************************************************************/

  /**
   *	@private
   */
  _state : core.Task.STOPPED,

  /*****************************************************************
   *
   ****************************************************************/
   
  /**
   * @private
   * @type {HTMLDivElement}
   */
   __video_node: null,

  /**
   * @protected
   * @type {string}
   */
  _src: "",
  
  /**
   * @protected
   * @type {string}
   */
  _poster: "",
  
  /**
   * @protected
   * @type {HTMLDivElement}
   */
  _preload: "",
  
  /**
   * @protected
   * @type {boolean}
   */
  _autoplay: false,
  
  /**
   * @protected
   * @type {boolean}
   */
  _loop: false,
  
  /**
   * @protected
   * @type {boolean}
   */
  _controls: false,

  /**
   * @protected
   * @type {number}
   */
  _volume: 1,

  /**
   * @protected
   * @type {boolean}
   */
  _muted: false,

  /**
   * @protected
   * @type {number}
   */
  _current_time: 0,

  /*****************************************************************
   *              Media player methods
   ****************************************************************/

  /**
   * When the play method is invoked, the video start to play.
   * A error event can be fired if a error occurs.
   *
   * @name vs.av.Video#play 
   * @function
   */
  play : function ()
  {
    if (this._state === core.Task.STARTED) { return false; }
    if (!this.__video_node) { return; }

    this._state = core.Task.STARTED;
    this.__video_node.play ();
  },
  
  /**
   *  Starts the task
   *
   * @name vs.av.Video#start
   * @function
   *
   * @param {any} param any parameter (scalar, Array, Object)
   * @ignore
   */
  start : function ()
  {
    this.play ();
  },

  /**
   *  When the pause method is invoked, the video is paused.
   *
   * @name vs.av.Video#pause 
   * @function
   */
  pause : function ()
  {
    if (this._state === core.Task.PAUSED) { return false; }

    if (!this.__video_node) { return; }
    this.__video_node.pause ();
    this._state = core.Task.PAUSED;

    if (this.delegate && this.delegate.taskDidPause)
    { this.delegate.taskDidPause (this); }
  },

  /**
   *  When the stop method is invoked, the video is stopped.
   *
   * @name vs.av.Video#stop 
   * @function
   */
  stop : function ()
  {
    if (this._state === core.Task.STOPPED) { return false; }

    if (!this.__video_node) { return; }
    if (this.__video_node.stop) this.__video_node.stop ();
    else
    {
      this.__video_node.pause ();
      this.__video_node.currentTime = 0;
    }
    
    this._state = core.Task.STOPPED;

    if (this.delegate && this.delegate.taskDidStop)
    { this.delegate.taskDidStop (this); }
 },

  /*****************************************************************
   *
   ****************************************************************/
  
  /**
   * @protected
   * @function
   */
  destructor : function ()
  {
    if (!this.__i__) { return; }
    
    // bindings
    this.__video_node.removeEventListener ('volumechange', this);
    this.__video_node.removeEventListener ('ended', this);
    this.__video_node.removeEventListener ('playing', this);
    this.__video_node.removeEventListener ('play', this);
    this.__video_node.removeEventListener ('pause', this);
    this.__video_node.removeEventListener ('error', this);

    ui.View.prototype.destructor.call (this);
  },

  /**
   * @protected
   * @function
   */
  initComponent : function ()
  {
    ui.View.prototype.initComponent.call (this);
    
    this.__video_node = this.view.querySelector ('video');
    if (!this.__video_node)
    {
      console.error ('Uncompatible video view');
      return;
    }
    
    // bindings
    this.__video_node.addEventListener ('volumechange', this);
    this.__video_node.addEventListener ('ended', this);
    this.__video_node.addEventListener ('playing', this);
    this.__video_node.addEventListener ('play', this);
    this.__video_node.addEventListener ('pause', this);
    this.__video_node.addEventListener ('error', this);
    
    var self = this,
      _timeupdate = function ()
    {
      self._current_time = self.__video_node.currentTime;
      self.propertyChange ('currentTime');
    };
    this.__video_node.addEventListener ('timeupdate', _timeupdate, false);
  },
  
  /**
   * @protected
   * @function
   */
  handleEvent : function (event)
  {
    switch (event.type)
    {
      case 'volumechange':
        this._volume = this.__video_node.getAttribute ('volume');
        this.propertyChange ('volume');
        this.propagate ('volumechange', this._volume);
      break;

      case 'ended':
        this._state = core.Task.STOPED;
        if (this.delegate && this.delegate.taskDidEnd)
        { this.delegate.taskDidEnd (this); }
        this.propagate (event.type);
      break;

      case 'pause':
        if (this.delegate && this.delegate.taskDidPause)
        { this.delegate.taskDidPause (this); }
        this._state = core.Task.PAUSED;
        this.propagate (event.type);
      break;

      case 'playing':
      case 'play':
        this._state = core.Task.STARTED;
        this.propagate (event.type);
      break;

      case 'error': 
        if (!this.__video_node.error)
        {
          this.propagate (event.type, Video.UNKNOWN_ERR);
        }
        else
        {
          this.propagate (event.type, this.__video_node.error.code);
        }
      break;
    }
  }
};
util.extendClass (Video, ui.View);

/********************************************************************
                  Define class properties
********************************************************************/

util.defineClassProperties (Video, {

  'controls': {
  
    /**
     * The controls property indicates the address to expose or not the a user
     * interface for the video controls.
     *
     * @name vs.av.Video#controls 
     * @type {boolean}
     */
    set : function (v)
    {
      if (v) { this._controls = true; }
      else { this._controls = false; }
      
      if (!this.__video_node) { return; }
      this.__video_node.setAttribute ("controls", this._controls);
      
      this.propertyChange ('controls');
    },
    
    /**
     * @ignore
     */
    get : function ()
    {
      return this._controls;
    }
  },
  
  'size': {
  
   /** 
     * Getter|Setter for size. Gives the dimensions of the visual content
     *
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
  
      if (!this.__video_node)
      {
        this.__video_node = this.view.querySelector ('video');
        if (!this.__video_node)
        {
          console.error ('Uncompatible video view');
          return;
        }
      }
     this.__video_node.setAttribute ('width', this._size [0]);
     this.__video_node.setAttribute ('height', this._size [1]);    
    },
  
    /**
     * @ignore
     * @type {Array.<number>}
     */
    get : function ()
    {
      if (this.view && this.view.parentNode)
      {
        this._size [0] = this.view.offsetWidth;
        this._size [1] = this.view.offsetHeight;
      }
      return this._size.slice ();
    }
  },
  
  'src': {
  
    /**
     * The src property attribute gives the address of the media resource to 
     * show.
     *
     * @name vs.av.Video#src 
     * @type {string}
     */
    set : function (v)
    {
      if (!util.isString (v)) { return; }
      
      this._src = v;
      
      if (!this.__video_node) { return; }
      this.__video_node.setAttribute ("src", this._src);
  
      this.propertyChange ('src');
    },
  
    /**
     * @ignore
     */
    get : function ()
    {
      return this._src;
    }
  },
  
  'poster': {
  
    /**
     * The src property attribute gives the address of the media resource to 
     * show.
     *
     * @name vs.av.Video#poster
     * @type {string}
     */
    set : function (v)
    {
      if (!util.isString (v)) { return; }
      
      this._poster = v;
      
      if (!this.__video_node) { return; }
      this.__video_node.setAttribute ("poster", this._poster);
  
      this.propertyChange ('poster');
    },
  
    /**
     * @ignore
     */
    get : function ()
    {
      return this._poster;
    }
  },
  
  'loop': {
  
    /**
     * The loop property indicates that the media element is to seek back to
     * the start of the media resource upon reaching the end.
     *
     * @name vs.av.Video#loop 
     * @type {boolean}
     */
    set : function (v)
    {
      if (v) { this._loop = true; }
      else { this._loop = false; }
      
      if (!this.__video_node) { return; }
      this.__video_node.setAttribute ("loop", this._loop);
      
      this.propertyChange ('loop');
    },
  
    /**
     * @ignore
     */
    get : function ()
    {
      return this._loop;
    }
  },
  
  'autoplay': {
    /**
     * The autoplay property indicates the video will automatically begin 
     * playback as soon as it can do so without stopping
     *
     * @name vs.av.Video#autoplay 
     * @type {boolean}
     */
    set : function (v)
    {
      if (v) { this._autoplay = true; }
      else { this._autoplay = false; }
      
      if (!this.__video_node) { return; }
      this.__video_node.setAttribute ("autoplay", this._autoplay);
      
      this.propertyChange ('autoplay');
    },
  
    /**
     * @ignore
     */
    get : function ()
    {
      return this._autoplay;
    }
  },
  
  'volume': {
  
    /**
     * The volume property gives acces to the current playback volume
     * as a number in the range 0.0 to 1.0
     *
     * @name vs.av.Video#volume 
     * @type {number}
     */
    set : function (v)
    {
      if (!util.isNumber (v)) { return; }
      if (v < 0 || v > 1) { return; }
      
      this._volume = v;
      
      if (!this.__video_node) { return; }
      this.__video_node.setAttribute ("volume", this._volume);
      
      this.propertyChange ('volume');
    },
  
    /**
     * @ignore
     */
    get : function ()
    {
      return this._volume;
    }
  },
  
  'muted': {
  
    /**
     * The muted property is true if the audio channels are muted and
     * false otherwise
     *
     * @name vs.av.Video#muted 
     * @type {boolean}
     */
    set : function (v)
    {
      if (v) { this._muted = true; }
      else { this._muted = false; }
      
      this.propertyChange ('muted');
    },
  
    /**
     * @ignore
     */
    get : function ()
    {
      return this._muted;
    }
  },
  
  'currentTime': {
  
    /**
     * The current playback position 
     *
     * @name vs.av.Video#currentTime 
     * @type {number}
     */
    get : function ()
    {
      return this._current_time;
    }
  },
  
  'state': {
  
    /** 
     * Return the task State. <br />
     * Possible values: {@link vs.core.Task.STARTED},
     * {@link vs.core.Task.STOPPED},
     * {@link vs.core.Task.PAUSED}
     * @name vs.av.Video#state
     * @type {number}
     */ 
    get : function ()
    {
      return this._state;
    }
  }
});

/********************************************************************
                      Export
*********************************************************************/
/** @private */
av.Video = Video;
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
 
 Use code from Canto.js Copyright 2010 David Flanagan
*/

/**
 *  The vs.av.Audio class
 *
 *  @extends vs.core.EventSource
 *  @class
 *  Implements {@link vs.core.Task}.
 *  <p>
 *  The Audio class allow to show a movie clip or other video streams.
 *  <p>
 *  Events:
 *  <ul>
 *    <li /> volumechange: Fired after the volume attribute or the muted attribute has changed.
 *    <li /> error: An error occurs while fetching the media data.
 *    <li /> ended : Fired when playback has stopped because the end of the media resource was reached.
 *    <li /> playing : Fired when playback has started.
 *    <li /> play : Playback has begun. Fired after the play() method has returned, or when the
 *           autoplay property has caused playback to begin.
 *    <li /> pause : Playback has been paused. Fired after the pause() method has returned.
 *  </ul>
 *  <p>
 * The delegate has to implement:
 *  <ul>
 *    <li/>taskDidStop : function (vs.core.Task)
 *    <li/>taskDidPause : function (vs.core.Task)
 *    <li/>taskDidEnd : function (vs.core.Task)
 *  </ul>
 *  @author David Thevenin
 *
 *  @constructor
 *   Creates a new vs.av.Audio.
 *  @name vs.av.Audio
 *
 *  @example
 *   var myVideo = new vs.av.Audio ({id:'my_video'});
 *   myVideo.init ();
 *
 *   myVideo.src = "http://yourlink.mp4";
 *   myVideo.poster = "http://yourlink.jpg";
 *   myVideo.controls = true;
 *   myVideo.loop = true;
 *   myVideo.play ();
 *
 *	@param {Object} config The configuration structure [mandatory]
*/
function Audio (config)
{
  this.parent = core.EventSource;
  this.parent (config);
  this.constructor = Audio;
}

/**
 * Error code
 * @const
 * @name vs.av.Audio.UNKNOWN_ERR
 */
Audio.UNKNOWN_ERR = 0;

/**
 * Error code: The fetching process for the media resource was aborted by the 
 * user agent at the user's request.
 * @const
 * @name vs.av.Audio.MEDIA_ERR_ABORTED
 */
Audio.MEDIA_ERR_ABORTED = 1;

/**
 * Error code: A network error of some description caused the user agent to 
 * stop fetching the media resource, after the resource was established to
 * be usable
 * @const
 * @name vs.av.Audio.MEDIA_ERR_NETWORK
 */
Audio.MEDIA_ERR_NETWORK = 2;

/**
 * Error code: An error of some description occurred while decoding the
 * media resource, after the resource was established to be usable.
 * @const
 * @name vs.av.Audio.MEDIA_ERR_DECODE
 */
Audio.MEDIA_ERR_DECODE = 3;

/**
 * Error code: The media resource indicated by the src attribute was not 
 * suitable.
 * @const
 * @name vs.av.Audio.MEDIA_ERR_SRC_NOT_SUPPORTED
 */
Audio.MEDIA_ERR_SRC_NOT_SUPPORTED = 4;

Audio.prototype = {

  /**
   * TaskDelegate.
   * Methods are called when state changes (stop | pause)
   * Should implements: 
   *  <ul>
   *    <li/>taskDidStop : function (vs.core.Task)
   *    <li/>taskDidPause : function (vs.core.Task)
   *    <li/>taskDidEnd : function (vs.core.Task)
   *  </ul>
   *	@property
   * @name vs.av.Audio#delegate
   */
  delegate : null,
  
  /*****************************************************************
   *                          State
   ****************************************************************/

  /**
   * @private
   */
  _state : core.Task.STOPPED,

  /*****************************************************************
   *
   ****************************************************************/
   
  /**
   * @private
   * @type {AudioConstructor}
   */
   __audio: null,

  /**
   * @protected
   * @type {string}
   */
  _src: "",
  
  /**
   * @protected
   * @type {boolean}
   */
  _autoplay: false,
  
  /**
   * @protected
   * @type {boolean}
   */
  _loop: false,
  
  /**
   * @protected
   * @type {number}
   */
  _volume: 1,

  /**
   * @protected
   * @type {boolean}
   */
  _muted: false,

  /**
   * @protected
   * @type {number}
   */
  _current_time: 0,

  /*****************************************************************
   *              Media player methods
   ****************************************************************/

  /**
   * When the play method is invoked, the video start to play.
   * A error event can be fired if a error occurs.
   *
   * @name vs.av.Audio#play
   * @function
   */
  play : function ()
  {
    if (this._state === core.Task.STARTED) { return false; }
    if (!this.__audio) { return; }

    this._state = core.Task.STARTED;
    this.__audio.play ();
  },
  
  /**
   *  Starts the task
   *
   *@param {any} param any parameter (scalar, Array, Object)
   * @ignore
   * @name vs.av.Audio#start
   * @function
   */
  start : function ()
  {
    this.play ();
  },

  /**
   * When the pause method is invoked, the video is paused.
   * @name vs.av.Audio#pause
   * @function
   */
  pause : function ()
  {
    if (this._state === core.Task.PAUSED) { return false; }

    if (!this.__audio) { return; }
    this.__audio.pause ();
    this._state = core.Task.PAUSED;

    if (this.delegate && this.delegate.taskDidPause)
    { this.delegate.taskDidPause (this); }
  },

  /**
   * When the stop method is invoked, the video is stopped.
   * @name vs.av.Audio#stop
   * @function
   */
  stop : function ()
  {
    if (this._state === core.Task.STOPPED) { return false; }

    if (!this.__audio) { return; }
    if (window.Media)
    { this.__audio.stop (); }
    else
    { this.__audio.pause (); }
    this._state = core.Task.STOPPED;

    if (this.delegate && this.delegate.taskDidStop)
    { this.delegate.taskDidStop (this); }
  },

  /*****************************************************************
   *
   ****************************************************************/
  
  /**
   * @protected
   * @function
   */
  destructor : function ()
  {
    if (!this.__i__) { return; }
    
    // unbinding
    this.__audio.removeEventListener ('volumechange', this);
    this.__audio.removeEventListener ('ended', this);
    this.__audio.removeEventListener ('playing', this);
    this.__audio.removeEventListener ('play', this);
    this.__audio.removeEventListener ('pause', this);
    this.__audio.removeEventListener ('error', this);
    
    delete (this.__audio);
    this.__audio = null;

    core.EventSource.prototype.destructor.call (this);
  },

  /**
   * @protected
   * @name vs.av.Audio#initComponent
   * @function
   */
  initComponent: function ()
  {
    core.EventSource.prototype.initComponent.call (this);
    
    this.__audio = new window.Audio ();

    this.__audio.preload = "auto";
    this.__audio.autoplay = this._autoplay;

    // bindings     
    this.__audio.addEventListener ('volumechange', this);
    this.__audio.addEventListener ('ended', this);
    this.__audio.addEventListener ('playing', this);
    this.__audio.addEventListener ('play', this);
    this.__audio.addEventListener ('pause', this);
    this.__audio.addEventListener ('error', this);
    
    var self = this, _timeupdate = function ()
    {
      self._current_time = self.__audio.currentTime;
      self.propertyChange ('currentTime');
    };
    this.__audio.addEventListener ('timeupdate', _timeupdate, false);
  },
  
  /**
   * @protected
   * @name vs.av.Audio#handleEvent
   * @function
   */
  handleEvent : function (event)
  {
    switch (event.type)
    {
      case 'volumechange':
        this._volume = this.__audio.volume;
        this.propertyChange ('volume');
        this.propagate ('volumechange', this._volume);
      break;

      case 'ended':
        this._state = core.Task.STOPED;
        if (this.delegate && this.delegate.taskDidEnd)
        { this.delegate.taskDidEnd (this); }
        this.propagate (event.type);
      break;

      case 'pause':
        if (this.delegate && this.delegate.taskDidPause)
        { this.delegate.taskDidPause (this); }
        this._state = core.Task.PAUSED;
        this.propagate (event.type);
      break;

      case 'playing':
      case 'play':
        this._state = core.Task.STARTED;
        this.propagate (event.type);
      break;

      case 'error': 
        if (!this.__audio.error)
        {
          this.propagate (event.type, Audio.UNKNOWN_ERR);
        }
        else
        {
          this.propagate (event.type, this.__audio.error.code);
        }
      break;
    }
  }
};
util.extendClass (Audio, core.EventSource);

/********************************************************************
                  Define class properties
********************************************************************/

util.defineClassProperties (Audio, {

  'src': {
  
    /**
     * The src property attribute gives the address of the media resource to 
     * show.
     *
     * @name vs.av.Audio#src 
     * @type {string}
     */
    set : function (v)
    {
      if (!vs.util.isString (v)) { return; }
      
      this._src = v, self = this;
      
      if (window.Media)
      {
        function onSuccess ()
        {
          self._state = core.Task.STOPED;
          if (self.delegate && self.delegate.taskDidEnd)
          { self.delegate.taskDidEnd (self); }
          self.propagate (event.type);
        }
        this.__audio = new window.Media (this._src, onSuccess);
        if (this._autoplay) { this.play (); }
      }
      else
      {
        if (!this.__audio) { return; }
        this.__audio.src = this._src;
      }
      this.propertyChange ('src');
    },
  
    /**
     * @ignore 
     * @type {string}
     */
    get : function ()
    {
      return this._src;
    }
  },
  
  'loop': {

    /**
     * The loop property indicates that the media element is to seek back to
     * the start of the media resource upon reaching the end.
     *
     * @name vs.av.Audio#loop 
     * @type {boolean}
     */
    set : function (v)
    {
      if (v) { this._loop = true; }
      else { this._loop = false; }
      
      if (!this.__audio) { return; }
      this.__audio.loop = this._loop;
      
      this.propertyChange ('loop');
    },
  
    /**
     * @ignore 
     * @type {boolean}
     */
    get : function ()
    {
      return this._loop;
    }
  },
  
  'autoplay': {

    /**
     * The autoplay property indicates the video will automatically begin playback 
     * as soon as it can do so without stopping
     *
     * @name vs.av.Audio#autoplay 
     * @type {boolean}
     */
    set : function (v)
    {
      if (v) { this._autoplay = true; }
      else { this._autoplay = false; }
      
      if (!this.__audio) { return; }
      this.__audio.autoplay = this._autoplay;
      
      this.propertyChange ('autoplay');
    },
  
    /**
     * @ignore 
     * @type {boolean}
     */
    get : function ()
    {
      return this._autoplay;
    }
  },
  
  'volume': {

    /**
     * The volume property gives acces to the current playback volume
     * as a number in the range 0.0 to 1.0
     *
     * @name vs.av.Audio#volume 
     * @type {number}
     */
    set : function (v)
    {
      if (!vs.util.isNumber (v)) { return; }
      if (v < 0 || v > 1) { return; }
      
      this._volume = v;
      
      if (!this.__audio) { return; }
      this.__audio.volume = this._volume;
      
      this.propertyChange ('volume');
    },
  
    /**
     * @ignore 
     * @type {number}
     */
    get : function ()
    {
      return this._volume;
    }
  },
  
  'muted': {

    /**
     * The muted property is true if the audio channels are muted and
     * false otherwise
     *
     * @name vs.av.Audio#muted 
     * @type {boolean}
     */
    set : function (v)
    {
      if (v) { this._muted = true; }
      else { this._muted = false; }
      
      this.propertyChange ('muted');
    },
  
    /**
     * @ignore 
     * @type {boolean}
     */
    get : function ()
    {
      return this._muted;
    }
  },
  
  'currentTime': {

    /**
     * The current playback position 
     *
     * @name vs.av.Audio#currentTime 
     * @type {number}
     */
    get : function ()
    {
      return this._current_time;
    }
  },
  
  'state': {
  
    /** 
     * Return the task State. <br />
     * Possible values: {@link vs.core.Task.STARTED},
     * {@link vs.core.Task.STOPPED},
     * {@link vs.core.Task.PAUSED}
     * @name vs.av.Audio#state
     * @type {number}
     */ 
    get : function ()
    {
      return this._state;
    },
  }
});

/********************************************************************
                      Export
*********************************************************************/
/** @private */
av.Audio = Audio;

Video.prototype.html_template = "\
<div class='vs_av_video'><video class='video_inner'></video></div>\
";

})(window);