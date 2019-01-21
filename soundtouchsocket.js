/* jshint -W097 */
// jshint strict:false
/* jslint node: true */
/* jslint esversion: 6 */

'use strict';

var format = require('string-format');

module.exports = class soundtouchsocket extends require('events').EventEmitter {

    constructor(adapter) {
        super();
        this.address = adapter.config.address;
        if (!this.address) {
            throw new Error('soundtouchsocket needs an address');
        }
        this.adapter = adapter;
        this.request = require('request');
        this.promise = require('es6-promise');
        this.xml2js = require('xml2js');
        this.js2xml = new this.xml2js.Builder({ headless: true, rootName: 'ContentItem', renderOpts: { pretty: false }});
    }

    connect() {
        this.adapter.log.debug('connect');
        var instance = this;

        return new this.promise.Promise(function(resolve, reject) {
            var address = 'ws://' + instance.address + ':8080/';
            const WebSocket = require('ws');

            instance.adapter.log.info('connecting to host ' + address);
            instance.ws = new WebSocket(address, 'gabbo');

            instance.ws.on('open', function() { instance._onOpen(resolve); });
            instance.ws.on('close', function() { instance._onClose(); });
            instance.ws.on('error', function(error) { instance._onError(error, reject); });
            instance.ws.on('message', function(data, flags) { instance._onMessage(data, flags); });
        });
    }

    _heartBeatFunc() {
        this.adapter.log.debug('_heartBeatFunc');
        if (Date.now() - this._lastMessage > 30000) {
            this.adapter.log.warn('heartbeat timeout');
            this.ws.close();
            clearInterval(this.heartBeatInterval);
        }
        else {
            //this.adapter.log.debug('<span style="color:darkblue;">sending heartbeat');
            this.send('webserver/pingRequest');
        }
    }

    _restartHeartBeat() {
        this.adapter.log.debug('_restartHeartBeat');
        this._lastMessage = Date.now();
        clearInterval(this.heartBeatInterval);
        var instance = this;
        this.heartBeatInterval = setInterval(function() { instance._heartBeatFunc(); }, 10000);
    }

    _onOpen(resolve) {
        this.adapter.log.debug('onOpen');
        this._restartHeartBeat();
        this.emit('connected');
        resolve();
    }

    _onClose() {
        this.adapter.log.debug('onClose');
        clearInterval(this.heartBeatInterval);
        this.emit('closed');
    }

    _onError(error, reject) {
        this.adapter.log.error('websocket error ' + error);
        this.emit('error', error);
        reject();
    }

    _onMessage(data/*, flags*/) {
        this.adapter.log.debug('onMessage');
        this._parse(data);
    }

    send(data) {
        var instance = this;
        return new this.promise.Promise(function(resolve, reject) {
            instance.adapter.log.debug('Send: ' + data);
            instance.ws.send(data, function ackSend(err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }

    _handleVolume(volume) {
        this.adapter.log.debug('received [volume]:' + volume.actualvolume);
        var obj = {
            volume: volume.actualvolume,
            muted: volume.muteenabled == 'true'
        };
        this.emit('volume', obj);
    }

    _handlePresets(data) {
        var object = [];
        for (var i = 0; i < 6; i++) {
            object[i] = {
                source:  '',
                name:    '',
                iconUrl: ''
            };
        }
        if (data.presets) {
            this.adapter.log.debug('received [presets]:' + JSON.stringify(data.presets));
            if (data.presets.preset) {
                var presets = data.presets.preset;
                var contentItem;
                var id;
                if (Array.isArray(presets)) {
                    for (i in presets) {
                        contentItem = presets[i].ContentItem;
                        id = presets[i].$.id - 1;
                        object[id].source  = contentItem.$.source;
                        object[id].name    = contentItem.itemName;
                        object[id].iconUrl = contentItem.containerArt;
                    }
                }
                else {
                    contentItem = presets.ContentItem;
                    id = presets.$.id - 1;
                    object[id].source  = contentItem.$.source;
                    object[id].name    = contentItem.itemName;
                    object[id].iconUrl = contentItem.containerArt;
                }
            }
        }
        this.emit('presets', object);
    }

    _handleSources(data) {
        this.adapter.log.debug('received [sources]:' + JSON.stringify(data.sourceItem));
        var object = [];
        for (var i in data.sourceItem) {
            var source = data.sourceItem[i].$;
            object.push({
                name:             source.source,
                sourceAccount:    source.sourceAccount,
                isLocal:          source.isLocal == 'true',
                multiRoomAllowed: source.multiroomallowed,
                status:           source.status
            });
        }
        this.emit('sources', object);
    }

    _handleDeviceInfo(data) {
        this.adapter.log.debug('received [info] ' + JSON.stringify(data));
        var networkInfo;
        if (Array.isArray(data.networkInfo)) {
            networkInfo = data.networkInfo[0];
        }
        else {
            networkInfo = data.networkInfo;
        }
        var object = {
            name:       data.name,
            type:       data.type,
            macAddress: data.$.deviceID,
            ipAddress:  networkInfo.ipAddress
        };
        this.emit('deviceInfo', object);
    }

    _handleNowPlaying(data) {
        this.adapter.log.debug('received [now_playing] ' + JSON.stringify(data));
        var object = {
            source:  data.$.source,
            track:   '',
            artist:  '',
            album:   '',
            station: '',
            art:     '',
            genre:   '',
            contentItem: null
        };
        switch (data.$.source) {
            case 'AMAZON':
            case 'BLUETOOTH':
            case 'INTERNET_RADIO':
            case 'SPOTIFY':
            case 'DEEZER':
            case 'STORED_MUSIC':
            case 'TUNEIN':
                object.track = data.track;
                object.artist = data.artist;
                object.album = data.album;
                object.station = data.stationName;
                if (data.art && data.art._) {
                    object.art = data.art._;
                }
                if (data.genre) {
                    object.genre = data.genre;
                }
                if (data.ContentItem) {
                    object.contentItem = data.ContentItem;
                }
                break;

            case 'PRODUCT':
                object.station = data.$.sourceAccount;
                break;
        }

        this.emit('nowPlaying', object);
    }

    _handleZone(data) {
        this.emit('zones', data);
    }

    _onJsData(jsData) {
        this.adapter.log.debug(JSON.stringify(jsData));
        for (var infoItem in jsData) {
            switch(infoItem) {
                case 'info':
                    this._handleDeviceInfo(jsData[infoItem]);
                    break;

                case 'nowPlaying':
                    this._handleNowPlaying(jsData[infoItem]);
                    break;

                case 'bass':
                    this._handleBassInfo(jsData[infoItem]);
                    break;

                case 'bassCapabilities':
                    this._handleBassCaps(jsData[infoItem]);
                    break;

                case 'volume': {
                    var volume = jsData.volume;
                    if (volume) {
                        this._handleVolume(volume);
                    }
                    break;
                }

                case 'presets':
                    this._handlePresets(jsData);
                    break;

                case 'sources':
                    this._handleSources(jsData[infoItem]);
                    break;

                case 'zone':
                    this._handleZone(jsData[infoItem]);
                    break;

                case 'trackInfo':
                    this._handleTrackInfo(jsData[infoItem]);
                    break;

                case 'updates':
                    if (jsData.hasOwnProperty('updates')) {
                        for (var updateItem in jsData.updates) {
                            switch(updateItem) {
                                case 'nowPlayingUpdated': {
                                    var nowPlaying = jsData.updates.nowPlayingUpdated.nowPlaying;
                                    if (nowPlaying) {
                                        this._handleNowPlaying(nowPlaying);
                                    }
                                    else {
                                        this.getInfo();
                                    }
                                    break;
                                }

                                case 'volumeUpdated': {
                                    var vol = jsData.updates.volumeUpdated.volume;
                                    if (vol) {
                                        this._handleVolume(vol);
                                    }
                                    else {
                                        this.getVolume();
                                    }
                                    break;
                                }

                                case 'zoneUpdated': {
                                    this._handleZone(jsData.updates.zoneUpdated.zone);
                                    break;
                                }

                            }
                        }
                    }
                    break;
            }
        }

        this._restartHeartBeat();
    }

    _parse(xml) {
        var instance = this;
        this.xml2js.parseString(xml, { explicitArray: false }, function(err, jsData) {
            if (err) {
                instance.adapter.log.error(err);
            }
            else {
                instance._onJsData(jsData);
            }
        });
    }

    _postCallback(error /*, response, body*/) {
        if (error) {
            this.adapter.log.error(error, 'error');
        }
        /*else {
            this.adapter.log.debug('_post: ' + body);//options.baseUrl + command + ' - ' + bodyString);
        }*/
    }

    _post(command, bodyString) {
        var options = {
            baseUrl:    'http://' + this.address + ':8090/',
            uri:        command,
            body:       bodyString
        };
        this.adapter.log.debug('_post: ' + options.baseUrl + command + ' - ' + bodyString);
        this.request.post(options, this._postCallback);
    }

    setValue(command, args, value) {
        if (args !== '' && args[0] != ' ') {
            args = ' ' + args;
        }
        var bodyString = '<' + command + args + '>' + value + '</' + command + '>';
        this._post(command, bodyString);
    }

    createZone(master, slaves) {
        const body = '<zone master="{}"> {} </zone>';
        const member = '<member ipaddress="{}">{}</member>';

        var members = '';
        slaves.forEach(slave => {
            members = members + format(member, slave.ip, slave.mac);
        });
        var str = format(body, master.mac, members);
        this._post('setZone', str);
    }

    addZoneSlave(master, slave, socket)
    {
        const body = '<zone master="{}"> {} </zone>';
        const member = `<member ipaddress="${slave.ip}">${slave.mac}</member>`;
        var str = format(body, master.mac, member);
        socket._post('addZoneSlave', str);
    }

    removeZoneSlave(master, slave, socket)
    {
        const body = '<zone master="{}"> {} </zone>';
        const member = `<member ipaddress="${slave.ip}">${slave.mac}</member>`;
        var str = format(body, master.mac, member);
        socket._post('removeZoneSlave', str);
    }

    playSource(source, sourceAccount, contentItem) {
        var str;
        if (contentItem) {
            str = this.js2xml.buildObject(contentItem);
        }
        else {
            const body = '<ContentItem source="{}" sourceAccount="{}"></ContentItem>';
            str = format(body, source, sourceAccount);
        }
        this._post('select', str);
    }

    get(value) {
        var instance = this;
        var command = 'http://' + this.address + ':8090/' + value;
        this.adapter.log.debug('request: ' + command);
        this.request.get(command, function(error, response, body) {
            if (error) {
                instance.adapter.log.error(response.statusCode);
            }
            else {
                instance._parse(body);
            }
        });
    }

    getDeviceInfo() {
        this.get('info');
    }

    getPlayInfo() {
        this.get('now_playing');
    }

    getPresets() {
        this.get('presets');
    }

    getVolume() {
        this.get('volume');
    }

    getSources() {
        this.get('sources');
    }

    getZone() {
        this.get('getZone');
    }

    updateAll() {
        this.adapter.log.debug('updateAll');
        var instance = this;
        return this.promise.Promise.all([
            instance.getDeviceInfo(),
            instance.getPlayInfo(),
            instance.getPresets(),
            //_instance.getBassCapabilities(),
            //_instance.getBassInfo(),
            instance.getVolume(),
            instance.getSources(),
            instance.getZone(),
            //_instance.getTrackInfo()
        ]);
    }

};
