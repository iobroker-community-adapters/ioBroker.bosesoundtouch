/* jshint -W097 */
// jshint strict:false
/* jslint node: true */
/* jslint esversion: 6 */

'use strict';

const BOSE_ID_ON     = 'on';
const BOSE_ID_KEY    = 'key';
const BOSE_ID_VOLUME = 'volume';
const BOSE_ID_MUTED  = 'muted';

const BOSE_ID_NOW_PLAYING = 'nowPlaying.';
const BOSE_ID_NOW_PLAYING_SOURCE  = BOSE_ID_NOW_PLAYING + 'source';
const BOSE_ID_NOW_PLAYING_TRACK   = BOSE_ID_NOW_PLAYING + 'track';
const BOSE_ID_NOW_PLAYING_ARTIST  = BOSE_ID_NOW_PLAYING + 'artist';
const BOSE_ID_NOW_PLAYING_ALBUM   = BOSE_ID_NOW_PLAYING + 'album';
const BOSE_ID_NOW_PLAYING_STATION = BOSE_ID_NOW_PLAYING + 'station';

const BOSE_ID_PRESETS = 'presets.';
const BOSE_ID_PRESET_SOURCE = BOSE_ID_PRESETS + '{}.source';
const BOSE_ID_PRESET_NAME   = BOSE_ID_PRESETS + '{}.name';
const BOSE_ID_PRESET_ICON   = BOSE_ID_PRESETS + '{}.iconUrl';

const BOSE_ID_DEVICE_INFO = 'deviceInfo.';
const BOSE_ID_INFO_NAME = BOSE_ID_DEVICE_INFO + 'name';
const BOSE_ID_INFO_TYPE = BOSE_ID_DEVICE_INFO + 'type';
const BOSE_ID_INFO_MAC_ADDRESS = BOSE_ID_DEVICE_INFO + 'macAddress';


// you have to require the utils module and call adapter function
var format = require('string-format');
var utils = require(__dirname + '/lib/utils'); // Get common adapter utils
var soundtouchsocket = require(__dirname + '/soundtouchsocket');
//var bosestates = require(__dirname + '/bosestates');

// you have to call the adapter function and pass a options object
// name has to be set and has to be equal to adapters folder name and main file name excluding extension
// adapter will be restarted automatically every time as the configuration changed, e.g system.adapter.template.0
class boseSoundTouch {
    constructor() {
        var instance = this;

        this.adapter = utils.adapter('bosesoundtouch');

        // is called when adapter shuts down - callback has to be called under any circumstances!
        this.adapter.on('unload', function(callback) { instance.onUnload(callback); });

        // is called if a subscribed object changes
        this.adapter.on('objectChange', function(id, obj) { instance.onObjectChange(id, obj); });

        // is called if a subscribed state changes
        this.adapter.on('stateChange', function (id, state) { instance.onStateChange(id, state); });

        // Some message was sent to adapter instance over message box. Used by email, pushover, text2speech, ...
        this.adapter.on('message', function(obj) { instance.onMessage(obj); });

        // is called when databases are connected and adapter received configuration.
        // start here!
        this.adapter.on('ready', function() { instance.onReady(); });
    }

    onUnload(callback) {
        try {
            this.adapter.log.info('cleaned everything up...');
            callback();
        }
        catch (e) {
            callback();
        }
    }

    onObjectChange(id, obj) {
        // Warning, obj can be null if it was deleted
        this.adapter.log.info('objectChange ' + id + ' ' + JSON.stringify(obj));
    }

    onStateChange(id, state) {
        // Warning, state can be null if it was deleted
        this.adapter.log.info('stateChange ' + id + ' ' + JSON.stringify(state));

<<<<<<< HEAD
        var namespace = this.adapter.namespace + '.';
        
=======
        //var ar = id.split('.');
        //var deviceName = ar[2];
        //var stateName = ar[3];
        //var o = devices.get(deviceName);

>>>>>>> updates, fixes and add testing
        // you can use the ack flag to detect if it is status (true) or command (false)
        if (state && !state.ack) {
            switch (id) {
                case namespace + BOSE_ID_ON:
                    this.adapter.setState(BOSE_ID_KEY, 'POWER');
                    break;
<<<<<<< HEAD
        
                case namespace + BOSE_ID_VOLUME:
                    this.socket.setValue('volume', '', state.val);
                    break;
                
                case namespace + BOSE_ID_KEY:
=======

                case 'bosesoundtouch.0.' + BOSE_ID_VOLUME:
                    this.socket.setValue('volume', '', state.val);
                    break;

                case 'bosesoundtouch.0.' + BOSE_ID_KEY:
>>>>>>> updates, fixes and add testing
                    this.socket.setValue('key', 'state="press" sender="Gabbo"', state.val);
                    this.socket.setValue('key', 'state="release" sender="Gabbo"', state.val);
                    break;

                case namespace + BOSE_ID_MUTED:
                    this.adapter.setState(BOSE_ID_KEY, 'MUTE');
                    break;
            }
            this.adapter.log.debug('ack is not set!');
        }
    }

    onMessage(obj) {
        if (typeof obj == 'object' && obj.message) {
            if (obj.command == 'send') {
                // e.g. send email or pushover or whatever
                adapter.log.debug('send command');

                // Send response in callback if required
                if (obj.callback) {
                    this.adapter.sendTo(obj.from, obj.command, 'Message received', obj.callback);
                }
            }
        }
    }

