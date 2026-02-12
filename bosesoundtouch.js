/* jshint -W097 */
// jshint strict:false
/* jslint node: true */
/* jslint esversion: 6 */

'use strict';

const BOSE_ID_ON = { id: 'on', type: 'boolean', write: true };
const BOSE_ID_KEY = { id: 'key', type: 'string', write: true };
const BOSE_ID_VOLUME = { id: 'volume', type: 'integer', write: true, role: 'level.volume' };
const BOSE_ID_MUTED = { id: 'muted', type: 'boolean', write: true, role: 'media.mute' };

const BOSE_ID_NOW_PLAYING = 'nowPlaying';
const BOSE_ID_NOW_PLAYING_SOURCE = { id: `${BOSE_ID_NOW_PLAYING}.source`, type: 'string', role: 'media.input' };
const BOSE_ID_NOW_PLAYING_TRACK = { id: `${BOSE_ID_NOW_PLAYING}.track`, type: 'string', role: 'media.title' };
const BOSE_ID_NOW_PLAYING_ARTIST = { id: `${BOSE_ID_NOW_PLAYING}.artist`, type: 'string', role: 'media.artist' };
const BOSE_ID_NOW_PLAYING_ALBUM = { id: `${BOSE_ID_NOW_PLAYING}.album`, type: 'string', role: 'media.album' };
const BOSE_ID_NOW_PLAYING_STATION = { id: `${BOSE_ID_NOW_PLAYING}.station`, type: 'string' };
const BOSE_ID_NOW_PLAYING_ART = { id: `${BOSE_ID_NOW_PLAYING}.art`, type: 'string', role: 'media.cover' };
const BOSE_ID_NOW_PLAYING_GENRE = { id: `${BOSE_ID_NOW_PLAYING}.genre`, type: 'string', role: 'media.genre' };
const BOSE_ID_NOW_PLAYING_TIME = { id: `${BOSE_ID_NOW_PLAYING}.time`, type: 'integer', role: 'media.elapsed' };
const BOSE_ID_NOW_PLAYING_TOTAL = { id: `${BOSE_ID_NOW_PLAYING}.total`, type: 'integer', role: 'media.duration' };
const BOSE_ID_NOW_PLAYING_STATUS = { id: `${BOSE_ID_NOW_PLAYING}.status`, type: 'string', role: 'media.state' };
const BOSE_ID_NOW_PLAYING_REPEAT = { id: `${BOSE_ID_NOW_PLAYING}.repeat`, type: 'string', role: 'media.mode.repeat' };
const BOSE_ID_NOW_PLAYING_SHUFFLE = {
    id: `${BOSE_ID_NOW_PLAYING}.shuffle`,
    type: 'string',
    role: 'media.mode.shuffle',
};

const BOSE_ID_PRESETS = 'presets';
const BOSE_ID_PRESET_SOURCE = { id: `${BOSE_ID_PRESETS}.{}.source`, type: 'string' };
const BOSE_ID_PRESET_NAME = { id: `${BOSE_ID_PRESETS}.{}.name`, type: 'string' };
const BOSE_ID_PRESET_ICON = { id: `${BOSE_ID_PRESETS}.{}.iconUrl`, type: 'url' };

const BOSE_ID_ZONES = 'zones';
const BOSE_ID_ZONES_MEMBER_OF = { id: `${BOSE_ID_ZONES}.memberOf`, type: 'string' };
const BOSE_ID_ZONES_MASTER_OF = { id: `${BOSE_ID_ZONES}.masterOf`, type: 'string' };
const BOSE_ID_ZONES_ADD_MASTER_OF = { id: `${BOSE_ID_ZONES}.addMasterOf`, type: 'string', write: true };
const BOSE_ID_ZONES_REMOVE_MASTER_OF = { id: `${BOSE_ID_ZONES}.removeMasterOf`, type: 'string', write: true };
const BOSE_ID_ZONES_PLAY_EVERYWHERE = { id: `${BOSE_ID_ZONES}.playEverywhere`, type: 'boolean', write: true };

const BOSE_ID_DEVICE_INFO = 'deviceInfo';
const BOSE_ID_INFO_NAME = { id: `${BOSE_ID_DEVICE_INFO}.name`, type: 'string' };
const BOSE_ID_INFO_TYPE = { id: `${BOSE_ID_DEVICE_INFO}.type`, type: 'string' };
const BOSE_ID_INFO_MAC_ADDRESS = { id: `${BOSE_ID_DEVICE_INFO}.macAddress`, type: 'string' };
const BOSE_ID_INFO_IP_ADDRESS = { id: `${BOSE_ID_DEVICE_INFO}.ipAddress`, type: 'string' };

const BOSE_ID_SOURCES = 'sources';
const BOSE_ID_SOURCES_SOURCE = { id: `${BOSE_ID_SOURCES}.{}`, type: 'playButton', write: true };
/*const BOSE_ID_SOURCE_NAME               = { id: BOSE_ID_SOURCES + '{}.name',             type:'string' };
const BOSE_ID_SOURCE_SOURCE             = { id: BOSE_ID_SOURCES + '{}.source',           type:'string' };
const BOSE_ID_SOURCE_IS_LOCAL           = { id: BOSE_ID_SOURCES + '{}.isLocal',          type:'boolean' };
const BOSE_ID_SOURCE_MULTI_ROOM_ALLOWED = { id: BOSE_ID_SOURCES + '{}.multiRoomAllowed', type:'boolean' };
const BOSE_ID_SOURCE_STATUS             = { id: BOSE_ID_SOURCES + '{}.status',           type:'string' };
const BOSE_ID_SOURCE_PLAY               = { id: BOSE_ID_SOURCES + '{}.play',             type:'boolean' };*/

