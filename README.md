# iobroker.bosesoundtouch
Bose SoundTouch adapter for iobroker

## Usage

The following objects can be written:
### key

One of the following keys to send:

```
PLAY 
PAUSE 
STOP 
PREV_TRACK 
NEXT_TRACK 
THUMBS_UP 
THUMBS_DOWN 
BOOKMARK 
POWER 
MUTE 
VOLUME_UP 
VOLUME_DOWN 
PRESET_1 
PRESET_2 
PRESET_3 
PRESET_4 
PRESET_5 
PRESET_6 
AUX_INPUT 
SHUFFLE_OFF 
SHUFFLE_ON 
REPEAT_OFF 
REPEAT_ONE 
REPEAT_ALL 
PLAY_PAUSE 
ADD_FAVORITE 
REMOVE_FAVORITE 
INVALID_KEY
```

### muted

Mute or unmute the device.

### on

Power on or off the device.

### volume

Change device volume between 0 and 100.

## changelog
### 0.1.0 (26.11.2017)
* objectChange/stateChange: log level 'debug'
* added 'STORED_MUSIC' to now playing info.

### 0.0.9 (22.11.2017)
* Merge pull request #1 from Apollon77/master: Add testing and fix things...

### 0.0.8 (19.11.2017)
* send value to correct instance when having multiple adapters installed
* first version of README.md

### 0.0.7 (09.11.2017)
* fixed logging in soundtouchsocket.js

### 0.0.6 (09.11.2017)
* renamed main.js to bosesoundtouch.js
* line ending: LF
* strings: single quote

### 0.0.5 and earlier (01.11.2017)
* use console.log (temporary solution)

### 0.0.4 (01.11.2017)
* use utils.adapter for logging (temporary solution)

### 0.0.3 (01.11.2017)
* added missing file lib/utils.js

### 0.0.2 (01.11.2017)
* changed console.log to adapter.log

### 0.0.1 (01.11.2017)
* Initial version
