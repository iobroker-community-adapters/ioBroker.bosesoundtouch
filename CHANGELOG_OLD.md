# Older changes
## 0.10.1 (2022-06-02)
* (Apollon77) Add Sentry for crash reporting

## 0.10.0 (2021-07-30)
* IMPORTANT: The adapter now requires at least js-controller 2.0
* (Apollon77) Optimize for js-controller 3.3

## 0.9.4 (07.05.2021)
* fixed vulnerability in NPM

## 0.9.3 (02.02.2021)

* transfer of adapter to iobroker-community-adapters

## 0.9.3 (10.01.2021)

* Added elapsed time, duration, status, keys and roles

## 0.9.2 (09.12.2019)

* We don't use adapter.objects anymore

## 0.9.1 (12.05.2019)

* Support for compact mode.
* Fixed bugs found by adapter checker.

## 0.9.0 (23.01.2019)

* Added possibility to change the source.  
  All available sources are listed as states in folder sources and can be used as play buttons.

## 0.2.4 (05.05.2019)

* Core Files/Testing Update and introduce adapter-core

## 0.2.3 (11.11.2018)

* fixed issue #24 "does not start"

## 0.2.2 (03.11.2018)

* Zones: objects moved to sub folder 'zones'

## 0.2.1 (12.10.2018)

* Update now playing info for source Deezer

## 0.2.0 (27.09.2018)

* Add support for zones

## 0.1.9 (07.03.2018)

* Update now playing info for source Amazon

## 0.1.8 (08.02.2018)

* Update now playing info for source Spotify
* now playing: added state 'genre'

## 0.1.7 (04.02.2018)

* fixed crash if no presets are defined

## 0.1.6 (17.01.2018)

* fixed crash if socket connection fails
* added setting: time to reconnect in seconds

## 0.1.5 (06.01.2018)

* added 'TUNEIN' to now playing info
* state playEverywhere falls back to false after activation
* admin/bose.png renamed to admin/bosesoundtouch.png to be shown correctly in adapter list
* added short adapter description in io-package.json

## 0.1.4 (30.12.2017)

* playEverywhere: support multi room (zones) to define one speaker as master for all others

## 0.1.3 (22.12.2017)

* revert last change

## 0.1.2 (22.12.2017)

* fixed typo in package.json

## 0.1.1 (20.12.2017)

* now playing: added state 'art' (URL to cover image if available)
* merged pull request from Apollon77 (basic config files for testing)
* renamed repository to 'ioBroker.bosesoundtouch'

## 0.1.0 (26.11.2017)

* objectChange/stateChange: log level 'debug'
* added 'STORED_MUSIC' to now playing info.

## 0.0.9 (22.11.2017)

* Merge pull request #1 from Apollon77/master: Add testing and fix things...

## 0.0.8 (19.11.2017)

* send value to correct instance when having multiple adapters installed
* first version of README.md

## 0.0.7 (09.11.2017)

* fixed logging in soundtouchsocket.js

## 0.0.6 (09.11.2017)

* renamed main.js to bosesoundtouch.js
* line ending: LF
* strings: single quote

## 0.0.5 and earlier (01.11.2017)

* Initial versions

[Older changelogs can be found there](CHANGELOG_OLD.md)