const BOSE_ID_KEYS = 'keys';
const BOSE_ID_KEYS_PLAY = { id: `${BOSE_ID_KEYS}.PLAY`, type: 'playButton', write: true, role: 'button.play' };
const BOSE_ID_KEYS_PAUSE = { id: `${BOSE_ID_KEYS}.PAUSE`, type: 'playButton', write: true, role: 'button.pause' };
const BOSE_ID_KEYS_STOP = { id: `${BOSE_ID_KEYS}.STOP`, type: 'playButton', write: true, role: 'button.stop' };
const BOSE_ID_KEYS_PREV_TRACK = {
    id: `${BOSE_ID_KEYS}.PREV_TRACK`,
    type: 'playButton',
    write: true,
    role: 'button.prev',
};
const BOSE_ID_KEYS_NEXT_TRACK = {
    id: `${BOSE_ID_KEYS}.NEXT_TRACK`,
    type: 'playButton',
    write: true,
    role: 'button.next',
};
const BOSE_ID_KEYS_THUMBS_UP = { id: `${BOSE_ID_KEYS}.THUMBS_UP`, type: 'playButton', write: true, role: 'button' };
const BOSE_ID_KEYS_THUMBS_DOWN = { id: `${BOSE_ID_KEYS}.THUMBS_DOWN`, type: 'playButton', write: true, role: 'button' };
const BOSE_ID_KEYS_BOOKMARK = { id: `${BOSE_ID_KEYS}.BOOKMARK`, type: 'playButton', write: true, role: 'button' };
const BOSE_ID_KEYS_POWER = { id: `${BOSE_ID_KEYS}.POWER`, type: 'playButton', write: true, role: 'button' };
const BOSE_ID_KEYS_VOLUME_UP = { id: `${BOSE_ID_KEYS}.VOLUME_UP`, type: 'playButton', write: true, role: 'button' };
const BOSE_ID_KEYS_VOLUME_DOWN = { id: `${BOSE_ID_KEYS}.VOLUME_DOWN`, type: 'playButton', write: true, role: 'button' };
const BOSE_ID_KEYS_PRESET_1 = { id: `${BOSE_ID_KEYS}.PRESET_1`, type: 'playButton', write: true, role: 'button' };
const BOSE_ID_KEYS_PRESET_2 = { id: `${BOSE_ID_KEYS}.PRESET_2`, type: 'playButton', write: true, role: 'button' };
const BOSE_ID_KEYS_PRESET_3 = { id: `${BOSE_ID_KEYS}.PRESET_3`, type: 'playButton', write: true, role: 'button' };
const BOSE_ID_KEYS_PRESET_4 = { id: `${BOSE_ID_KEYS}.PRESET_4`, type: 'playButton', write: true, role: 'button' };
const BOSE_ID_KEYS_PRESET_5 = { id: `${BOSE_ID_KEYS}.PRESET_5`, type: 'playButton', write: true, role: 'button' };
const BOSE_ID_KEYS_PRESET_6 = { id: `${BOSE_ID_KEYS}.PRESET_6`, type: 'playButton', write: true, role: 'button' };
const BOSE_ID_KEYS_AUX_INPUT = { id: `${BOSE_ID_KEYS}.AUX_INPUT`, type: 'playButton', write: true, role: 'button' };
const BOSE_ID_KEYS_SHUFFLE_OFF = { id: `${BOSE_ID_KEYS}.SHUFFLE_OFF`, type: 'playButton', write: true, role: 'button' };
const BOSE_ID_KEYS_SHUFFLE_ON = { id: `${BOSE_ID_KEYS}.SHUFFLE_ON`, type: 'playButton', write: true, role: 'button' };
const BOSE_ID_KEYS_REPEAT_OFF = { id: `${BOSE_ID_KEYS}.REPEAT_OFF`, type: 'playButton', write: true, role: 'button' };
const BOSE_ID_KEYS_REPEAT_ONE = { id: `${BOSE_ID_KEYS}.REPEAT_ONE`, type: 'playButton', write: true, role: 'button' };
const BOSE_ID_KEYS_REPEAT_ALL = { id: `${BOSE_ID_KEYS}.REPEAT_ALL`, type: 'playButton', write: true, role: 'button' };
const BOSE_ID_KEYS_PLAY_PAUSE = { id: `${BOSE_ID_KEYS}.PLAY_PAUSE`, type: 'playButton', write: true, role: 'button' };
const BOSE_ID_KEYS_ADD_FAVORITE = {
    id: `${BOSE_ID_KEYS}.ADD_FAVORITE`,
    type: 'playButton',
    write: true,
    role: 'button',
};
const BOSE_ID_KEYS_REMOVE_FAVORITE = {
    id: `${BOSE_ID_KEYS}.REMOVE_FAVORITE`,
    type: 'playButton',
    write: true,
    role: 'button',
};

