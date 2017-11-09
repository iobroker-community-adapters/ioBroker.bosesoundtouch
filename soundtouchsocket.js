'use strict';

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
        this.rmit('error', error);
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
        //this.emit('volume', JSON.stringify(volume));
        this.emit('volume', volume);
    }
    
    _handlePresets(data) {
        this.adapter.log.debug('presets:' + JSON.stringify(data.presets));
        var preset = data.presets.preset;
        var object = [];
        for (var i in preset) {
            var contentItem = preset[i].ContentItem;
            object[preset[i].id - 1] = {
                source:     contentItem.source,
                name:        contentItem.itemName,
                iconUrl:    contentItem.containerArt
            };
        }
        this.emit('presets', object);
    }

    _handleDeviceInfo(data) {
        this.adapter.log.debug('received [info] ' + JSON.stringify(data));
        var object = {};/*
            name: '',
            type: '',
            swVersion: '',
            macAddress: '',
            ipAddress: ''
        };*/

        object.name = data.name;
        object.type = data.type;
        object.macAddress = data.deviceID;
        this.emit('deviceInfo', object);
    }
    
    _handleNowPlaying(data) {
        this.adapter.log.debug('received [now_playing] ' + JSON.stringify(data));
        var source = data.source;
        var track = '';
        var artist = '';
        var album = '';
        var station = '';
        switch (source) {
            case 'INTERNET_RADIO':
            case 'BLUETOOTH':
                track = data.track;
                artist = data.artist;
                album = data.album;
                station = data.stationName;
                break;
                
            case 'PRODUCT':
                station = data.sourceAccount;
                break;
        }
        var object = {
            source:     source,
            track:      track,
            artist:     artist,
            album:      album,
            station:    station
        };
        this.emit('nowPlaying', object);
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
        this.xml2js.parseString(xml, {explicitArray: false, mergeAttrs: true}, function(err, jsData) { 
            if (err) {
                instance.adapter.error(err);
            }
            else {
                instance._onJsData(jsData);
            }
        });        
    }
    
    setValue(command, args, value) {
        if (args !== '' && args[0] != ' ') {
            args = ' ' + args;
        }
        var bodyString = '<' + command + args + '>' + value + '</' + command + '>';
        var urlString = 'http://' + this.address + ':8090/';
        this.request.post( {
            baseUrl:    urlString,
            uri:        command,
            body:       bodyString
        }, 
        function(error/*, response, body*/) {
            //log(' ----  response: ' + response.statusCode + ' --- body: ' + body, 'info');
            if (error) {
                this.adapter.error(error, 'error');
            }
        });
        this.adapter.log.debug('setValue: ' + urlString + command + ' - ' + bodyString);
    }
    
    get(value) {
        var instance = this;
        var command = 'http://' + this.address + ':8090/' + value;
        this.adapter.log.debug('request: ' + command);
        this.request.get(command, function(error, response, body) {  
            if (error) {
                instance.adapter.error(response.statusCode);
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
            //_instance.getSources(),
            //_instance.getZone(),
            //_instance.getTrackInfo()
        ]);
    }
    
};