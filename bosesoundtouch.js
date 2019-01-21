/* jshint -W097 */
// jshint strict:false
/* jslint node: true */
/* jslint esversion: 6 */

'use strict';

const BOSE_ID_ON                   = { id: 'on',             type: 'boolean', write: true };
const BOSE_ID_KEY                  = { id: 'key',            type: 'string',  write: true };
const BOSE_ID_VOLUME               = { id: 'volume',         type: 'integer', write: true };
const BOSE_ID_MUTED                = { id: 'muted',          type: 'boolean', write: true };

const BOSE_ID_NOW_PLAYING = 'nowPlaying.';
const BOSE_ID_NOW_PLAYING_SOURCE  = { id: BOSE_ID_NOW_PLAYING + 'source',  type: 'string' };
const BOSE_ID_NOW_PLAYING_TRACK   = { id: BOSE_ID_NOW_PLAYING + 'track',   type: 'string' };
const BOSE_ID_NOW_PLAYING_ARTIST  = { id: BOSE_ID_NOW_PLAYING + 'artist',  type: 'string' };
const BOSE_ID_NOW_PLAYING_ALBUM   = { id: BOSE_ID_NOW_PLAYING + 'album',   type: 'string' };
const BOSE_ID_NOW_PLAYING_STATION = { id: BOSE_ID_NOW_PLAYING + 'station', type: 'string' };
const BOSE_ID_NOW_PLAYING_ART     = { id: BOSE_ID_NOW_PLAYING + 'art',     type: 'string' };
const BOSE_ID_NOW_PLAYING_GENRE   = { id: BOSE_ID_NOW_PLAYING + 'genre',   type: 'string' };

const BOSE_ID_PRESETS = 'presets.';
const BOSE_ID_PRESET_SOURCE = { id: BOSE_ID_PRESETS + '{}.source',  type:'string' };
const BOSE_ID_PRESET_NAME   = { id: BOSE_ID_PRESETS + '{}.name',    type:'string' };
const BOSE_ID_PRESET_ICON   = { id: BOSE_ID_PRESETS + '{}.iconUrl', type:'url' };

const BOSE_ID_ZONES = 'zones.';
const BOSE_ID_ZONES_MEMBER_OF        = { id: BOSE_ID_ZONES + 'memberOf',       type: 'string' };
const BOSE_ID_ZONES_MASTER_OF        = { id: BOSE_ID_ZONES + 'masterOf',       type: 'string' };
const BOSE_ID_ZONES_ADD_MASTER_OF    = { id: BOSE_ID_ZONES + 'addMasterOf',    type: 'string', write: true };
const BOSE_ID_ZONES_REMOVE_MASTER_OF = { id: BOSE_ID_ZONES + 'removeMasterOf', type: 'string', write: true};
const BOSE_ID_ZONES_PLAY_EVERYWHERE  = { id: BOSE_ID_ZONES + 'playEverywhere', type: 'boolean', write: true };

const BOSE_ID_DEVICE_INFO = 'deviceInfo.';
const BOSE_ID_INFO_NAME        = { id: BOSE_ID_DEVICE_INFO + 'name',       type:'string' };
const BOSE_ID_INFO_TYPE        = { id: BOSE_ID_DEVICE_INFO + 'type',       type:'string' };
const BOSE_ID_INFO_MAC_ADDRESS = { id: BOSE_ID_DEVICE_INFO + 'macAddress', type:'string' };
const BOSE_ID_INFO_IP_ADDRESS  = { id: BOSE_ID_DEVICE_INFO + 'ipAddress',  type:'string' };

const BOSE_ID_SOURCES = 'sources.';
const BOSE_ID_SOURCE_NAME               = { id: BOSE_ID_SOURCES + '{}.name',             type:'string' };
const BOSE_ID_SOURCE_SOURCE             = { id: BOSE_ID_SOURCES + '{}.source',           type:'string' };
const BOSE_ID_SOURCE_IS_LOCAL           = { id: BOSE_ID_SOURCES + '{}.isLocal',          type:'boolean' };
const BOSE_ID_SOURCE_MULTI_ROOM_ALLOWED = { id: BOSE_ID_SOURCES + '{}.multiRoomAllowed', type:'boolean' };
const BOSE_ID_SOURCE_STATUS             = { id: BOSE_ID_SOURCES + '{}.status',           type:'string' };