// you have to require the utils module and call adapter function
const format = require('string-format');
const utils = require('@iobroker/adapter-core'); // Get common adapter utils
const soundtouchsocket = require(`${__dirname}/soundtouchsocket`);
//var bosestates = require(__dirname + '/bosestates');
const adapterName = require('./package.json').name.split('.').pop();
let playTimer, playTimerTime;

// you have to call the adapter function and pass a options object
// name has to be set and has to be equal to adapters folder name and main file name excluding extension
// adapter will be restarted automatically every time as the configuration changed, e.g system.adapter.template.0
class boseSoundTouch {
    constructor(options) {
        const instance = this;

        options = options || {};
        Object.assign(options, {
            name: adapterName,
            // is called when adapter shuts down - callback has to be called under any circumstances!
            unload: function (callback) {
                instance.onUnload(callback);
            },
            // is called if a subscribed object changes
            objectChange: function (id, obj) {
                instance.onObjectChange(id, obj);
            },
            // is called if a subscribed state changes
            stateChange: function (id, state) {
                instance.onStateChange(id, state);
            },
            // Some message was sent to adapter instance over message box. Used by email, pushover, text2speech, ...
            // message: function(obj) { instance.onMessage(obj); },
            // is called when databases are connected and adapter received configuration.
            // start here!
            ready: function () {
                instance.onReady();
            },
        });

        this.adapter = utils.Adapter(options);
    }

    onUnload(callback) {
        try {
            this.adapter.log.info('cleaned everything up...');
            callback();
        } catch {
            callback();
        }
    }

    onObjectChange(id, obj) {
        // Warning, obj can be null if it was deleted
        this.adapter.log.debug(`objectChange ${id} ${JSON.stringify(obj)}`);
    }

