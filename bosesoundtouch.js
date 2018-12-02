/* jshint -W097 */
// jshint strict:false
/* jslint node: true */
/* jslint esversion: 6 */

'use strict';

const BOSE_ID_ON                   = 'on';
const BOSE_ID_KEY                  = 'key';
const BOSE_ID_VOLUME               = 'volume';
const BOSE_ID_MUTED                = 'muted';

const BOSE_ID_NOW_PLAYING = 'nowPlaying.';
const BOSE_ID_NOW_PLAYING_SOURCE  = BOSE_ID_NOW_PLAYING + 'source';
const BOSE_ID_NOW_PLAYING_TRACK   = BOSE_ID_NOW_PLAYING + 'track';
const BOSE_ID_NOW_PLAYING_ARTIST  = BOSE_ID_NOW_PLAYING + 'artist';
const BOSE_ID_NOW_PLAYING_ALBUM   = BOSE_ID_NOW_PLAYING + 'album';
const BOSE_ID_NOW_PLAYING_STATION = BOSE_ID_NOW_PLAYING + 'station';
const BOSE_ID_NOW_PLAYING_ART     = BOSE_ID_NOW_PLAYING + 'art';
const BOSE_ID_NOW_PLAYING_GENRE   = BOSE_ID_NOW_PLAYING + 'genre';

const BOSE_ID_PRESETS = 'presets.';
const BOSE_ID_PRESET_SOURCE = BOSE_ID_PRESETS + '{}.source';
const BOSE_ID_PRESET_NAME   = BOSE_ID_PRESETS + '{}.name';
const BOSE_ID_PRESET_ICON   = BOSE_ID_PRESETS + '{}.iconUrl';

const BOSE_ID_ZONES = 'zones.';
const BOSE_ID_ZONES_MEMBER_OF        = BOSE_ID_ZONES + 'memberOf';
const BOSE_ID_ZONES_MASTER_OF        = BOSE_ID_ZONES + 'masterOf';
const BOSE_ID_ZONES_ADD_MASTER_OF    = BOSE_ID_ZONES + 'addMasterOf';
const BOSE_ID_ZONES_REMOVE_MASTER_OF = BOSE_ID_ZONES + 'removeMasterOf';
const BOSE_ID_ZONES_PLAY_EVERYWHERE  = BOSE_ID_ZONES + 'playEverywhere';

const BOSE_ID_DEVICE_INFO = 'deviceInfo.';
const BOSE_ID_INFO_NAME = BOSE_ID_DEVICE_INFO + 'name';
const BOSE_ID_INFO_TYPE = BOSE_ID_DEVICE_INFO + 'type';
const BOSE_ID_INFO_MAC_ADDRESS = BOSE_ID_DEVICE_INFO + 'macAddress';
const BOSE_ID_INFO_IP_ADDRESS = BOSE_ID_DEVICE_INFO + 'ipAddress';

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
        
        if (this.adapter.config.autoSync) {
            this._checkSyncZones(obj);
        }
    }

    _collectCheckSyncData(syncData, namespaceList, originNowPlaying) {
        var instance = this;
        if (syncData) {
            if (syncData.length == 0) {
                instance._collectCheckSyncFinished(namespaceList, originNowPlaying);
            } else {
                var namespace = syncData.shift();

                this.adapter.getForeignStates(namespace + "*", function (err, deviceInfoData) {
                    if (err) {
                        instance.adapter.log.error(err);
                    } else {
                        namespaceList[namespace] = deviceInfoData
                        instance._collectCheckSyncData(syncData, namespaceList, originNowPlaying);
                    }
                });
            }
        }
    }

    _sameStation(obj1, obj2) {
        return (obj1.source === obj2.source && obj1.station === obj2.station);
    }

    _sameTrack(obj1, obj2) {
        return (obj1.source === obj2.source && obj1.artist === obj2.artist && obj1.track === obj2.track);
    }

    _collectCheckSyncFinished(namespaceList, originNowPlaying) {
        var instance = this;
        let setMasterOf = [];
        let existMaster = false;
        Object.keys(namespaceList).forEach(key => {
            const dataFromKey = namespaceList[key];
            const syncNowPlaying = {
                source: dataFromKey[key + BOSE_ID_NOW_PLAYING_SOURCE].val,
                track: dataFromKey[key + BOSE_ID_NOW_PLAYING_TRACK].val,
                artist: dataFromKey[key + BOSE_ID_NOW_PLAYING_ARTIST].val,
                album: dataFromKey[key + BOSE_ID_NOW_PLAYING_ALBUM].val,
                station: dataFromKey[key + BOSE_ID_NOW_PLAYING_STATION].val,
                art: dataFromKey[key + BOSE_ID_NOW_PLAYING_ART].val,
                genre: dataFromKey[key + BOSE_ID_NOW_PLAYING_GENRE].val
            }

            if (instance._sameStation(syncNowPlaying, originNowPlaying) | instance._sameTrack(syncNowPlaying, originNowPlaying)) {
                const syncMasterOf = dataFromKey[key + BOSE_ID_ZONES_MASTER_OF].val;
                if (!(syncMasterOf.split(';').some(masterData => masterData === instance.adapter.macAddress))) {
                    setMasterOf.push(dataFromKey[key + BOSE_ID_INFO_MAC_ADDRESS].val)
                } else {
                    existMaster = true;
                }
            }
        })

        if (setMasterOf.length > 0 && !existMaster) {
            instance.setMasterOf(setMasterOf.join(';'))
        }
    }

    _checkSyncZones(originNowPlaying) {
        if (originNowPlaying.source !== 'STANDBY') {
            var instance = this;
            this.adapter.objects.getObjectView(
                'system', 'instance', {
                    startkey: 'system.adapter.bosesoundtouch.',
                    endkey: 'system.adapter.bosesoundtouch.\u9999'
                },
                function (err, doc) {
                    if (doc && doc.rows && doc.rows.length) {
                        var toDoList = [];
                        for (var i = 0; i < doc.rows.length; i++) {
                            var obj = doc.rows[i].value;
                            if (obj.native.address != instance.adapter.ipAddress) {
                                const systemId = doc.rows[i].id.split('.');
                                const index = systemId[systemId.length - 1];
                                const namespace = systemId[systemId.length - 2] + '.' + index + '.';
                                toDoList.push(namespace);
                            }
                        }

                        instance._collectCheckSyncData(toDoList, {}, originNowPlaying);
                    } else {
                        instance.adapter.log.debug('No objects found: ' + err);
                    }
                });
        }
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