// you have to require the utils module and call adapter function
var format = require('string-format');
var utils = require('@iobroker/adapter-core'); // Get common adapter utils
var soundtouchsocket = require(__dirname + '/soundtouchsocket');
//var bosestates = require(__dirname + '/bosestates');

// you have to call the adapter function and pass a options object
// name has to be set and has to be equal to adapters folder name and main file name excluding extension
// adapter will be restarted automatically every time as the configuration changed, e.g system.adapter.template.0
class boseSoundTouch {
    constructor() {
        var instance = this;

        this.adapter = utils.Adapter('bosesoundtouch');

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
        this.adapter.log.debug('objectChange ' + id + ' ' + JSON.stringify(obj));
    }

    onStateChange(id, state) {
        // Warning, state can be null if it was deleted
        this.adapter.log.debug('stateChange ' + id + ' ' + JSON.stringify(state));

        var namespace = this.adapter.namespace + '.';

        // you can use the ack flag to detect if it is status (true) or command (false)
        if (state && !state.ack) {
            switch (id) {
                case namespace + BOSE_ID_ON:
                    this.adapter.setState(BOSE_ID_KEY, 'POWER');
                    break;

                case namespace + BOSE_ID_VOLUME:
                    this.socket.setValue('volume', '', state.val);
                    break;

                case namespace + BOSE_ID_KEY:
                    this.socket.setValue('key', 'state="press" sender="Gabbo"', state.val);
                    this.socket.setValue('key', 'state="release" sender="Gabbo"', state.val);
                    break;

                case namespace + BOSE_ID_MUTED:
                    this.adapter.setState(BOSE_ID_KEY, 'MUTE');
                    break;

                case namespace + BOSE_ID_ZONES_ADD_MASTER_OF:
                    this.handleMasterOf(state.val, this.socket.addZoneSlave, true);
                    this.adapter.setState(BOSE_ID_ZONES_ADD_MASTER_OF, {val: '', ack: true});
                    break;

                case namespace + BOSE_ID_ZONES_REMOVE_MASTER_OF:
                    this.handleMasterOf(state.val, this.socket.removeZoneSlave);
                    this.adapter.setState(BOSE_ID_ZONES_REMOVE_MASTER_OF, {val: '', ack: true});
                    break;

                case namespace + BOSE_ID_ZONES_PLAY_EVERYWHERE:
                    if (state.val) {
                        this.setMasterOf();
                        this.adapter.setState(BOSE_ID_ZONES_PLAY_EVERYWHERE, false);
                    }
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

    onError() {
        //this.adapter.log.error('error' + obj);
        var instance = this;
        var interval = this.adapter.config.reconnectTime * 1000;
        if (interval > 0) {
            this.reconnectInterval = setInterval(function() { instance._connect(); }, interval);
        }
    }

    onReady() {
        this.initObjects();
        this.adapter.subscribeStates('*');

        // in this template all states changes inside the adapters namespace are subscribed
        this.socket = new soundtouchsocket(this.adapter);
        this._connect();
    }

    _connect() {
        this.adapter.log.debug('connect...');
        clearInterval(this.reconnectInterval);
        var instance = this;

        this.socket.removeAllListeners();
        this.socket.addListener('error', function() { instance.onError(); });

        this.socket.connect().then( function(server) {
            instance.socket.addListener('deviceInfo', function(obj) { instance.setDeviceInfo(obj); });
            instance.socket.addListener('volume', function(obj) { instance.setVolume(obj); });
            instance.socket.addListener('nowPlaying', function(obj) { instance.setNowPlaying(obj); });
            instance.socket.addListener('presets', function(obj) { instance.setPresets(obj); });
            instance.socket.addListener('zones', function(obj) { instance.setZone(obj); });
            instance.socket.addListener('sources', function(obj) { instance.setSources(obj); });
            instance.socket.updateAll(server);
        }).catch(function(err) {
            // error here
            instance.adapter.error(err);
        });
    }

    _getId(obj, arg) {
        return arg ? format(obj.id, arg) : obj.id;
    }

    setObject(obj, arg) {
        var config = {
            type: 'state',
            common: {
                name: '',
                type: '',
                role: '',
                read: true,
                write: false
            },
            native: {}
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

            default:
                break;
        }

        if (obj.write) {
            config.common.write = true;
        }

        this.adapter.setObjectNotExists(this._getId(obj, arg), config);
    }

    setState(obj, arg, value) {
        this.adapter.setState(this._getId(obj, arg), {val: value, ack: true});
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

        this.adapter.setObjectNotExists(BOSE_ID_ZONES_MEMBER_OF, {
            type: 'state',
            common: {
                name: 'member of',
                type: 'string',
                role: 'text',
                read: true,
                write: false
            },
            native: {}
        });

        this.adapter.setObjectNotExists(BOSE_ID_ZONES_MASTER_OF, {
            type: 'state',
            common: {
                name: 'master of',
                type: 'string',
                role: 'text',
                read: true,
                write: false
            },
            native: {}
        });

        this.adapter.setObjectNotExists(BOSE_ID_ZONES_ADD_MASTER_OF, {
            type: 'state',
            common: {
                name: 'add master of',
                type: 'string',
                role: 'text',
                read: true,
                write: true
            },
            native: {}
        });

        this.adapter.setObjectNotExists(BOSE_ID_ZONES_REMOVE_MASTER_OF, {
            type: 'state',
            common: {
                name: 'remove master of',
                type: 'string',
                role: 'text',
                read: true,
                write: true
            },
            native: {}
        });

        this.adapter.setObjectNotExists(BOSE_ID_ZONES_PLAY_EVERYWHERE, {
            type: 'state',
            common: {
                name: 'play everywhere',
                type: 'boolean',
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
            this.adapter.setObjectNotExists(format(BOSE_ID_PRESET_SOURCE.id, i), presetsConfig);
            this.adapter.setObjectNotExists(format(BOSE_ID_PRESET_NAME.id, i),   presetsConfig);
            presetsConfig.common.role = 'text.url';
            this.adapter.setObjectNotExists(format(BOSE_ID_PRESET_ICON.id, i),   presetsConfig);
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
        this.adapter.setObjectNotExists(BOSE_ID_NOW_PLAYING_ART,     nowPlayingConfig);
        this.adapter.setObjectNotExists(BOSE_ID_NOW_PLAYING_GENRE,   nowPlayingConfig);

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
        this.adapter.setObjectNotExists(BOSE_ID_INFO_IP_ADDRESS, deviceInfoConfig);
    }

    setDeviceInfo(obj) {
        this.adapter.setState(BOSE_ID_INFO_NAME, {val: obj.name, ack: true});
        this.adapter.setState(BOSE_ID_INFO_TYPE, {val: obj.type, ack: true});
        this.adapter.setState(BOSE_ID_INFO_MAC_ADDRESS, {val: obj.macAddress, ack: true});
        this.adapter.setState(BOSE_ID_INFO_IP_ADDRESS, {val: this.adapter.config.address, ack:true});
        this.adapter.ipAddress = this.adapter.config.address;
        this.adapter.macAddress = obj.macAddress;
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
        this.adapter.setState(BOSE_ID_NOW_PLAYING_ART, {val: obj.art, ack: true});
        this.adapter.setState(BOSE_ID_NOW_PLAYING_GENRE, {val: obj.genre, ack: true});

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

            this.adapter.setState(format(BOSE_ID_PRESET_SOURCE.id, i+1), {val: preset.source, ack: true});
            this.adapter.setState(format(BOSE_ID_PRESET_NAME.id, i+1), {val: preset.name, ack: true});
            this.adapter.setState(format(BOSE_ID_PRESET_ICON.id, i+1), {val: preset.iconUrl, ack: true});
        }
    }

    setZone(obj) {
        if (!obj || obj === '') {
            this.adapter.setState(BOSE_ID_ZONES_MEMBER_OF, {val: '', ack: true});
            this.adapter.setState(BOSE_ID_ZONES_MASTER_OF, {val: '', ack: true});
        }
        else {
            if (obj.master === this.adapter.macAddress) {
                let members = [];
                if (obj.member && obj.member.length > 0) {
                    obj.member.forEach(member => {
                        members.push(member._);
                    });
                }
                else {
                    members.push(obj.member._);
                }
                this.adapter.setState(BOSE_ID_ZONES_MASTER_OF, {val: members.join(';'), ack: true});
                this.adapter.setState(BOSE_ID_ZONES_MEMBER_OF, {val: '', ack: true});
            }
            else {
                this.adapter.setState(BOSE_ID_ZONES_MASTER_OF, {val: '', ack: true});
                this.adapter.setState(BOSE_ID_ZONES_MEMBER_OF, {val: obj.master, ack: true});
            }
        }
    }

    setSources(obj) {
        /*const config = {
            type: 'state',
            common: {
                //name: '',
                type: '',
                read: true,
                write: false
            },
            native: {}
        };*/
        for (var i in obj) {
            var source = obj[i];

            /*config.common.type = 'string';
            this.adapter.setObjectNotExists(format(BOSE_ID_SOURCE_NAME, i), config);
            this.adapter.setState(format(BOSE_ID_SOURCE_NAME, i), {val: source.name, ack: true});

            this.adapter.setObjectNotExists(format(BOSE_ID_SOURCE_SOURCE, i), config);
            this.adapter.setState(format(BOSE_ID_SOURCE_SOURCE, i), {val: source.source, ack: true});

            this.adapter.setObjectNotExists(format(BOSE_ID_SOURCE_STATUS, i), config);
            this.adapter.setState(format(BOSE_ID_SOURCE_STATUS, i), {val: source.status, ack: true});

            config.common.type = 'boolean';
            this.adapter.setObjectNotExists(format(BOSE_ID_SOURCE_IS_LOCAL, i), config);
            this.adapter.setState(format(BOSE_ID_SOURCE_IS_LOCAL, i), {val: source.isLocal, ack: true});
            this.adapter.setObjectNotExists(format(BOSE_ID_SOURCE_MULTI_ROOM_ALLOWED, i), config);
            this.adapter.setState(format(BOSE_ID_SOURCE_MULTI_ROOM_ALLOWED, i), {val: source.multiRoomAllowed, ack: true});*/

            this.setObject(BOSE_ID_SOURCE_NAME, i);
            this.setState(BOSE_ID_SOURCE_NAME, i, source.name);

            this.setObject(BOSE_ID_SOURCE_SOURCE, i);
            this.setState(BOSE_ID_SOURCE_SOURCE, i, source.source);

            this.setObject(BOSE_ID_SOURCE_STATUS, i);
            this.setState(BOSE_ID_SOURCE_STATUS, i, source.status);

            this.setObject(BOSE_ID_SOURCE_IS_LOCAL, i);
            this.setState(BOSE_ID_SOURCE_IS_LOCAL, i, source.isLocal);

            this.setObject(BOSE_ID_SOURCE_MULTI_ROOM_ALLOWED, i);
            this.setState(BOSE_ID_SOURCE_MULTI_ROOM_ALLOWED, i, source.multiRoomAllowed);

            //this.adapter.log.debug('source:' + JSON.stringify(source));
        }
    }

    _collectPlayEverywhereData(data, callback, filterList) {
        var instance = this;
        if (data) {
            if (data.length == 0) {
                callback(instance, filterList);
            }
            else {
                var id = data.shift();
                var slave = {};
                slave.id = id;
                this.adapter.getForeignState(id, function(err, state) {
                    if (err) {
                        instance.adapter.log.error(err);
                    }
                    else {
                        slave.value = state.val;
                        instance.masterSlaveData.slave.push(slave);
                        instance._collectPlayEverywhereData(data, callback, filterList);
                    }
                });
            }

        }
    }

    _collectPlayEverywhereFinished(instance, filterList) {
        var slaveList = [];
        var items = instance.masterSlaveData.slave;
        for (let index = 0; index < items.length; index += 2) {
            var type = items[index].id.split('.');
            type = type[type.length - 1];
            if (type === 'ipAddress') {
                var slave = {
                    ip: items[index].value,
                    mac: items[index +1].value
                };
                if (!filterList || filterList.find(filterMac => filterMac === slave.mac)) {
                    slaveList.push(slave);
                }
            }
        }
        instance.socket.createZone(instance.masterSlaveData.master, slaveList);
    }

    handleMasterOf(setMacAddresses, setZoneFunction, add) {
        var instance = this;
        instance.adapter.getState(BOSE_ID_ZONES_MASTER_OF, function(err, stateMasterOf) {
            if (err) {
                instance.adapter.log.error(err);
            }
            else {
                if (stateMasterOf.val === '') {
                    if (add) {
                        instance.setMasterOf(setMacAddresses);
                    }
                    return;
                }
                else {
                    const masterOf = stateMasterOf.val.split(';');
                    if (add) {
                        const setSlaves = setMacAddresses.split(';').filter(setSlave => !masterOf.some(masterOfSlave => setSlave === masterOfSlave));
                        setSlaves.forEach(setSlave => instance._setZoneSlave(setSlave, setZoneFunction));
                    }
                    else {
                        const setSlaves = setMacAddresses.split(';').filter(setSlave => masterOf.some(masterOfSlave => setSlave === masterOfSlave));
                        setSlaves.forEach(setSlave => instance._setZoneSlave(setSlave, setZoneFunction));
                    }
                }
            }
        });
    }

    _setZoneSlave(slaveMacAddress, setZoneFunction) {
        var instance = this;
        instance.masterSlaveData = {
            master: {
                ip: this.adapter.ipAddress,
                mac: this.adapter.macAddress
            },
            slave: []
        };
        this.adapter.objects.getObjectView(
            'system', 'instance', {
                startkey: 'system.adapter.bosesoundtouch.',
                endkey: 'system.adapter.bosesoundtouch.\u9999' },
            function (err, doc) {
                if (doc && doc.rows && doc.rows.length) {
                    doc.rows.forEach(row => {
                        if (row.value.native.address != instance.adapter.ipAddress) {
                            const systemId  = row.id.split('.');
                            const index = systemId[systemId.length - 1];
                            const namespace = systemId[systemId.length - 2] + '.' + index + '.';

                            instance.adapter.getForeignState(namespace + BOSE_ID_INFO_MAC_ADDRESS, function(err, stateMacAddress) {
                                if (err) {
                                    instance.adapter.log.error(err);
                                }
                                else {
                                    if (stateMacAddress.val === slaveMacAddress) {
                                        instance.adapter.getForeignState(namespace + BOSE_ID_INFO_IP_ADDRESS, function(err, stateIpAddress) {
                                            if (err) {
                                                instance.adapter.log.error(err);
                                            }
                                            else {
                                                setZoneFunction({mac: instance.adapter.macAddress}, {ip: stateIpAddress.val, mac: stateMacAddress.val}, instance.socket);
                                            }
                                        });
                                    }
                                }
                            });
                        }
                    });
                }
                else {
                    instance.adapter.log.debug('No objects found: ' + err);
                }
            });
    }

    setMasterOf(setMasterOf) {
        var instance = this;
        instance.masterSlaveData = {
            master: {
                ip: this.adapter.ipAddress,
                mac: this.adapter.macAddress
            },
            slave: []
        };
        this.adapter.objects.getObjectView(
            'system', 'instance', {
                startkey: 'system.adapter.bosesoundtouch.',
                endkey: 'system.adapter.bosesoundtouch.\u9999' },
            function (err, doc) {
                if (doc && doc.rows && doc.rows.length) {
                    var toDoList = [];
                    for (var i = 0; i < doc.rows.length; i++) {
                        var obj = doc.rows[i].value;
                        if (obj.native.address != instance.adapter.ipAddress) {
                            var systemId  = doc.rows[i].id.split('.');
                            var index = systemId[systemId.length - 1];
                            var namespace = systemId[systemId.length - 2] + '.' + index + '.';
                            toDoList.push(namespace + BOSE_ID_INFO_IP_ADDRESS);
                            toDoList.push(namespace + BOSE_ID_INFO_MAC_ADDRESS);
                        }
                    }

                    instance._collectPlayEverywhereData(toDoList, instance._collectPlayEverywhereFinished, setMasterOf !== undefined ? setMasterOf.split(';') : undefined);
                }
                else {
                    instance.adapter.log.debug('No objects found: ' + err);
                }
            }
        );
    }
}

var adapter = new(boseSoundTouch);