    onStateChange(id, state) {
        // Warning, state can be null if it was deleted
        this.adapter.log.debug(`stateChange ${id} ${JSON.stringify(state)}`);

        const namespace = `${this.adapter.namespace}.`;

        // you can use the ack flag to detect if it is status (true) or command (false)
        if (state && !state.ack) {
            switch (id) {
                case namespace + BOSE_ID_ON.id:
                    this.setState(BOSE_ID_KEY, 'POWER', { ack: false });
                    break;

                case namespace + BOSE_ID_VOLUME.id:
                    this.socket.setValue('volume', '', state.val);
                    break;

                case namespace + BOSE_ID_KEY.id:
                    switch (state.val) {
                        case 'PRESET_1':
                        case 'PRESET_2':
                        case 'PRESET_3':
                        case 'PRESET_4':
                        case 'PRESET_5':
                        case 'PRESET_6':
                            this.socket.setValue('key', 'state="release" sender="Gabbo"', state.val);
                            break;

                        default:
                            this.socket.setValue('key', 'state="press" sender="Gabbo"', state.val);
                            this.socket.setValue('key', 'state="release" sender="Gabbo"', state.val);
                            break;
                    }
                    break;

                case namespace + BOSE_ID_MUTED.id:
                    this.setState(BOSE_ID_KEY, 'MUTE', { ack: false });
                    break;

                case namespace + BOSE_ID_ZONES_ADD_MASTER_OF.id:
                    this.handleMasterOf(state.val, this.socket.addZoneSlave, true);
                    this.setState(BOSE_ID_ZONES_ADD_MASTER_OF, '', { ack: true });
                    break;

                case namespace + BOSE_ID_ZONES_REMOVE_MASTER_OF.id:
                    this.handleMasterOf(state.val, this.socket.removeZoneSlave);
                    this.setState(BOSE_ID_ZONES_REMOVE_MASTER_OF, '', { ack: true });
                    break;

                case namespace + BOSE_ID_ZONES_PLAY_EVERYWHERE.id:
                    if (state.val) {
                        this.setMasterOf();
                        //this.setState(BOSE_ID_ZONES_PLAY_EVERYWHERE, false, {ack: false});
                    } else {
                        this.handleMasterOf('all', this.socket.removeZoneSlave);
                    }
                    break;

                case namespace + BOSE_ID_KEYS_PLAY.id:
                    this.setState(BOSE_ID_KEY, 'PLAY', { ack: false });
                    break;

                case namespace + BOSE_ID_KEYS_PAUSE.id:
                    this.setState(BOSE_ID_KEY, 'PAUSE', { ack: false });
                    break;

                case namespace + BOSE_ID_KEYS_STOP.id:
                    this.setState(BOSE_ID_KEY, 'STOP', { ack: false });
                    break;

                case namespace + BOSE_ID_KEYS_PREV_TRACK.id:
                    this.setState(BOSE_ID_KEY, 'PREV_TRACK', { ack: false });
                    break;

                case namespace + BOSE_ID_KEYS_NEXT_TRACK.id:
                    this.setState(BOSE_ID_KEY, 'NEXT_TRACK', { ack: false });
                    break;

                case namespace + BOSE_ID_KEYS_THUMBS_UP.id:
                    this.setState(BOSE_ID_KEY, 'THUMBS_UP', { ack: false });
                    break;

                case namespace + BOSE_ID_KEYS_THUMBS_DOWN.id:
                    this.setState(BOSE_ID_KEY, 'THUMBS_DOWN', { ack: false });
                    break;

                case namespace + BOSE_ID_KEYS_BOOKMARK.id:
                    this.setState(BOSE_ID_KEY, 'BOOKMARK', { ack: false });
                    break;

                case namespace + BOSE_ID_KEYS_POWER.id:
                    this.setState(BOSE_ID_KEY, 'POWER', { ack: false });
                    break;

                case namespace + BOSE_ID_KEYS_VOLUME_UP.id:
                    this.setState(BOSE_ID_KEY, 'VOLUME_UP', { ack: false });
                    break;

                case namespace + BOSE_ID_KEYS_VOLUME_DOWN.id:
                    this.setState(BOSE_ID_KEY, 'VOLUME_DOWN', { ack: false });
                    break;

                case namespace + BOSE_ID_KEYS_PRESET_1.id:
                    this.setState(BOSE_ID_KEY, 'PRESET_1', { ack: false });
                    break;

                case namespace + BOSE_ID_KEYS_PRESET_2.id:
                    this.setState(BOSE_ID_KEY, 'PRESET_2', { ack: false });
                    break;

                case namespace + BOSE_ID_KEYS_PRESET_3.id:
                    this.setState(BOSE_ID_KEY, 'PRESET_3', { ack: false });
                    break;

                case namespace + BOSE_ID_KEYS_PRESET_4.id:
                    this.setState(BOSE_ID_KEY, 'PRESET_4', { ack: false });
                    break;

                case namespace + BOSE_ID_KEYS_PRESET_5.id:
                    this.setState(BOSE_ID_KEY, 'PRESET_5', { ack: false });
                    break;

                case namespace + BOSE_ID_KEYS_PRESET_6.id:
                    this.setState(BOSE_ID_KEY, 'PRESET_6', { ack: false });
                    break;

                case namespace + BOSE_ID_KEYS_AUX_INPUT.id:
                    this.setState(BOSE_ID_KEY, 'AUX_INPUT', { ack: false });
                    break;

                case namespace + BOSE_ID_KEYS_SHUFFLE_OFF.id:
                    this.setState(BOSE_ID_KEY, 'SHUFFLE_OFF', { ack: false });
                    break;

                case namespace + BOSE_ID_KEYS_SHUFFLE_ON.id:
                    this.setState(BOSE_ID_KEY, 'SHUFFLE_ON', { ack: false });
                    break;

                case namespace + BOSE_ID_KEYS_REPEAT_OFF.id:
                    this.setState(BOSE_ID_KEY, 'REPEAT_OFF', { ack: false });
                    break;

                case namespace + BOSE_ID_KEYS_REPEAT_ONE.id:
                    this.setState(BOSE_ID_KEY, 'REPEAT_ONE', { ack: false });
                    break;

                case namespace + BOSE_ID_KEYS_REPEAT_ALL.id:
                    this.setState(BOSE_ID_KEY, 'REPEAT_ALL', { ack: false });
                    break;

                case namespace + BOSE_ID_KEYS_PLAY_PAUSE.id:
                    this.setState(BOSE_ID_KEY, 'PLAY_PAUSE', { ack: false });
                    break;

                case namespace + BOSE_ID_KEYS_ADD_FAVORITE.id:
                    this.setState(BOSE_ID_KEY, 'ADD_FAVORITE', { ack: false });
                    break;

                case namespace + BOSE_ID_KEYS_REMOVE_FAVORITE.id:
                    this.setState(BOSE_ID_KEY, 'REMOVE_FAVORITE', { ack: false });
                    break;

                default:
                    if (id.includes(namespace + BOSE_ID_SOURCES) && state.val) {
                        this.playSource(id);
                    }
                    break;
            }
            this.adapter.log.debug('ack is not set!');
        }
    }

    onMessage(obj) {
        if (typeof obj == 'object' && obj.message) {
            if (obj.command === 'send') {
                // e.g. send email or pushover or whatever
                this.adapter.log.debug('send command');

                // Send response in callback if required
                if (obj.callback) {
                    this.adapter.sendTo(obj.from, obj.command, 'Message received', obj.callback);
                }
            }
        }
    }

    onError() {
        //this.adapter.log.error('error' + obj);
        const instance = this;
        const interval = this.adapter.config.reconnectTime * 1000;
        if (interval > 0) {
            this.reconnectInterval = setInterval(function () {
                instance._connect();
            }, interval);
        }
    }

    async onReady() {
        await this.initObjects();

        if (!this.adapter.config.address) {
            this.adapter.log.error('No address configured! Please configure the adapter first.');
            return;
        }
        // in this template all states changes inside the adapters namespace are subscribed
        this.socket = new soundtouchsocket(this.adapter);
        this._connect();

        this.adapter.subscribeStates('*');
    }