    onReady() {
        this.initObjects();
        this.adapter.subscribeStates('*');

        // in this template all states changes inside the adapters namespace are subscribed
        this.socket = new soundtouchsocket(this.adapter);

        var instance = this;

        this.socket.connect().then( function(server) {
            instance.socket.addListener('deviceInfo', function(obj) { instance.setDeviceInfo(obj); });
            instance.socket.addListener('volume', function(obj) { instance.setVolume(obj); });
            instance.socket.addListener('nowPlaying', function(obj) { instance.setNowPlaying(obj); });
            instance.socket.addListener('presets', function(obj) { instance.setPresets(obj); });
            instance.socket.updateAll(server);
        }).catch(function(err) {
            // error here
            instance.adapter.error(err);
        });
    }

    initObjects() {
        this.adapter.setObjectNotExists(BOSE_ID_KEY, {
            type: 'state',
            common: {
                name: 'key',
                type: 'string',
                role: 'text',
                read: false,
                write: true
            },
            native: {}
        });

        this.adapter.setObjectNotExists(BOSE_ID_VOLUME, {
            type: 'state',
            common: {
                name: 'volume',
                type: 'number',
                role: 'level',
                read: true,
                write: true

            },
            native: {}
        });

        this.adapter.setObjectNotExists(BOSE_ID_MUTED, {
            type: 'state',
            common: {
                name: 'muted',
                type: 'boolean',
                role: 'indicator',
                read: true,
                write: true
            },
            native: {}
        });

        this.adapter.setObjectNotExists(BOSE_ID_ON, {
            type: 'state',
            common: {
                name: 'on',
                type: 'boolean',
                role: 'indicator',
                read: true,
                write: true
            },
            native: {}
        });

        const presetsConfig = {
            type: 'state',
            common: {
                name: '',
                type: 'string',
                read: true,
                write: false
            },
            native: {}
        };

        for (var i = 1; i <= 6; i++) {
            presetsConfig.common.role = 'text';
            this.adapter.setObjectNotExists(format(BOSE_ID_PRESET_SOURCE, i), presetsConfig);
            this.adapter.setObjectNotExists(format(BOSE_ID_PRESET_NAME, i),   presetsConfig);
            presetsConfig.common.role = 'text.url';
            this.adapter.setObjectNotExists(format(BOSE_ID_PRESET_ICON, i),   presetsConfig);
        }

        const nowPlayingConfig = {
            type: 'state',
            common: {
                name: '',
                type: 'string',
                role: 'text',
                read: true,
                write: false
            },
            native: {}
        };
        this.adapter.setObjectNotExists(BOSE_ID_NOW_PLAYING_SOURCE,  nowPlayingConfig);
        this.adapter.setObjectNotExists(BOSE_ID_NOW_PLAYING_TRACK,   nowPlayingConfig);
        this.adapter.setObjectNotExists(BOSE_ID_NOW_PLAYING_ARTIST,  nowPlayingConfig);
        this.adapter.setObjectNotExists(BOSE_ID_NOW_PLAYING_ALBUM,   nowPlayingConfig);
        this.adapter.setObjectNotExists(BOSE_ID_NOW_PLAYING_STATION, nowPlayingConfig);

        const deviceInfoConfig = {
            type: 'state',
            common: {
                name: '',
                type: 'string',
                role: 'text',
                read: true,
                write: false
            },
            native: {}
        };
        this.adapter.setObjectNotExists(BOSE_ID_INFO_NAME, deviceInfoConfig);
        this.adapter.setObjectNotExists(BOSE_ID_INFO_TYPE, deviceInfoConfig);
        this.adapter.setObjectNotExists(BOSE_ID_INFO_MAC_ADDRESS, deviceInfoConfig);
    }

    setDeviceInfo(obj) {
        this.adapter.setState(BOSE_ID_INFO_NAME, {val: obj.name, ack: true});
        this.adapter.setState(BOSE_ID_INFO_TYPE, {val: obj.type, ack: true});
        this.adapter.setState(BOSE_ID_INFO_MAC_ADDRESS, {val: obj.macAddress, ack: true});
        this.macAddress = obj.macAddress;
    }

    setVolume(obj) {
        var actualVolume = obj.actualvolume;
        var muted = (obj.muteenabled == 'true');
        this.adapter.setState(BOSE_ID_VOLUME, {val: actualVolume, ack: true});
        this.adapter.setState(BOSE_ID_MUTED, {val: muted, ack: true});
    }

    setNowPlaying(obj) {
        this.adapter.setState(BOSE_ID_NOW_PLAYING_SOURCE, {val: obj.source, ack: true});
        this.adapter.setState(BOSE_ID_NOW_PLAYING_TRACK, {val: obj.track, ack: true});
        this.adapter.setState(BOSE_ID_NOW_PLAYING_ARTIST, {val: obj.artist, ack: true});
        this.adapter.setState(BOSE_ID_NOW_PLAYING_ALBUM, {val: obj.album, ack: true});
        this.adapter.setState(BOSE_ID_NOW_PLAYING_STATION, {val: obj.station, ack: true});

        this.adapter.setState(BOSE_ID_ON, {val: (obj.source != 'STANDBY'), ack: true});
    }

    setPresets(obj) {
        //var presets = JSON.parse(data);
        for (var i = 0; i < 6; i++) {
            var preset = {
                source: 	'',
                name:		'',
                iconUrl:	''
            };
            if (obj[i]) {
                preset = obj[i];
            }

            this.adapter.setState(format(BOSE_ID_PRESET_SOURCE, i+1), {val: preset.source, ack: true});
            this.adapter.setState(format(BOSE_ID_PRESET_NAME, i+1), {val: preset.name, ack: true});
            this.adapter.setState(format(BOSE_ID_PRESET_ICON, i+1), {val: preset.iconUrl, ack: true});
        }
    }
}

var adapter = new(boseSoundTouch);