    _connect() {
        this.adapter.log.debug('connect...');
        clearInterval(this.reconnectInterval);
        const instance = this;

        this.socket.removeAllListeners();
        this.socket.addListener('error', function () {
            instance.onError();
        });

        this.socket
            .connect()
            .then(function (server) {
                instance.socket.addListener('deviceInfo', function (obj) {
                    instance.setDeviceInfo(obj);
                });
                instance.socket.addListener('volume', function (obj) {
                    instance.setVolume(obj);
                });
                instance.socket.addListener('nowPlaying', function (obj) {
                    instance.setNowPlaying(obj);
                });
                instance.socket.addListener('presets', function (obj) {
                    instance.setPresets(obj);
                });
                instance.socket.addListener('zones', function (obj) {
                    instance.setZone(obj);
                });
                instance.socket.addListener('sources', function (obj) {
                    instance.setSources(obj);
                });
                instance.socket.updateAll(server);
            })
            .catch(function (err) {
                // error here
                instance.adapter.error(err);
            });
    }

    _getId(obj, arg) {
        return arg ? format(obj.id, arg) : obj.id;
    }

    setObject(obj, arg) {
        const config = {
            type: 'state',
            common: {
                name: '',
                type: '',
                role: '',
                read: true,
                write: false,
            },
            native: {},
        };
        switch (obj.type) {
            case 'boolean':
                config.common.type = 'boolean';
                config.common.role = 'indicator';
                break;

            case 'integer':
                config.common.type = 'number';
                config.common.role = 'level';
                break;

            case 'string':
                config.common.type = 'string';
                config.common.role = 'text';
                break;

            case 'url':
                config.common.type = 'string';
                config.common.role = 'text.url';
                break;

            case 'playButton':
                config.common.type = 'boolean';
                config.common.role = 'button.play';
                break;

            default:
                break;
        }

        if (obj.write) {
            config.common.write = true;
        }

        if (obj.role) {
            config.common.role = obj.role;
        }

        return this.adapter.setObjectNotExistsAsync(this._getId(obj, arg), config);
    }

    setState(obj, value, optional) {
        const arg = optional && optional.arg != null ? optional.arg : null;
        const ack = optional && optional.ack != null ? optional.ack : true;
        this.adapter.setState(this._getId(obj, arg), { val: value, ack: ack });
    }

    async initObjects() {
        await this.setObject(BOSE_ID_KEY);
        await this.setObject(BOSE_ID_VOLUME);
        await this.setObject(BOSE_ID_MUTED);
        await this.setObject(BOSE_ID_ON);
        await this.setObject(BOSE_ID_ZONES_MEMBER_OF);

        await this.setObject(BOSE_ID_ZONES_MASTER_OF);

        await this.setObject(BOSE_ID_ZONES_ADD_MASTER_OF);

        await this.setObject(BOSE_ID_ZONES_REMOVE_MASTER_OF);

        await this.setObject(BOSE_ID_ZONES_PLAY_EVERYWHERE);

        for (let i = 1; i <= 6; i++) {
            await this.setObject(BOSE_ID_PRESET_SOURCE, i);
            await this.setObject(BOSE_ID_PRESET_NAME, i);
            await this.setObject(BOSE_ID_PRESET_ICON, i);
        }

        await this.setObject(BOSE_ID_NOW_PLAYING_SOURCE);
        await this.setObject(BOSE_ID_NOW_PLAYING_TRACK);
        await this.setObject(BOSE_ID_NOW_PLAYING_ARTIST);
        await this.setObject(BOSE_ID_NOW_PLAYING_ALBUM);
        await this.setObject(BOSE_ID_NOW_PLAYING_STATION);
        await this.setObject(BOSE_ID_NOW_PLAYING_ART);
        await this.setObject(BOSE_ID_NOW_PLAYING_GENRE);
        await this.setObject(BOSE_ID_NOW_PLAYING_TIME);
        await this.setObject(BOSE_ID_NOW_PLAYING_TOTAL);
        await this.setObject(BOSE_ID_NOW_PLAYING_STATUS);
        await this.setObject(BOSE_ID_NOW_PLAYING_REPEAT);
        await this.setObject(BOSE_ID_NOW_PLAYING_SHUFFLE);

        await this.setObject(BOSE_ID_INFO_NAME);
        await this.setObject(BOSE_ID_INFO_TYPE);
        await this.setObject(BOSE_ID_INFO_MAC_ADDRESS);
        await this.setObject(BOSE_ID_INFO_IP_ADDRESS);

        await this.setObject(BOSE_ID_KEYS_PLAY);
        await this.setObject(BOSE_ID_KEYS_PAUSE);
        await this.setObject(BOSE_ID_KEYS_STOP);
        await this.setObject(BOSE_ID_KEYS_PREV_TRACK);
        await this.setObject(BOSE_ID_KEYS_NEXT_TRACK);
        await this.setObject(BOSE_ID_KEYS_THUMBS_UP);
        await this.setObject(BOSE_ID_KEYS_THUMBS_DOWN);
        await this.setObject(BOSE_ID_KEYS_BOOKMARK);
        await this.setObject(BOSE_ID_KEYS_POWER);
        await this.setObject(BOSE_ID_KEYS_VOLUME_UP);
        await this.setObject(BOSE_ID_KEYS_VOLUME_DOWN);
        await this.setObject(BOSE_ID_KEYS_PRESET_1);
        await this.setObject(BOSE_ID_KEYS_PRESET_2);
        await this.setObject(BOSE_ID_KEYS_PRESET_3);
        await this.setObject(BOSE_ID_KEYS_PRESET_4);
        await this.setObject(BOSE_ID_KEYS_PRESET_5);
        await this.setObject(BOSE_ID_KEYS_PRESET_6);
        await this.setObject(BOSE_ID_KEYS_AUX_INPUT);
        await this.setObject(BOSE_ID_KEYS_SHUFFLE_OFF);
        await this.setObject(BOSE_ID_KEYS_SHUFFLE_ON);
        await this.setObject(BOSE_ID_KEYS_REPEAT_OFF);
        await this.setObject(BOSE_ID_KEYS_REPEAT_ONE);
        await this.setObject(BOSE_ID_KEYS_REPEAT_ALL);
        await this.setObject(BOSE_ID_KEYS_PLAY_PAUSE);
        await this.setObject(BOSE_ID_KEYS_ADD_FAVORITE);
        await this.setObject(BOSE_ID_KEYS_REMOVE_FAVORITE);
    }

    setDeviceInfo(obj) {
        this.setState(BOSE_ID_INFO_NAME, obj.name);
        this.setState(BOSE_ID_INFO_TYPE, obj.type);
        this.setState(BOSE_ID_INFO_MAC_ADDRESS, obj.macAddress);
        this.setState(BOSE_ID_INFO_IP_ADDRESS, obj.ipAddress);
        this.adapter.ipAddress = obj.ipAddress;
        this.adapter.macAddress = obj.macAddress;
    }

    setVolume(obj) {
        this.setState(BOSE_ID_VOLUME, parseInt(obj.volume));
        this.setState(BOSE_ID_MUTED, !!obj.muted);
    }

    setNowPlaying(obj) {
        this.setState(BOSE_ID_NOW_PLAYING_SOURCE, obj.source);
        this.setState(BOSE_ID_NOW_PLAYING_TRACK, obj.track);
        this.setState(BOSE_ID_NOW_PLAYING_ARTIST, obj.artist);
        this.setState(BOSE_ID_NOW_PLAYING_ALBUM, obj.album);
        this.setState(BOSE_ID_NOW_PLAYING_STATION, obj.station);
        this.setState(BOSE_ID_NOW_PLAYING_ART, obj.art);
        this.setState(BOSE_ID_NOW_PLAYING_GENRE, obj.genre);
        this.setState(BOSE_ID_NOW_PLAYING_TOTAL, parseInt(obj.total));
        this.setState(BOSE_ID_NOW_PLAYING_STATUS, obj.playStatus);
        this.setState(BOSE_ID_NOW_PLAYING_REPEAT, obj.repeatSetting);
        if (obj.shuffleSetting) {
            //Convert Shuffle to bool
            obj.shuffleSetting = obj.shuffleSetting === 'SHUFFLE_ON';
        }
        this.setState(BOSE_ID_NOW_PLAYING_SHUFFLE, obj.shuffleSetting);
        if (obj.time && obj.time != '' && obj.playStatus === 'PLAY_STATE') {
            startPlayTimer(this, obj.time);
        } else {
            stopPlayTimer(this, obj.time);
        }
        this.setState(BOSE_ID_ON, obj.source !== 'STANDBY');

        if (obj.contentItem && this.availableSources) {
            const source = this.availableSources.find(function (source) {
                return source.source === obj.source;
            });
            if (source) {
                source.contentItem = obj.contentItem;
            }
        }

        function startPlayTimer(instance, time) {
            if (playTimer) {
                clearInterval(playTimer);
            }
            playTimerTime = time;
            instance.setState(BOSE_ID_NOW_PLAYING_TIME, parseInt(playTimerTime));
            playTimer = setInterval(function () {
                playTimerTime = parseInt(playTimerTime) + 1;
                instance.setState(BOSE_ID_NOW_PLAYING_TIME, playTimerTime);
            }, 1000);
        }

        function stopPlayTimer(instance, time) {
            if (playTimer) {
                clearInterval(playTimer);
            }
            playTimer = false;
            playTimerTime = time;
            instance.setState(BOSE_ID_NOW_PLAYING_TIME, parseInt(playTimerTime));
        }
    }

    setPresets(obj) {
        //var presets = JSON.parse(data);
        for (let i = 0; i < 6; i++) {
            let preset = {
                source: '',
                name: '',
                iconUrl: '',
            };
            if (obj[i]) {
                preset = obj[i];
            }

            this.setState(BOSE_ID_PRESET_SOURCE, preset.source, { arg: i + 1 });
            this.setState(BOSE_ID_PRESET_NAME, preset.name, { arg: i + 1 });
            this.setState(BOSE_ID_PRESET_ICON, preset.iconUrl, { arg: i + 1 });
        }
    }

    setZone(obj) {
        const instance = this;
        instance.masterSlaveData = {
            master: {
                ip: this.adapter.ipAddress,
                mac: this.adapter.macAddress,
            },
            slave: [],
        };
        if (!obj || obj === '') {
            this.setState(BOSE_ID_ZONES_MEMBER_OF, '', { ack: true });
            this.setState(BOSE_ID_ZONES_MASTER_OF, '', { ack: true });
            this.setState(BOSE_ID_ZONES_PLAY_EVERYWHERE, false, { ack: true });
        } else {
            if (obj.$.master === this.adapter.macAddress) {
                const members = [];
                if (obj.member && obj.member.length > 0) {
                    obj.member.forEach(member => {
                        members.push(member._);
                    });
                } else {
                    members.push(obj.member._);
                }
                this.setState(BOSE_ID_ZONES_MASTER_OF, members.join(';'), { ack: true });
                this.setState(BOSE_ID_ZONES_MEMBER_OF, '', { ack: true });
                //Find out, if all speakers are members (playEverywhere)
                this.adapter.getObjectView(
                    'system',
                    'instance',
                    {
                        startkey: 'system.adapter.bosesoundtouch.',
                        endkey: 'system.adapter.bosesoundtouch.\u9999',
                    },
                    function (err, doc) {
                        if (doc && doc.rows && doc.rows.length) {
                            const toDoList = [];
                            for (let i = 0; i < doc.rows.length; i++) {
                                const obj = doc.rows[i].value;
                                if (obj.native.address !== instance.adapter.ipAddress) {
                                    const systemId = doc.rows[i].id.split('.');
                                    const index = systemId[systemId.length - 1];
                                    const namespace = `${systemId[systemId.length - 2]}.${index}.`;
                                    toDoList.push(namespace + BOSE_ID_INFO_IP_ADDRESS.id);
                                    toDoList.push(namespace + BOSE_ID_INFO_MAC_ADDRESS.id);
                                }
                            }
                            instance._collectPlayEverywhereData(
                                toDoList,
                                instance._collectPlayEverywhereDataFinished_checkPlayEverywhere,
                                members,
                            );
                        } else {
                            instance.adapter.log.debug(`No objects found: ${err}`);
                        }
                    },
                );
            } else {
                this.setState(BOSE_ID_ZONES_MASTER_OF, '', { ack: true });
                this.setState(BOSE_ID_ZONES_MEMBER_OF, obj.master, { ack: true });
                this.setState(BOSE_ID_ZONES_PLAY_EVERYWHERE, false, { ack: true });
            }
        }
    }

    _collectPlayEverywhereDataFinished_checkPlayEverywhere(instance, filterList) {
        instance.adapter.log.warn(`checkPlayEverywhere: ${JSON.stringify(filterList)}`);
        instance.adapter.log.warn(`checkPlayEverywhere msd: ${JSON.stringify(instance.masterSlaveData)}`);
        let playEverywhere = true;
        const items = instance.masterSlaveData.slave;
        for (let index = 0; index < items.length; index += 2) {
            let type = items[index].id.split('.');
            type = type[type.length - 1];
            if (type === 'ipAddress') {
                const slaveMac = items[index + 1].value;
                if (filterList.indexOf(slaveMac) === -1) {
                    playEverywhere = false;
                    break;
                }
            }
        }
        instance.setState(BOSE_ID_ZONES_PLAY_EVERYWHERE, playEverywhere, { ack: true });
    }

    async setSources(obj) {
        this.availableSources = [];
        for (const i in obj) {
            const source = obj[i];

            if (source.status === 'READY') {
                await this.setObject(BOSE_ID_SOURCES_SOURCE, source.name);
                this.setState(BOSE_ID_SOURCES_SOURCE, false, { arg: source.name });
                // store source + sourceAccount in array, sourceAccount is needed to select source
                this.availableSources.push({
                    source: source.name,
                    sourceAccount: source.sourceAccount,
                    isLocal: source.isLocal,
                });
            }
        }

        // remove unavailable sources
        const instance = this;
        this.adapter.getStates(`${BOSE_ID_SOURCES}.*`, function (err, states) {
            for (const id in states) {
                const state = id.split('.').pop();
                const source = instance.availableSources.find(function (element) {
                    return element.source === state;
                });
                if (!source) {
                    instance.adapter.deleteState('', `${instance.adapter.namespace}.${BOSE_ID_SOURCES}`, state);
                }
            }
        });
    }

    _collectPlayEverywhereData(data, callback, filterList) {
        const instance = this;
        if (data) {
            if (!data.length) {
                callback(instance, filterList);
            } else {
                const id = data.shift();
                const slave = {};
                slave.id = id;
                this.adapter.getForeignState(id, function (err, state) {
                    if (err) {
                        instance.adapter.log.error(err);
                    } else {
                        slave.value = state.val;
                        instance.masterSlaveData.slave.push(slave);
                        instance._collectPlayEverywhereData(data, callback, filterList);
                    }
                });
            }
        }
    }

    _collectPlayEverywhereFinished_setMasterOf(instance, filterList) {
        const slaveList = [];
        const items = instance.masterSlaveData.slave;
        for (let index = 0; index < items.length; index += 2) {
            let type = items[index].id.split('.');
            type = type[type.length - 1];
            if (type === 'ipAddress') {
                const slave = {
                    ip: items[index].value,
                    mac: items[index + 1].value,
                };
                if (!filterList || filterList.find(filterMac => filterMac === slave.mac)) {
                    slaveList.push(slave);
                }
            }
        }
        instance.socket.createZone(instance.masterSlaveData.master, slaveList);
    }

    handleMasterOf(setMacAddresses, setZoneFunction, add) {
        const instance = this;
        instance.adapter.getState(
            `${this.adapter.namespace}.${BOSE_ID_ZONES_MASTER_OF.id}`,
            function (err, stateMasterOf) {
                if (err) {
                    instance.adapter.log.error(err);
                } else {
                    if (typeof stateMasterOf == 'undefined' || stateMasterOf === null || stateMasterOf.val === '') {
                        //is not master
                        if (add) {
                            if (setMacAddresses === 'all') {
                                instance.setMasterOf();
                            } else {
                                instance.setMasterOf(setMacAddresses);
                            }
                        }
                    } else {
                        //is master
                        const masterOf = stateMasterOf.val.split(';');
                        if (add) {
                            if (setMacAddresses === 'all') {
                                instance.setMasterOf();
                            } else {
                                const setSlaves = setMacAddresses
                                    .split(';')
                                    .filter(setSlave => !masterOf.some(masterOfSlave => setSlave === masterOfSlave));
                                setSlaves.forEach(setSlave => instance._setZoneSlave(setSlave, setZoneFunction));
                            }
                        } else {
                            if (setMacAddresses === 'all') {
                                masterOf.forEach(setSlave => instance._setZoneSlave(setSlave, setZoneFunction));
                            } else {
                                const setSlaves = setMacAddresses
                                    .split(';')
                                    .filter(setSlave => masterOf.some(masterOfSlave => setSlave === masterOfSlave));
                                setSlaves.forEach(setSlave => instance._setZoneSlave(setSlave, setZoneFunction));
                            }
                        }
                    }
                }
            },
        );
    }

    _setZoneSlave(slaveMacAddress, setZoneFunction) {
        const instance = this;
        instance.masterSlaveData = {
            master: {
                ip: this.adapter.ipAddress,
                mac: this.adapter.macAddress,
            },
            slave: [],
        };
        this.adapter.getObjectView(
            'system',
            'instance',
            {
                startkey: 'system.adapter.bosesoundtouch.',
                endkey: 'system.adapter.bosesoundtouch.\u9999',
            },
            function (err, doc) {
                if (doc && doc.rows && doc.rows.length) {
                    doc.rows.forEach(row => {
                        if (row.value.native.address !== instance.adapter.ipAddress) {
                            const systemId = row.id.split('.');
                            const index = systemId[systemId.length - 1];
                            const namespace = `${systemId[systemId.length - 2]}.${index}.`;

                            instance.adapter.getForeignState(
                                namespace + BOSE_ID_INFO_MAC_ADDRESS.id,
                                function (err, stateMacAddress) {
                                    if (err) {
                                        instance.adapter.log.error(err);
                                    } else {
                                        if (stateMacAddress.val === slaveMacAddress) {
                                            instance.adapter.getForeignState(
                                                namespace + BOSE_ID_INFO_IP_ADDRESS.id,
                                                function (err, stateIpAddress) {
                                                    if (err) {
                                                        instance.adapter.log.error(err);
                                                    } else {
                                                        setZoneFunction(
                                                            { mac: instance.adapter.macAddress },
                                                            { ip: stateIpAddress.val, mac: stateMacAddress.val },
                                                            instance.socket,
                                                        );
                                                    }
                                                },
                                            );
                                        }
                                    }
                                },
                            );
                        }
                    });
                } else {
                    instance.adapter.log.debug(`No objects found: ${err}`);
                }
            },
        );
    }

    setMasterOf(setMasterOf) {
        const instance = this;
        instance.masterSlaveData = {
            master: {
                ip: this.adapter.ipAddress,
                mac: this.adapter.macAddress,
            },
            slave: [],
        };
        this.adapter.getObjectView(
            'system',
            'instance',
            {
                startkey: 'system.adapter.bosesoundtouch.',
                endkey: 'system.adapter.bosesoundtouch.\u9999',
            },
            function (err, doc) {
                if (doc && doc.rows && doc.rows.length) {
                    const toDoList = [];
                    for (let i = 0; i < doc.rows.length; i++) {
                        const obj = doc.rows[i].value;
                        if (obj.native.address !== instance.adapter.ipAddress) {
                            const systemId = doc.rows[i].id.split('.');
                            const index = systemId[systemId.length - 1];
                            const namespace = `${systemId[systemId.length - 2]}.${index}.`;
                            toDoList.push(namespace + BOSE_ID_INFO_IP_ADDRESS.id);
                            toDoList.push(namespace + BOSE_ID_INFO_MAC_ADDRESS.id);
                        }
                    }
                    instance._collectPlayEverywhereData(
                        toDoList,
                        instance._collectPlayEverywhereFinished_setMasterOf,
                        setMasterOf !== undefined ? setMasterOf.split(';') : undefined,
                    );
                } else {
                    instance.adapter.log.debug(`No objects found: ${err}`);
                }
            },
        );
    }

    playSource(id) {
        id = id.split('.');
        id = id[id.length - 1];
        const source = this.availableSources.find(function (obj) {
            return obj.source === id;
        });
        // don't switch to on-local source as long as contentItem object (sent with now playing info) has received
        // TODO: persist contentItem objects
        if (source && (source.isLocal || source.contentItem)) {
            this.socket.playSource(source.source, source.sourceAccount, source.contentItem);
        }
        this.setState(BOSE_ID_SOURCES_SOURCE, false, { arg: id });
    }
}

function startAdapter(options) {
    return new boseSoundTouch(options);
}

// If started as allInOne/compact mode => return function to create instance
if (module && module.parent) {
    module.exports = startAdapter;
} else {
    // or start the instance directly
    startAdapter();
}
