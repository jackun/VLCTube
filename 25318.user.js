﻿// ==UserScript==
// @name           VLCTube
// @namespace      0d92f6be108e4fbee9a6a0ee4366b72e
// @run-at         document-start
// @include        *://youtube.tld/*
// @include        *://*.youtube.tld/*
// @include        *://*.youtube-nocookie.tld/embed/*
// @include        /^https?:\/\/(?:www\.)?youtube(?:-nocookie)?\.com/i
// @exclude        *://*.google.tld/*
// @exclude        *google.com*
// @grant          GM_getValue
// @grant          GM_setValue
// @grant          GM_listValues
// @grant          GM_addStyle
// @grant          GM_xmlhttpRequest
// @grant          GM_registerMenuCommand
// @grant          unsafeWindow
// @version        62.3
// @updateURL      https://github.com/jackun/VLCTube/raw/master/25318.user.js
// @downloadURL    https://github.com/jackun/VLCTube/raw/master/25318.user.js
// ==/UserScript==
// @updateURL      https://greasyfork.org/scripts/1783-vlctube/code/VLCTube.meta.js
// @downloadURL    https://greasyfork.org/scripts/1783-vlctube/code/VLCTube.user.js
// http://wiki.videolan.org/Documentation:WebPlugin
// Tested on Arch linux, Fx35+, vlc 2.1.5, (or vlc-git & npapi-vlc-git from AUR)

(function(){

var VLCTube = function (){
"use strict";
var gPlayerApiID = 'player-api';//-legacy';
var gPlayerID = 'player';//-legacy';
var gMoviePlayerID = 'movie_player'; ///< Change to something else if flash/html5 player keeps overwriting VLC player
var stateUpdateFreq = 250;// 250ms
var vlc_id = 'mymovie';
var VLC_status = ["Idle", "Opening", "Buffering", "Playing", "Paused", "Stopped", "ended", "Error"];

// Ich olen international.
var gLang = GM_getValue('vlc-lang', "en");
var gLangs = {
	"en": {
		'LANG'  : 'English',
		'NONE'  : 'None',
		'PLAY'  : 'Play',
		'PAUSE' : 'Pause',
		'STOP'  : 'Stop',
		'FS'    : 'Fullscreen',
		'WIDE'  : 'Wide',
		'DND'   : 'Drag and drop to rearrange.',
		'LINKSAVE' : 'Download',
		'DOWNLOAD' : 'Download',
		'WATCHYT'  : 'Watch on YT',
		'POSITION' : 'Position',
		'VOLUME'   : 'Volume',
		'PLAYBACKRATE': 'Playback rate',
		'PLAYBACKRATEPRESET': 'Playback rate preset',
		'RESETRATE': 'Reset playback rate',
		'SETRATE'  : 'Set playback rate',
		'MINRATE'  : 'Minimum rate',
		'MAXRATE'  : 'Maximum rate',
		'CUSTRATEPRESET'  : 'Custom rate',
		'vlc-config-autoplay' : ['Autoplay', ''],
		'vlc-config-priomap' : ['Always use format priority map', 'Otherwise uses last selected format or prio. map as fallback'],
		'vlc-config-resume'  : ['Resume on format change', ''],
		'vlc-config-forcews' : ['Force 16:9 aspect ratio', '4:3 videos get black bars duh'],
		'vlc-config-forcewide' : ['Always in wide mode', ''],
		'vlc-config-add3d'   : ['Add 3D formats', 'If you wanna watch cross-eyed'],
		'vlc-config-hover'   : ['Auto hide controls for embedded', ''],
		'vlc-config-loadembed'     : ['Load embedded video info', 'Load video title etc.'],
		'vlc-config-embedcontrols' : ['Fewer controls on embedded video', 'But not so compact for now atleast'],
		'vlc-config-vertvolume'    : ['Vertical volume bar', 'Experimental'],
		'vlc-config-forcepl' : ['Playlist in wide mode', 'Does nothing for now'],
		'vlc-config-thumb'   : ['Use thumbnail image', ''],
		'vlc-config-rate'    : ['Show playback rate scrollbar', ''],
		//version 32
		'vlc-config-repeat'  : ['Enable repeat', ''],
		'vlc-config-repeat-wait' : ['Wait before repeating:', 'In seconds'],
		//v33
		'vlc-config-wide-posbar' : ['Wider playback position scrollbar', ''],//seekbar, whatever
		//v34
		'POPUP' : 'Popup',
		'vlc-config-popup' : ['Show popup button', ''],
		'vlc-config-popup-autoplay' : ['Autoplay in popup window', ''],
		'vlc-config-popup-separate' : ['Allow multiple popup windows', 'Otherwise popups open in one window'],
		'vlc-config-cache' : ['Buffer length:', 'In seconds. Maximum is 60s.'],
		'vlc-config-volume-max' : ['Maximum volume:', 'Volume restore gets limited to 100% still'],
		//v35+
		'vlc-config-scrolltoplayer' : ['Scroll to player', ''],
		'vlc-config-wide-width' : ['Wide player width:', 'Add "%" for percentage of current window size. Otherwise it is width in pixels.'],
		'vlc-config-dropdown' : ['Config as dropdown', 'Configuration div more like a dropdown menu'],
		'BUFFERINDICATOR' : 'Buffering indicator',
		'vlc-config-uri-fallback' : ['Use fallback host for URIs', 'Use alternative server for videos if available.'],
		'vlc-config-discard-flvs' : ['Discard FLV formats', 'Don\'t add FLV formats as selectable.'],
		'vlc-config-dark-theme' : ['Dark theme', 'Make a little friendlier for dark themes.'],
		'vlc-config-autoplay-pl' : ['Autoplay playlists', 'Also if checked, plays next video automatically.'],
		'vlc-config-adaptives' : ['Add adaptive formats', 'Video only or audio only streams. Currently kinda useless.'],
		'WATCHLATER' : 'Watch later',
		//v43+
		'MUTE' : 'Mute',
		'vlc-config-mute-button' : ['Show mute button', ''],
		'vlc-config-jumpts' : ['Always jump to timestamp', 'if it is specified in URL.'],
		'vlc-config-wl-main' : ['Always show Watch Later button', 'Not just embedded videos.'],
		'vlc-config-subs-on' : ['Auto enable subtitle', 'Selects first subtitle and enables it if any is available.'],
		'vlc-config-btn-icons' : ['Use button icons', 'Show icons instead of text.'],
		'vlc-config-custom-wide' : ['Use custom wide width', ''],
		'CONFIG' : 'Configuration',
		'vlc-config-cust-speed-preset' : ['Show custom speed preset button', ''],
		'vlc-config-subs-align' : ['Subtitle alignment', ''],
		'vlc-config-subs-color' : ['Subtitle color', 'In hexadecimal form (RRGGBB).'],
		'vlc-config-music-mode' : ['Music player mode', 'Add some player buttons to masthead and keep VLC playing while browsing. NB!: Refresh page if enabled.'],
		'CURRVIDEO': 'Current video',
		'vlc-config-autoplay-yt' : ['Autoplay (Youtube)', 'Autoplay when Youtube\'s Autoplay checkbox is checked. Overrides Autoplay.'],
		'vlc-config-sidebar-ignore' : ['Don\'t change sidebar margins', 'Possibly better compatibility with other player size/position changing scripts.'],
		},
	"et": {
		'LANG'  : 'Eesti',
		'NONE'  : 'Midagi',
		'PLAY'  : 'Mängi',
		'PAUSE' : 'Paus',
		'STOP'  : 'Stop',
		'FS'    : 'Täisekraan',
		'WIDE'  : 'Lai',
		'DND'   : 'Lohista ümber.',
		'LINKSAVE' : 'Parem klikk ja salvesta',
		'DOWNLOAD' : 'Lae alla',
		'WATCHYT' : 'Vaata YT-s',
		'RESETRATE': 'Taasesituskiirus normaalseks tagasi',
		'vlc-config-autoplay' : ['Mängi automaatselt', ''],
		'vlc-config-priomap' : ['Alati kasuta formaadi tähtsuse järjekorda', 'Muidu kasutab viimati valitut või siis prio. mapi jälle'],
		'vlc-config-resume'  : ['Jätka samast kohast formaadi vahetusel', 'Mõni formaat/video ei taha vahest seekida eriti.'],
		'vlc-config-forcews' : ['Jõuga suru pilt 16:9 mõõtudesse', '4:3 saab mustad jutid äärtesse'],
		'vlc-config-forcewide' : ['Alati lai režiim', ''],
		'vlc-config-add3d'   : ['Lisa 3D formaadid valikusse', 'Veidi mõttetud, kui sa just kõõrdi ei taha vaadata.'],
		'vlc-config-hover'   : ['Hõljuvad juhtnupud manustatud videotel', 'OMG, i can\'t translate this. fo\' shame'],
		'vlc-config-loadembed'     : ['Laadi manustatud videote info.', 'Krdil ei paista olevat javascriptis kirjas kuskil :('],
		'vlc-config-embedcontrols' : ['Vähem juhtnuppe manustatud videol', 'Noo ainult downloadi link'],
		'vlc-config-vertvolume'    : ['Vertikaalne helivaljususe slaider', 'Eksperimentaalne'],
		'vlc-config-forcepl' : ['Playlist ka laias režiimis', 'Veel ei tee midagi'],
		'vlc-config-thumb'   : ['Näita pisipilti', ''],
		'vlc-config-rate'   : ['Näita taasesituse kiiruse kerimisriba', ''],
		'vlc-config-repeat'  : ['Kordus', ''],
		'vlc-config-repeat-wait' : ['Oota enne kordusesitust:', 'Sekundites'],
		'vlc-config-wide-posbar' : ['Laiem positsiooni kerimisriba', ''],//hmm
		'POPUP' : 'Hüpikaken',
		'vlc-config-popup' : ['Näita popupi nuppu', ''],
		'vlc-config-popup-autoplay' : ['Automaatesitus hüpikaknas', ''],
		'vlc-config-popup-separate' : ['Luba mitu hüpikakent', 'Muidu avab ainult ühes aknas'],
		'vlc-config-cache' : ['Puhverduse pikkus:', 'Sekundites. Maksimum on 60s.'],
		'vlc-config-volume-max' : ['Maksimum helivaljusus:', 'Limiteeritakse 100% peale video lõppedes'],
		'vlc-config-scrolltoplayer' : ['Keri pleier vaatesse', ''],
		'vlc-config-wide-width' : ['Laia pleieri laius:', 'Laius pikslites või lisa protsendi märk, et seada proportsionaalselt akna laiusega.'],
		'WATCHLATER' : 'Vaata hiljem',
		},
	"fi": {
		'LANG'  : 'Suomi',
		'NONE'  : 'Ei mitään',
		'PLAY'  : 'Pelaa',
		'PAUSE' : 'Paussi',
		'STOP'  : 'Stop', //'Pysäyttää',
		'FS'    : 'Koko näyttö',
		'WIDE'  : 'Laaja',
		'DND'   : 'Vedä siitä ja pudota tuonne.',
		'LINKSAVE' : 'Lataa koneellesi oikealla klikkauksella',
		'DOWNLOAD' : 'Lataa',
		'WATCHYT' : 'Katso YT-ssa',
		'RESETRATE': 'Palauta toiston nopeus',
		},
	/// By MegaPokemon3 [http://userscripts.org/users/BOTCoder]
	"tr": {
		'LANG'  : 'Türkçe',
		'NONE'  : 'Hiç',
		'PLAY'  : 'Oynat',
		'PAUSE' : 'Duraklat',
		'STOP'  : 'Durdur',
		'FS'    : 'Tam Ekran',
		'WIDE'  : 'Geniş',
		'DND'   : 'Sürükle ve Yeniden Düzenlemek İçin Bırakın',
		'LINKSAVE' : 'Sağ Tıklayıp Kaydet',
		'DOWNLOAD' : 'Indir',
		'WATCHYT'  : 'YTde izle',
		'POSITION' : 'Pozisyon',
		'VOLUME'   : 'Ses',
		'PLAYBACKRATE': 'Oynatma Oranı',
		'RESETRATE': 'Oynatma Oranı Sıfırla',
		'MINRATE'  : 'Minimum Oran',
		'MAXRATE'  : 'Maximum Oran',
		'vlc-config-autoplay' : ['Otomatik Oynat', ''],
		'vlc-config-priomap' : ['Her zaman biçimi öncelikli haritayı kullanabilirsiniz', 'Aksi takdirde son seçilen biçimi veya prio kullanır. son çare olarak haritası'],
		'vlc-config-resume'  : ['Biçim değişikliği Devam', ''],
		'vlc-config-forcews' : ['16:9 en boy oranı zorla', '4:03 video siyah çubuklar yaa olsun'],
		'vlc-config-forcewide' : ['Her zaman geniş modda', ''],
		'vlc-config-add3d'   : ['3D formatları ekle', 'Eğer siz seyretmek istiyorum şaşı gözlü bir'],
		'vlc-config-hover'   : ['Gömülü için denetimler gezdirin', ''],
		'vlc-config-loadembed'     : ['Gömülü video bilgi yüklemek', 'Video başlığı vb Yük'],
		'vlc-config-embedcontrols' : ['Gömülü video üzerinde daha az kontrolleri', 'Şimdilik bu kadar kompakt değil'],
		'vlc-config-vertvolume'    : ['Dikey hacmi bar', 'deneysel'],
		'vlc-config-forcepl' : ['Geniş modunda Playlist', 'Şimdilik bir şey yok'],
		'vlc-config-thumb'   : ['Küçük resim kullanın', ''],
		'vlc-config-rate'    : ['Oynatma hızını kaydırma göster', ''],
		//end of v32
		},
	/// By decembre [http://userscripts.org/users/5161]
	"fr": {
		'LANG'  : 'Français',
		'NONE'  : 'None',
		'PLAY'  : 'Play',
		'PAUSE' : 'Pause',
		'STOP'  : 'Stop',
		'FS'    : 'Plein Ecran',
		'WIDE'  : 'Large',
		'DND'   : 'Réorganiser par Drag and Drop',
		'LINKSAVE' : 'Click Droit et Enregistrer',
		'DOWNLOAD' : 'Télécharger',
		'WATCHYT'  : 'Regarder sur YT',
		'POSITION' : 'Position',
		'VOLUME'   : 'Volume',
		'PLAYBACKRATE': 'Vitesse de Lecture',
		'RESETRATE': 'Reset Vitesse de Lecture',
		'MINRATE'  : 'Vitesse de Lecture Minimum',
		'MAXRATE'  : 'Vitesse de Lecture Maximum',
		'vlc-config-autoplay' : ['Lecture Auto', ''],
		'vlc-config-priomap' : ['Toujours Utiliser le Format Prioritaire', ''],
		'vlc-config-resume'  : ['Reprendre au chamgement de format', ''],
		'vlc-config-forcews' : ['Forcer 16:9 aspect ratio', 'Les videos en 4:3 auront des barres noires'],
		'vlc-config-forcewide' : ['Toujours en Grand Ecran', ''],
		'vlc-config-add3d'   : ['Ajouter 3D formats', ''],
		'vlc-config-hover'   : ['Contôles visibles par Hover', ''],
		'vlc-config-loadembed'     : ['Charger les Infos Intégrées de la Vidéo', 'Titre etc.'],
		'vlc-config-embedcontrols' : ['Moins de Contrôles dans la Vidéo', 'Pas si compact pour l\'instant'],
		'vlc-config-vertvolume'    : ['Barre de Volume Verticale', 'Experimental'],
		'vlc-config-forcepl' : ['Playlist en Mode Large', 'Ne fait rien pour l\'instant'],
		'vlc-config-thumb'   : ['Utiliser les Vignettes', ''],
		'vlc-config-rate'    : ['Vitesse de Lecture dans la Barre de Défilement ', ''],
		'vlc-config-repeat'  : ['Activer la Répétition', ''],
		'vlc-config-repeat-wait' : ['Patienter avant de Répéter:', 'En seconds'],
		'vlc-config-wide-posbar' : ['Position de Lecture Plus Large dans la Barre de Défilement', ''],
		'POPUP' : 'Popup',
		'vlc-config-popup' : ['Montrer le bouton Popup', ''],
		'vlc-config-popup-autoplay' : ['Autoplay Popup dans une fenêtre', ''],
		'vlc-config-popup-separate' : ['Popups Séparés', 'Sinon les Popups s\'ouvrent dans une autre fenêtre'],
		//end of v34
		},
	};

function _(id)
{
	// var in dict seems to work too, but tampermonkey syntax checker is bitching
	if(gLangs.hasOwnProperty(gLang) && gLangs[gLang].hasOwnProperty(id))
		return gLangs[gLang][id];
	else
	{
		//console.log("Missing translation for " + id + " in " + gLang);
		if(gLangs.en.hasOwnProperty(id))
			return gLangs.en[id];
		else
			return id;
	}
}

// seeking: webm, mp4 > flv
var convToItag = {
	'hd1080/webm' : 46, //1080p
	'hd1080/mp4'  : 37, //1080p
	'hd720/webm'  : 45, //720p
	'hd720/mp4'  : 22,  //720p
	'large/webm' : 44,  //480p
	'large/mp4'  : 20,  //2? 480p
	'large/x-flv' : 35, //480p
	'medium/webm' : 43, //360p
	'medium/mp4'  : 18, //360p
	'medium/x-flv' : 34,//360p
	'small/x-flv' : 5,  //240p
	'small/3gpp'  : 36, //180p
	//'small/3gpp'  : 17, //144p
	"highres/mp4" : 38, //1440p variable?
	//"highres/webm" //4? (exists?)
};

var itagPrio = [
	46, 37, 45, 22, 44, 20, 35, 43, 18, 34, 5, 36, 17, 38, //4?
	//Live streams
	96, 95, 94, 93, 92, 91, 90, 132, 151,
	//Fake live formats
	//11080, 10720, 10480, 10360, 10240, 10180, 10144, 10072,
];

var itagToText = {
	0:   'dash',
	315: '2160p60/webm', //vp9
	313: '2160p/webm', //vp9
	308: '1440p60/webm', //vp9
	303: '1080p60/webm', //vp9
	302: '720p60/webm', //vp9
	299: '1080p60/m4v',
	298: '720p60/m4v',
	278: '144p15/webm', //vp9
	272: '2160p/webm',
	271: '1440p/webm',
	266: '2160p/m4v', //hires
	264: '1440p/m4v', //hires
	251: '160kbps/opus',
	250: '70kbps/opus',
	249: '50kbps/opus',
	248: '1080p/webm',
	247: '720p/webm',
	246: '480p/webm',
	245: '480p/webm',
	244: '480p/webm',
	243: '360p/webm',
	242: '240p/webm',
	219: '480p/webm',
	218: '480p/webm',
	172: '192kbps/webm',
	171: '128kbps/webm',
	170: '1080p/webm/vp8',
	169: '720p/webm/vp8',
	168: '480p/webm/vp8',
	167: '360p/webm/vp8',
	160: '144p/m4v',
	141: '256kbps/m4a',
	140: '128kbps/m4a',
	139: '48kbps/m4a',
	138: 'hires/m4v',
	137: '1080p/m4v',
	136: '720p/m4v',
	135: '480p/m4v',
	134: '360p/m4v',
	133: '240p/m4v',
	120: '720p/flv',
	102: '720p/webm/3D',
	101: '360p/webmH/3D',
	100: '360p/webmL/3D',
	85 : '520p/mp4/3D',
	84 : '720p/mp4/3D',
	83 : '240p/mp4/3D',
	82 : '360p/mp4/3D',
	78 : '480p/mp4', //??
	59 : '480p/mp4',
	46 : '1080p/webm',
	37 : '1080p/mp4',
	45 : '720p/webm',
	22 : '720p/mp4',
	44 : '480p/webm',
	20 : '480p/mp4',
	35 : '480p/flv',
	43 : '360p/webm',
	18 : '360p/mp4',
	34 : '360p/flv',
	5  : '240p/flv',
	36 : '180p/3gpp',
	17 : '144p10/3gpp', // lower fps, better audio
	13 : '144p15/3gpp', // higher fps, shitty audio
	// last, just in case "4k" video crashes graphics card's driver
	38 : 'highres/mp4', //1440p variable?
	//4? : "highres/webm"

	96 : '1080p Live',
	95 : '720p Live',
	94 : '480p Live',
	93 : '360p Live',
	92 : '240p Live',
	91 : '180p Live', //Guess work
	90 : '144p Live', //Guess work
	132 : '240p Live',
	151 : '72p Live',
	/*
	//Fake live formats
	11080 : '1080p Live',
	10720 : '720p Live',
	10480 : '480p Live',
	10360 : '360p Live',
	10240 : '240p Live',
	10180 : '180p Live',
	10144 : '144p Live',
	10072 : '72p Live',
	*/
};

//generates this programmatically
var textToItag = {};

var headers = {'User-agent': 'Mozilla/5.0 (compatible) Greasemonkey',
				'Accept': 'text/xml'};

function tryParseFloat(v, def)
{
	v = parseFloat(v);
	return isNaN(v) ? def : v;
}

function ft(i){ if (i>=10) return i; return '0'+i;}

function fmttime(time)
{
	if(time < 0) time = 0;
	var ms  = Math.floor(time % 1000 / 10);
	var s   = Math.floor(time % 60000 / 1000);
	var m   = Math.floor(time % 3600000 / 60000);
	//var m = Math.floor(time / 60000);
	var h   = Math.floor(time / 3600000);
	//return ft(m) +':'+ ft(s) + '.' + ft(ms);
	return (h>0?ft(h)+':':'') + ft(m) +':'+ ft(s);
}

function Clone(obj)
{
	var clone;
	if (Object.prototype.toString.call(obj) === '[object Array]')
	{
		clone = [];
		for (var i=0; i<obj.length; i++)
			clone[i] = Clone(obj[i]);

		return clone;
	} 
	else if (typeof(obj)=="object")
	{
		clone = {};
		for (var prop in obj)
			if (obj.hasOwnProperty(prop))
				clone[prop] = Clone(obj[prop]);

		return clone;
	}
	else
		return obj;
}

function getMatches(string, regex, index) {
	index || (index = 1); // default to the first capturing group
	var matches = [];
	var match;
	while ((match = regex.exec(string))) {
		matches.push(match[index]);
	}
	return matches;
}

//Recursively remove node and node's children
function removeChildren(node, keepThis)
{
	if(node === undefined || node === null)
	{
		return;
	}

	//silence html5 element
	if (node.tagName === "VIDEO")
	{
		node.pause();
		node.play = function(){console.log('video.play()');}
		node.src = "";
		node.load();
	}

	while (node.hasChildNodes())
	{
		removeChildren(node.firstChild, false);
	}

	if(!keepThis) node.parentNode.removeChild(node);
}

function str2obj(obj, a) {
	var c = a.split('.'), d = obj;
	for (var e; c.length && (e = c.shift()); )
		if(d[e]) d = d[e]; else return null;
	return d;
}

function printStack()
{
	var e = new Error('');
	var stack = e.stack
		//strip script's file name
		.replace(/(.*?)@.*?:/gm, '$1:').replace(/:.*?:/gm, ':')
		//.replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@')
		.split('\n');
	console.log("Stack trace:");
	for(var s = 1; s < stack.length; s++)
		console.log(s, stack[s]);
}

///
///	<Signature decipher>
///
function Decode(sig, arr)
{
	sig = sig.split('');
	for (var i in arr)
	{
		i = arr[i];
		// + swap, - slice, 0 reverse
		sig = (i > 0) ? Swap(sig, i) : ((i === 0) ? Reverse(sig) : sig.slice(-i));
	}

	return sig.join('');
}

function Swap(a, b)
{
	var c = a[0];
	a[0] = a[b % a.length];
	a[b] = c;
	return a;
}

function Reverse(str)
{
	if(typeof(str) === 'string')
		return str.split('').reverse().join('');
	else
		return str.reverse();
}

//Fallback internal decipherer
//TODO also fallback to this if GetDecodeParam->Decode fails
function DecryptSignature(sig, sts)
{
	if(typeof sts == 'undefined') sts = 0;
	if(!sig) return;
	var sigA, sigB;
	switch (sig.length)
	{
		/*case 82:
			{
				var sigA = Reverse(sig.substr(34, 48));
				var sigB = Reverse(sig.substr(0, 33));

				sig = sigA.substr(45, 1) + sigA.substr(2, 12) + sigA.substr(0, 1) + sigA.substr(15, 26) +
					sig.substr(33, 1) + sigA.substr(42, 1) + sigA.substr(43, 1) + sigA.substr(44, 1) +
					sigA.substr(44, 1) + sigA.substr(46, 1) + sigB.substr(31, 1) + sigA.substr(14, 1) +
					sigB.substr(0, 32) + sigA.substr(47, 1);
			}
			break;*/

		case 83:
			//sig = Decode(sig, [ 24, 53, -2, 31, 4 ]);
			switch(sts)
			{
			case 15995:
				sig = Decode(sig, [0,9,0,-1,51,27,0,-1,0]);
				break;
			default:
				sig = Decode(sig, [0,-2,0,63,0]);
				break;
			}
			break;

		case 84:
			{
				sigA = Reverse(sig.substr(44, 40));
				sigB = Reverse(sig.substr(3, 40));

				sig = sigA + sig.substr(43, 1) + sigB.substr(0, 6) + sig.substr(2, 1) + sigB.substr(7, 9) +
					sigB.substr(39, 1) + sigB.substr(17, 22) + sigB.substr(16, 1);
			}
			break;

		case 85:
			sig = Decode(sig, [ 0, -2, 17, 61, 0, -1, 7, -1 ]);
			break;

		case 86:
			{
				//var sigA = sig.substr(2, 40);
				//var sigB = sig.substr(43, 40);

				//sig = sigA + sig.substr(42, 1) + sigB.substr(0, 20) + sigB.substr(39, 1) + sigB.substr(21, 18) + sigB.substr(20, 1);
				sig = Decode(sig, [0,12,32,0,34,-3,35,42,-2]);
			}
			break;

		case 87:
			{
				sigA = Reverse(sig.substr(44, 40));
				sigB = Reverse(sig.substr(3, 40));

				sig = sigA.substr(21, 1) + sigA.substr(1, 20) + sigA.substr(0, 1) + sigB.substr(22, 9) +
				sig.substr(0, 1) + sigA.substr(32, 8) + sig.substr(43, 1) + sigB;
			}
			break;

		case 88:
			sig = Decode(sig, [ -2, 1, 10, 0, -2, 23, -3, 15, 34 ]);
			break;

		case 92:
			sig = Decode(sig, [ -2, 0, -3, 9, -3, 43, -3, 0, 23 ]);
			break;

		case 93:
			sig = Decode(sig, [-3,0,-1,0,-3,0-3,59,-2]);
			break;

		default:
			switch(sts) //signature timestamp
			{
			case 15981:
				sig = Decode(sig, [7,37,0,-1]);
				break;
			}
			break;
	}

	return sig;
}

///
///	</Signature decipher>
///

function CustomEvent(){
	this._listeners = {};
}

CustomEvent.prototype = {

	constructor: CustomEvent,

	addListener: function(event, listener){
		if (typeof this._listeners[event] === "undefined"){
			this._listeners[event] = [];
		}

		if(typeof listener === "string") listener = window[listener];
		listener && this._listeners[event].push(listener);
		//console.log("addListener:", event, listener);
	},

	removeListener: function(event, listener) {
		if (!this._listeners.hasOwnProperty(event)) return;
		for (var i = 0, len = this._listeners[event].length; i < len; i++) {
			if (this._listeners[event][i] === listener) {
				return this._listeners[event].splice(i, 1);
			}
		}
	},

	fire: function(event, that){
		//console.log("Fire event:", event, that, arguments);
		if (this._listeners[event] instanceof Array){
			var listeners = this._listeners[event];
			for (var i=0, len=listeners.length; i < len; i++){
				var listener = listeners[i];
				//arguments is not an actual Array
				var args = [].slice.call(arguments, 2, arguments.length);
				//FIXME setTimeout: Firefox locks up otherwise, somewhere is an infinite loop?
				window.setTimeout(function(){
					listener.apply(that, args);
				}, 0);
			}
		}
	},
};

// Controls
function ScrollBar (instance) {
	this.instance = instance; //greasemonkey script instance
	this.formatter = null;
	this.offX = 0;
	this.offY = 0;
	this.value = 0;
	this.minValue = 0.0;
	this.maxValue = 100.0;
	this.type = 0;//0 - hor, 1 - vert
	this.bar = null;
	this.knob = null;
	this.userSeeking = false;
	this.instant = false;
	this.events = [];
}

ScrollBar.prototype = {
	constructor: ScrollBar,
	$: function(id){ return document.getElementById(id); },
	initSB: function(barId, knobId, type, minval, maxval, insta, formatter){
		if(typeof(type) == 'undefined') type = 0;
		if(typeof(minval) == 'undefined') minval = 0;
		if(typeof(maxval) == 'undefined') maxval = 100;
		if(typeof(insta) == 'undefined') insta = false;
		this.bar = document.querySelector(barId);
		//this.bar.ScrollBar = this;
		this.knob = document.querySelector(knobId);
		//this.knob.ScrollBar = this;
		this.knob = document.querySelector(knobId);
		this.instant = insta;
		this.formatter = formatter;

		this.bar.unselectable = "on";
		this.knob.unselectable = "on";
		this.bar.style.MozUserSelect='none';
		this.knob.style.MozUserSelect='none';
		//this.knob.style.KhtmlUserSelect='none';

		this.type = type;
		this.minValue = minval;
		this.maxValue = maxval;
		//this.knob.onmousedown = ScrollBar.eventHandlers.mouseDown;
		this.knob.addEventListener('mousedown',ScrollBar.prototype.mouseDown.bind(this),true);
		this.bar.addEventListener('mousedown',ScrollBar.prototype.mouseDownBar.bind(this),true);

		// Keep reference so these event handlers can be removed
		this.event = {
			up: ScrollBar.prototype.mouseUp.bind(this),
			move: ScrollBar.prototype.mouseMove.bind(this)
		};
	},
	register: function(ev)
	{
		this.events.push(ev);
	},
	unregister: function(ev)
	{
		for(var i=0;i<this.events.length;i++)
		{
			if(this.events[i] == ev)
			{
				this.events.splice(i,1);
				break;
			}
		}
	},
	emitValue:function(instant){
		if(this.formatter) this.formatter(this.value);
		for(var i in this.events){
			this.events[i].emitValue(this, this.value, instant);
		}
	},
	setValue: function(val){//FIXME minValue
		if(val<0) val=0;
		if(this.userSeeking || (ScrollBar._ScrollBarDragData && ScrollBar._ScrollBarDragData.Scrollbar == this)) return;
		this.value = val;
		var v = 0;

		if(this.type === 0 || this.type == 2 || !this.type)
		{
			v = (this.value - this.minValue)/(this.maxValue - this.minValue);
			v = Math.max(0.0, Math.min(1.0, v));
		}
		else
		{
			v = (this.maxValue - this.value)/this.maxValue;
			v = Math.max(0.0, Math.min(1.0, v));
		}

		if(this.type === 0 || !this.type)
			this.knob.style.left = Math.round(v * (this.bar.clientWidth - this.knob.clientWidth)) + "px";
		else if(this.type == 1)
			this.knob.style.top = Math.round(v * (this.bar.clientHeight - this.knob.clientHeight)) + "px";
		//Set knob width
		else if(this.type == 2)
			this.knob.style.width = Math.round(v * this.bar.clientWidth) + "px";
		// TODO vertical if you want
		//else if(this.type == 3)
		//	...

		if(this.formatter) this.formatter(this.value);
	},
	getValue: function(){ return this.value; },
	setMaxValue: function(max){ this.maxValue = max; },
	setMinValue: function(min){ this.minValue = min; },
	mouseDownBar: function(ev){
		if(this.type < 2 && ev.explicitOriginalTarget == this.knob) return;
		this.userSeeking = true;
		this.off = 0;
		var node = this.bar;
		var horizontal = (this.type % 2 === 0);
		while(node.offsetParent)	// bar's position is relative so loop through parent nodes
		{							// maybe there's some better tricks
			this.off += horizontal ? node.offsetLeft : node.offsetTop;
			node = node.offsetParent;
		}
		if(this.type === 0 || !this.type)
			this.knob.style.left = ev.pageX - this.off - this.knob.clientWidth / 2 + "px";
		else if(this.type == 1)
			this.knob.style.top = ev.pageY - this.off - this.knob.clientHeight / 2 + "px";

		//Simulate events
		this.mouseDown(ev);
		this.mouseMove(ev);
	},
	mouseDown: function(ev){
		this.userSeeking = true;
		this._ScrollBarDragData = {
				pageX:    ev.pageX,
				pageY:    ev.pageY,
				dx:         ev.pageX - this.knob.offsetLeft,
				dy:         ev.pageY - this.knob.offsetTop,
				startValue: this.value,
			};
		document.addEventListener('mouseup',this.event.up,true);
		document.addEventListener('mousemove',this.event.move,true);
	},
	mouseUp: function(ev){
		this.userSeeking = false;
		document.removeEventListener('mouseup',this.event.up,true);
		document.removeEventListener('mousemove',this.event.move,true);
		this._ScrollBarDragData = null;
		this.emitValue(false);
	},
	mouseMove: function(ev){
		var x,y,w,h;
		switch(this.type){
			case 0:
				x = ev.pageX - this._ScrollBarDragData.dx;
				w = this.bar.clientWidth - this.knob.clientWidth;
				if( x < 0 ) x = 0;
				if( x > w ) x = w;
				this.knob.style.left = x + "px";
				if(w !== 0) //eh weird, otherwise NaN sometimes if user drags 'over the edge'
					this.value = x/w * (this.maxValue - this.minValue) + this.minValue;
				//this.knob.title = Math.floor(x/w * 100) + '%';
				break;
			case 1: //FIXME minValue
				y = ev.pageY - this._ScrollBarDragData.dy;
				h = this.bar.clientHeight - this.knob.clientHeight;
				if( y < 0 ) y = 0;
				if( y > h ) y = h;
				this.knob.style.top = y + "px";
				if(h !== 0) //eh weird, otherwise NaN sometimes if user drags 'over the edge'
					this.value = this.maxValue - (y/h * this.maxValue);
				break;
			case 2:
				//Seems that 'border' width of 2px comes into play
				x = ev.pageX - this.off - 2;
				w = this.bar.clientWidth;
				if( x < 0 ) x = 0;
				if( x > w ) x = w;
				this.knob.style.width = x + "px";
				if(w !== 0)
					this.value = x/w * (this.maxValue - this.minValue) + this.minValue;
				break;
		}
		if(this.instant) this.emitValue(true);
	},
};

function ccTimer()
{
	/*jshint validthis: true */
	this.ccObj = null;
	this.ccOffset = 0;
	this.lastTime = 0;
	this.nodeCount = 0;
	this.reset = true;
	this.prevTexts = [];
}

ccTimer.prototype =
{
	init : function(cc)
	{
		this.ccObj = cc;
		this.nodeCount = this.ccObj.childNodes.length;

		this.update(0);
	},
	getStart : function(offset)
	{
		if(offset>-1 && offset < this.nodeCount)
			return parseFloat(this.ccObj.childNodes[offset].getAttribute("start"));
		return 0;
	},
	getDur : function(offset)
	{
		if(offset>-1 && offset < this.nodeCount)
			return parseFloat(this.ccObj.childNodes[offset].getAttribute("dur"));
		return 0;
	},
	getLastStart : function()
	{
		return this.getStart(this.ccOffset);
	},
	getLastDur : function()
	{
		return this.getDur(this.ccOffset);
	},
	resetState: function()
	{
		this.ccOffset = -1;
		this.lastTime = 0;
		this.prevTexts = [];
		this.resetCC();
	},
	update: function(time, vlc)
	{
		//sanity check of testing code, wrap back to start
		if(this.ccOffset >= this.nodeCount || this.lastTime >= time)
		{
			this.resetState();
		}

		if(this.lastTime < time)
		{
			var newOff = this.ccOffset+1;
			while(newOff < this.nodeCount &&
				this.getStart(newOff) <= time)
			{
				newOff++;
			}
			newOff--;
			if( newOff > this.ccOffset  //is indeed a new one
				//&& time < this.getStart(newOff) + this.getDur(newOff)
			)
			{
				this.setCC(newOff, vlc);
				this.lastTime = this.getLastStart();
			}
		}

		//console.log(time);
	},

	setCC : function(offset, vlc)
	{
		//vlc.video.marquee.disable();//brute forcing, sometimes it fails to show
		//Stopping video disables marquee so keep enabling it
		vlc.video.marquee.enable(); //TODO Better place?

		var text = "";
		var prevEnd = 0;
		var line = this._unescape(this.ccObj.childNodes[offset].innerHTML);
		var time = this.getStart(offset);
		var dur = this.getDur(offset);

		if(this.prevTexts.length == 0)
			text = line;
		else
		{
			while(this.prevTexts.length && this.prevTexts[0].end <= time)
			{
				this.prevTexts = this.prevTexts.slice(1);
			}

			for(var i in this.prevTexts)
			{
				if(this.prevTexts[i].end > prevEnd)
					prevEnd = this.prevTexts[i].end;
				text += this.prevTexts[i].text + "\n";
			}
			text += line;
		}

		vlc.video.marquee.text = text;
		// TODO Limiting to 30 seconds just in case.
		vlc.video.marquee.timeout = 1000 * Math.min((time + dur > prevEnd ?  dur : prevEnd - time), 30);

		this.prevTexts.push({'text': line, 'end': time + dur});

		this.ccOffset = offset;
		this.reset = false;
	},

	resetCC : function()
	{
		this.reset = true;
	},

	_unescape: function(str)
	{
		//str = str.replace(/&amp;/g, '&').replace(/&quot;/g, '"');
		str = this.htmlDecode(str);
		str = this.htmlDecode(str);
		//str = decodeURIComponent(str);
		var m = getMatches(str, /&#(\d+);/g, 1);
		for(var i in m)
		{
			str = str.replace("&#" + m[i] + ";", String.fromCharCode(m[i]));
		}
		return str;
	},
	htmlDecode: function(input)
	{
		if(this._e === undefined) this._e = document.createElement('div');
		this._e.innerHTML = input;
		return this._e.childNodes.length === 0 ? "" : this._e.childNodes[0].nodeValue;
	}
};

function Storyboard(el, sb)
{
	this.element = null;
	this.thumbs = [];
	this.oldThumb = null;
	this.tOut = null;
	this.onetimeonly = true;
	this.story_spec_url = null;
	this.wait = 5; //reduce cpu load
	this.element = el;
	var spec = sb.split('|');
	this.story_spec_url = spec[0];
	spec = spec.slice(1);

	spec.forEach((function(a){
		a = a.split('#');
		this.thumbs.push({
			w : a[0],
			h : a[1],
			count : a[2],
			gridX : a[3],
			gridY : a[4],
			//unknown : a[5],
			n_param : a[6],
			sigh : a[7],
		});
	}).bind(this));
}

Storyboard.prototype = {
	Cmp: function(a,b)
	{
		if(!a || !b) return false;
		return (a.page == b.page &&
			//a.src == b.src &&
			a.x == b.x && a.y == b.y);
	},

	getStoryBoardSrc: function(page, i)
	{
		if(i<0) return null;
		var uri = this.story_spec_url.replace('$L', i).
			replace('$N', this.thumbs[i].n_param)
			+ "?sigh="
			+ this.thumbs[i].sigh;

		var n_param = this.thumbs[i].n_param.split('$');
		if(n_param.length>1)
			n_param = '$' + n_param[1];
		else
			n_param = n_param[0]; //special case 'default'

		return (n_param == 'default' ? uri : uri.replace(n_param, page));
	},

	//pos is normalized to 0..1
	getStoryBoardAtPos: function(pos, i)
	{
		if(i<0) return null;

		var pages = this.thumbs[i].count / (this.thumbs[i].gridX * this.thumbs[i].gridY);
		//if(this.thumbs[i].count % (this.thumbs[i].gridX * this.thumbs[i].gridY))
		//	pages++;

		page = Math.floor(pos * pages);
		if(page < 0)
			page = 0;
		else if(page >= pages)
			page = Math.floor(pages);// - 1;
		//thumbnail's index
		var image = Math.floor(pos * (this.thumbs[i].count - 1));
		image = Math.max(0, image);
		//thumbnail's index on current image page
		image -= page * this.thumbs[i].gridX * this.thumbs[i].gridY;

		//thumbnail's x,y on current image page
		var image_x = this.thumbs[i].w * (image % this.thumbs[i].gridX);
		var image_y = this.thumbs[i].h * (Math.floor(image / this.thumbs[i].gridX));

		return {
			'src': this.getStoryBoardSrc(page, i),
			'page': page,
			'pages': pages,
			'x': -image_x,
			'y': -image_y,
			'w': this.thumbs[i].w,
			'h': this.thumbs[i].h,
			};
	},

	_setImg: function(pos)
	{
		var q = Math.min(2, this.thumbs.length-1);
		var img = this.getStoryBoardAtPos(pos, q);
		if(!img) return;
		if(!this.Cmp(img, this.oldThumb))
		{
			var scale = 1;
			//scale w to 160px
			if(img.w <= 48)
				scale = 3.333;
			else if(img.w <= 80)
				scale = 2;

			if(this.onetimeonly)
			{
				if(scale > 1)//hmm, actually might need to be set again if gridX changes, but seems to work anyway
					this.element.style.backgroundSize = this.thumbs[q].gridX * 100 + "%";

				this.element.style.width = img.w*scale+"px";
				this.element.style.height = img.h*scale+"px";
				this.element.style.left = ((img.w*scale)/2 + 5) + "px";
				//above
				//this.element.style.top = (-img.h-7)+"px";
				this.onetimeonly = false;
				//Preload
				var preloads = [];
				preloads.count = 0;
				preloads.preload = function(src) {
					var img = new Image();
					var count = ++preloads.count;
					preloads[count] = img;
					img.onload = img.onerror = function() {delete preloads[count];};
					img.src = src;
				};
				for(var i=0;i<img.pages;i++)
					preloads.preload(this.getStoryBoardSrc(i, q));
			}
			this.element.style.backgroundImage = "url('"+img.src+"') ";
			this.element.style.backgroundPosition = img.x*scale+"px "+img.y*scale+"px";
			this.oldThumb = img;
		}
	},

	setImg: function(pos)
	{
		if(!this.tOut) this._setImg(pos);
		clearTimeout(this.tOut);
		this.tOut = setTimeout(this._setImg.bind(this, pos), this.wait);
	},

	//ScrollBar callback
	emitValue: function(sb, pos, instant){
		this.setImg(pos);
	},
};

function VLCObj (instance){
	this.instance = instance;
	this.prevState = 0;
	this.ccObj = null;
	this.vlc = null;
	this.controls = null;
	this.scrollbarPos = null;
	this.scrollbarVol = null;
	this.scrollbarRate = null;
	this.updateTimer = null; //probably can do without but whatever
	this.repeatTimer = null;
	this.stopUpdate = true; //true by default so that stateUpdate() would update only once
	this.lastPos = -1;
	this.lastDur = -1;
	this.ctrlDown = false;
	this.shiftDown = false;
}

VLCObj.prototype = {
	$: function(id){
		return document.getElementById(id);
	},
	_getBtn: function(id)
	{
		return this.$(/*vlc_id + */id);
	},
	_setupEvent: function(id, fn)
	{
		var btns = document.querySelectorAll("#"+id);
		[].forEach.call(btns, function(btn) {
			btn.addEventListener('click', fn, true);
		});
	},
	initVLC: function (node, sbPos, sbVol, sbRate){
		this.vlc = node ? node : this.$(vlc_id);
		//Browser has probably blocked the plugin, wait for user confirmation.
		if(!this.vlc.input)
		{
			setTimeout(this.initVLC.bind(this, node, sbPos, sbVol, sbRate), 1000);
			return;
		}
		//this.vlc.VLCObj = this;
		this.scrollbarPos = sbPos;
		this.scrollbarPos.register(this);
		this.scrollbarVol = sbVol;
		this.scrollbarVol.register(this);
		if(sbRate)
		{
			this.scrollbarRate = sbRate;
			this.scrollbarRate.register(this);
		}

		this._setupEvent("_play", this.play.bind(this));
		//this._setupEvent("_pause", this.pause.bind(this));
		this._setupEvent("_stop", this.stop.bind(this));
		this._setupEvent("_fs", this.fs.bind(this));

		this.vlc.addEventListener('MediaPlayerPlaying', this.eventPlaying.bind(this), false);
		this.vlc.addEventListener('MediaPlayerPaused', this.eventPaused.bind(this), false);
		this.vlc.addEventListener('MediaPlayerStopped', this.eventStopped.bind(this), false);
		this.vlc.addEventListener('MediaPlayerNothingSpecial', this.eventStopped.bind(this), false);
		this.vlc.addEventListener('MediaPlayerEndReached', this.eventEnded.bind(this), false);
		this.vlc.addEventListener('MediaPlayerEncounteredError', this.eventStopped.bind(this), false);
		this.vlc.addEventListener('MediaPlayerBuffering', this.eventBuffering.bind(this), false);
		//this.vlc.addEventListener('MediaPlayerPositionChanged', this.eventPos.bind(this),false);

		if(this.$(vlc_id+'_select'))
		{
			this.$(vlc_id+'_select').VLCObj = this;
			this.$(vlc_id+'_select').addEventListener('change',
				ScriptInstance.prototype.onFmtChange.bind(this.instance), false);
		}

		var keyDown = (function(ev){
			//console.log(this.ctrlDown, ev);
			//TODO #player-api tabIndex attribute affects what is set as target (body vs div)
			if(!(ev.target.tagName == "BODY" || (ev.target.tagName == "DIV" && ev.target.id == "player-api")))
				return;

			var v;
			switch(ev.keyCode)
			{
				//Start play or pause
				case KeyEvent.DOM_VK_SPACE:
					ev.preventDefault();
					this.play(true);
				break;
				case KeyEvent.DOM_VK_UP: /* up */
					if(this.ctrlDown)
					{
						ev.preventDefault();
						v = Math.ceil(this.getVolume());
						if(v > -1)
						{
							v = Math.min(v + 1, this.instance.maxVolume);
							this.setVolume(v);
							this.instance.saveVolume(v);
						}
					}
				break;
				case KeyEvent.DOM_VK_DOWN: /* down */
					if(this.ctrlDown)
					{
						ev.preventDefault();
						v = Math.ceil(this.getVolume());
						if(v > -1)
						{
							v = Math.max(v - 1, 0);
							this.setVolume(v);
							this.instance.saveVolume(v);
						}
					}
				break;
				case KeyEvent.DOM_VK_LEFT: /* left */
					if(this.ctrlDown)
					{
						ev.preventDefault();
						v = Math.max(this.getCurrentTime() - 10, 0);
						this._seekTo(v);
					}
				break;
				case KeyEvent.DOM_VK_RIGHT: /* right */
					if(this.ctrlDown)
					{
						ev.preventDefault();
						v = Math.min(this.getCurrentTime() + 10, this.getDuration());
						this._seekTo(v);
					}
				break;
				case KeyEvent.DOM_VK_SHIFT: this.shiftDown = true; break;
				case KeyEvent.DOM_VK_CONTROL: this.ctrlDown = true; break;
			}
		}).bind(this);

		var keyUp = (function(ev){
			switch(ev.keyCode)
			{
				case KeyEvent.DOM_VK_SHIFT: this.shiftDown = false; break;
				case KeyEvent.DOM_VK_CONTROL: this.ctrlDown = false; break;
			}
		}).bind(this);

		window.addEventListener("keydown", keyDown);
		window.addEventListener("keyup", keyUp);

		this.stateUpdate(); //initial update
	},
	togglePlayButton: function(isPlaying) {
		var btns = document.querySelectorAll("#_play");
		[].forEach.call(btns, function(btn) {
			var inline = btn.querySelector('i');
			if(inline) {
				inline.classList.remove('fa-play');
				inline.classList.remove('fa-pause');
				inline.classList.add(isPlaying ? 'fa-pause' : 'fa-play');
			}
			btn.querySelector('span').innerHTML = isPlaying ? _("PAUSE") : _("PLAY");
			btn.title = isPlaying ? _("PAUSE") : _("PLAY");
		});
	},
	setMarqueeColor: function(color)
	{
		if(typeof(color) === 'string')
			color = parseInt(color, 16);
		else if(color === undefined)
			color = 0xFFFFFF;
		this.vlc.video.marquee.color = color;
	},
	setupMarquee: function(x,y,align,color)
	{
		//this.vlc.video.marquee.size = 24;
		this.vlc.video.marquee.size = Math.max(Math.floor(this.vlc.video.width / 38), 14);
		// Possible alignments: CENTER, LEFT, RIGHT, TOP, TOP-LEFT, TOP-RIGHT, BOTTOM, BOTTOM-LEFT, BOTTOM-RIGHT
		if(align)
			this.vlc.video.marquee.position = align;
		//this.vlc.video.marquee.opacity = 200;
		this.vlc.video.marquee.refresh = 100;
		this.vlc.video.marquee.timeout = 0;
		if(color)
			this.setMarqueeColor(color);

		if(x && y)
		{
			this.vlc.video.marquee.x = Math.floor(x);
			this.vlc.video.marquee.y = Math.floor(y);
		}
		/*else
		{
			this.vlc.video.marquee.x = 65;
			this.vlc.video.marquee.y = Math.floor(this.vlc.video.height - (this.vlc.video.width/34) - 45);
		}*/
		this.vlc.video.marquee.disable();
		this.vlc.video.marquee.enable();
	},
	clearMarquee: function()
	{
		this.vlc.video.marquee.text = "";
		this.vlc.video.marquee.timeout = 1;
	},
	toggleMute: function()
	{
		try {
			if(!this._mute) this._mute = this.$('_mute');
			if(this._mute && this._mute.muteStyleToggle)
				this._mute.muteStyleToggle(this.vlc.audio.mute);
		} catch (e) {
			console.log(e);
		}
	},
	eventPos: function(e){
		//e is normalized 0..1
	},
	eventBuffering: function(e){
		if(e !== undefined) this.instance.setBuffer(e);
		if(this.prevState != 2)
			this.instance.playerEvents.fire('onStateChange', this.instance.moviePlayer, 3);
		this.toggleMute();
		if(this.prevState == 3 || this.prevState == 2 ||
				this.prevState == 4)
			this.prevState = 2;
		else
			this.prevState = 7;
	},
	eventStopped: function(){
		this.togglePlayButton(false);
		this.instance.setThumbnailVisible(true);
		if(this.vlc && this.vlc.audio /*&& this.vlc.audio.volume > 100*/ && !this.instance.buseRepeat)
			this.instance.restoreVolume(true);
		this.clearUpdate();
		this.instance.playerEvents.fire('onStateChange', this.instance.moviePlayer, 0);
		this.toggleMute();
		if(this.instance.isEmbed)
			this.$('cued-embed').classList.remove('hid');
		this.prevState = 5;
	},
	eventEnded: function(){
		this.eventStopped();
		if(this.eosCheck(this.lastState, this.lastPos, this.lastDur))
			return;
		this.prevState = 6;
		if(this.instance.buseRepeat)
		{
			var wait = tryParseFloat(GM_getValue('vlc-repeat-wait', "0"));
			this.repeatTimer = this.instance.win.setTimeout((function(e){this.repeatTimer = null; this.playVideo();}).bind(this), wait*1000);
		}
		else
		{
			var el = document.querySelector('.autoplay-bar .content-link');
			if(el && document.querySelector('#autoplay-checkbox').checked)
			{
				ytspf.enabled ? spf.navigate(el.href) : window.location = el.href;
			}
		}
	},
	eventPlaying: function(){
		if(this.instance.usingSubs) this.setupMarquee();
		if(this.prevState != 4 && this.prevState != 2)
			this.instance.restoreVolume();
		this.togglePlayButton(true);
		this.instance.setThumbnailVisible(false);
		this.startUpdate();
		if(this.repeatTimer)
		{
			this.instance.win.clearTimeout(this.repeatTimer);
			this.repeatTimer = null;
		}
		this.instance.playerEvents.fire('onStateChange', this.instance.moviePlayer, 1);
		this.toggleMute();
		this.prevState = 3;
	},
	eventPaused: function(){
		this.togglePlayButton(false);
		this.instance.playerEvents.fire('onStateChange', this.instance.moviePlayer, 2);
		this.prevState = 4;
	},
	doAdd: function(src, waitCount){
		//Browser has probably blocked the plugin, wait for user confirmation.
		if(!this.vlc.playlist)
		{
			setTimeout(this.doAdd.bind(this, src), 1000);
			return;
		}

		if(typeof(waitCount) == 'undefined') waitCount = 0;
		this.vlc.playlist.items.clear();

		if(this.vlc.playlist.items.count>0 && waitCount < 5){//Old crap in playlist, do not want
			//FIXME what if double clicked? hahaa
			this.instance.win.setTimeout(this.doAdd.bind(this, src, ++waitCount), 250);
			return;
		}

		//var sel = this.$(vlc_id+'_select');
		//sel && (opt = sel.options.namedItem('140'));

		var caching = tryParseFloat(GM_getValue('vlc-cache', '5'), 5) * 1000;
		var options = new Array(':http-caching=' + caching, //pre v2.0?, in v2.0 'unsafe option "http-caching" has been ignored for security reasons'
								':network-caching=' + caching,
								':live-caching=' + caching
								//,':input-slave=' + (opt ? opt.value : '')
								//, ':aspect-ratio=4:3'
								);

		//unsafe option "audio-filter" has been ignored for security reasons, dammit
		//if(this.instance.bnormVol){
			//--audio-filter normvol,equalizer --equalizer-preset largehall
			options.push(":audio-filter=normvol", ":norm-max-level=" + GM_getValue('vlc-volume-norm', 2.0));
		//}

		var id = this.vlc.playlist.add(src, 'muuvi', options);

		if(this.instance.fmtChanged || // user changed format
			this.instance.canAutoplay()) //on embedded, ignore autoplay
		{
			this.vlc.playlist.playItem(id);
			if(this.instance.usingSubs) this.setupMarquee();
			this.stateUpdate();
		}
		if(this.instance.fmtChanged && this.instance.bresumePlay)
			this._seekTo(this._current_time);
	},
	add: function(src, fmt){
		//Format changed, resume play
		this._current_time = this.getCurrentTime();
		this.doAdd(src, 0);
		if(this.$('vlclink'))
		{
			var title;
			try{

				title = this.instance.swf_args.title;
				// Youtube server sends content-disposition header then
				if(fmt != 'dash') src += "&title=" + title.replace(/&/g, "%26");
				//Just in case firefox respects the html5 "download" attribute
				//but content-disposition probably overrides this with useless "videoplayback" anyway
				this.$('vlclink').setAttribute("download", title + "-" + fmt.replace("/", "."));
			}catch(e){}

			this.$('vlclink').href = src;
		}
	},
	emitValue:function(sb, pos, instant){
		if(this.scrollbarPos == sb)
		{
			if(instant)
				this.setTimes(this.vlc.input.length * (pos/sb.maxValue), this.vlc.input.length);
			else
			{
				pos = pos/sb.maxValue;
				//workaround for NPVariant type being INT32 if pos is 0 or 1
				//and then npapi plugin returning invalid value error
				if(pos < 0.000001) pos = 0.000001;
				else if(pos > 0.999999) pos = 0.999999;
				this.vlc.input.position = pos;
			}
		}
		else if(this.scrollbarVol == sb)
		{
			this.instance.saveVolume(pos); //messes with a player in another tab
			this.vlc.audio.volume = pos;
			//this.scrollbarVol.bar.children.namedItem('vlcvol').innerHTML = Math.round(pos);
		}
		else if(this.scrollbarRate == sb)
		{
			this.vlc.input.rate = pos;
			//this.scrollbarRate.bar.children.namedItem('vlcrate').innerHTML = pos.toFixed(3);
		}
	},
	//Button click events
	play: function(ev){
		var toggle = true;
		if (typeof(ev) === 'boolean') toggle = ev;
		//this.instance.setThumbnailVisible(false);
		var jumpable = (this.prevState == 5 || this.prevState == 6);
		if(toggle === true && this.vlc.input.state == 3)
			this.vlc.playlist.pause();
		else
			this.vlc.playlist.play();

		this.stateUpdate();

		if(this.instance.bjumpTS && jumpable)
			this.instance.onHashChange(this.instance.win.location.href);
	},
	pause: function(){
		this.vlc.playlist.togglePause();
	},
	stop: function(){
		this.vlc.playlist.stop();
	},
	fs: function(){
		this.vlc.video.toggleFullscreen();
	},
	//Youtube stuff
	addEventListener: function(event, func, bubble){
		console.log("Tried to add event listener for:", event);
	},
	removeEventListener: function(event, func, bubble){
		console.log("Tried to remove event listener for:", event);
	},
	_seekTo: function(pos){ //Make yuutuub comments' timestamps work
		if(this.vlc.input)
			this.vlc.input.time = pos * 1000;
	},
	seekTo: function(pos){ // Gets overriden by YT
	},
	getCurrentTime: function(){ //Make yuutuub share work, randomly stops :/
		if(this.vlc.input)
			return this.vlc.input.time / 1000;
		else
			return 0;
	},
	pauseVideo: function(){
		this.vlc.playlist.pause();
	},
	playVideo: function(){
		this.vlc.playlist.play();
		this.stateUpdate();
	},
	stopVideo: function(){
		if(this.vlc.playlist)
			this.vlc.playlist.stop();
	},
	getDuration: function(){
		return this.vlc.input.length / 1000;
	},
	getAvailableQualityLevels: function() //Yt uses 'large', 'medium', etc?
	{
		var q = [];
		for(var i in this.instance.qualityLevels)
			q.push(itagToText[this.instance.qualityLevels[i]]);
		return q;
	},
	getPlaybackQuality: function() //Yt uses 'large', 'medium', etc?
	{
		return itagToText[this.instance.quality];
	},
	setPlaybackQuality: function(q)
	{
		itag = q;
		if(q in textToItag)
			itag = textToItag[q];
		var opt = this.instance.selectNode.options.namedItem(itag);
		if(!opt) return;
		this.instance.fmtChanged = true;
		opt.selected = true;
		this.instance.onFmtChange(null, opt);
	},
	getVolume: function()
	{
		try{ return this.vlc.audio.volume; }
		catch(e){ return -1; }
	},
	setVolume: function(v)
	{
		try{ this.vlc.audio.volume = v; this.scrollbarVol.setValue(v);}
		catch(e){}
	},
	//End of Youtube stuff
	setTimes: function(cur, dur)
	{
		this.scrollbarPos.bar.children.namedItem('vlctime').innerHTML = fmttime(cur) + ( dur !== undefined ? " / " + fmttime(dur) : "");
	},
	startUpdate: function()
	{
		this.stopUpdate = false;
		this.updateTick();
	},
	clearUpdate: function(noUpdate)
	{
		this.stopUpdate = true;
		this.instance.win.clearTimeout(this.updateTimer);
		if(!noUpdate)
			this.stateUpdate(); //final update
		//stupid hang
		this.instance.win.setTimeout(this.playlistNext.bind(this), stateUpdateFreq);
	},
	updateTick: function()
	{
		this.stateUpdate();
		this.playlistNext();
		if(!this.stopUpdate)
			this.updateTimer = this.instance.win.setTimeout(this.updateTick.bind(this), stateUpdateFreq);
	},
	goto: function(link)
	{
		win = this.instance.win;
		shuf = document.querySelector('div.playlist-nav-controls button.shuffle-playlist');
		link += shuf && shuf.classList.contains('yt-uix-button-toggled') && !link.match(/shuffle/i) ?
					"&shuffle="+this.instance.yt.getConfig('SHUFFLE_VALUE', 0) : "";
		if(win.spf && win.spf.navigate)
			win.spf.navigate(link);
		else
			this.instance.win.location.href = link;
	},
	stateUpdate: function()
	{
		try
		{
			if(this.vlc.input && !this.scrollbarPos.userSeeking)
			{
				if(!(this.instance.buseHoverControls && this.instance.getStyle('vlc_controls_div').display=='none'))
					this.scrollbarPos.setValue(this.vlc.input.position*this.scrollbarPos.maxValue);
				//this.controls.children.namedItem('vlcstate').innerHTML = VLC_status[this.vlc.input.state];
				var rp = document.querySelector('#progress-radial');
				rp.innerHTML = VLC_status[this.vlc.input.state][0];
				rp.title = VLC_status[this.vlc.input.state];
				//TODO Reloading on error or not if #vlc-error is in url already
				//if(this.vlc.input.state == 7 && typeof this.reloading == 'undefined' && !/#vlc-error/.test(window.location))
				//	this.reloading = setTimeout(function(){window.location += "#vlc-error"; window.location.reload();}, 3000);
				//console.log(this.vlc.input.time, this.vlc.input.length, (this.instance.swf_args ? this.instance.swf_args.length_seconds : "<nul>"));
				this.setTimes(this.vlc.input.time,
					this.vlc.input.length > 0 ? this.vlc.input.length : (this.instance.swf_args ? 1000*this.instance.swf_args.length_seconds : 0));

				this.eosCheck(this.lastState, this.lastPos, this.lastDur);
				this.lastState = this.vlc.input.state;
				this.lastPos = this.vlc.input.time;
				this.lastDur = this.vlc.input.length;
			}

			if(this.ccObj) this.ccObj.update(this.vlc.input.time / 1000, this.vlc);

		}
		catch(e)
		{
			if(console) console.log('stateUpdate: ' + e);
		}
	},
	playlistNext: function()
	{
		if(!this.instance.nextFailed && this.vlc.input.state == 6 && this.instance.yt &&
				this.instance.ytplayer
				&& this.instance.bautoplayPL
				//&& GM_getValue('vlc-pl-autonext', false) //no button watch8 layout
				)
		{
			//Uncomment if you want some delay before next starts to play
			//setTimeout(function(){
				var current = document.querySelector('ol.playlist-videos-list li.currently-playing');
				var next = current ? current.nextElementSibling : null;
				next = next ? next.querySelector('a') : null;
				if(next)
				{
					console.log("going to play next one.", next.href);
					this.goto(next.href);
				}
				else if((next = document.querySelector('ol.playlist-videos-list li a'))) //first
				{
					console.log("from the top.");
					this.goto(next.href);
				}
				else
				{
					this.instance.nextFailed = true;
				}

			//}, 3000); //wait 3 secs
			//return;//Stop stateUpdate, if using setTimeout
		}
	},
	eosCheck: function(s,p,d)
	{
		if((this.vlc.input.state == 6) &&
			//(s == 3 || s == 4) &&
			(s > 0) &&
			// ignore last 15 seconds
			(p < d - 15*1000) &&
			!this._timeout
		)
		{
			console.log("Unexpected EOS. Restarting play.");
			this.clearUpdate(true);
			this.lastState = 0;
			this._timeout = this.instance.win.setTimeout(
				(function(){
					this.playVideo();
					this.vlc.input.time = p;
					this._timeout = null;
				}).bind(this),
			1000);
			return true;
		}
		return false;
	},
};

/* ***********************************************
 *         ScriptInstance constructor
 * ***********************************************/

/// Script instance to allow popup windows live separately. Works?
function ScriptInstance(win)
{
	this.gTimeout = null;
	this.width = 640;
	//this.widthWide = GM_getValue('vlc-wide-width', '86%'); //854; //Supports plain numbers as pixels or string as percentages
	this.minWidthWide = 854; //min width with percentages
	this.height = 480;
	this.win = win;
	this.myvlc = null;
	this.yt = null;
	this.ytplayer = null;
	this.swf_args = null;
	this.isEmbed = false;
	this.sbPos = null;
	this.sbVol = null;
	this.sbRate =null;
	this.ratePreset = null;
	// User didn't change format etc so don't save the settings
	this.fmtChanged = false;
	this.isWide = false;
	this.usingSubs = false;
	this.nextFailed = false; //Failed to get next video in playlist
	this.thumb = null; //thumbnail node
	this.moviePlayer = null;
	this.playerEvents = null;
	this.quality = null;
	this.qualityLevels = [];
	this.isCiphered = false;
	this.sigDecodeParam = null;
	this.storyboard = null;
	this.urlMap = [];
	this.inited = false;
	this.elements = {};
}

ScriptInstance.prototype.init = function(popup, oldNode, upsell)
{
	this.widthWide = GM_getValue('vlc-wide-width', '86%'); //854; //Supports plain numbers as pixels or string as percentages
	this.initVars();
	this.isPopup = popup;
	//Is on embedded iframe page?
	this.isEmbed = /\/embed\//i.test(this.win.location.pathname);

	//Hijack 'getElementById' so YT js can do its job and also not overwrite vlc with flash again.
	//FIXME but srsly something less intrusive maybe
	this.fakeApiNode = document.createElement('div');
	//document._getElementById = document.getElementById;
	var _getElementById = document.getElementById.bind(document);
	this._getElementById = _getElementById;
	document.getElementById = (function(id){
		//console.log("Hijacked getElementById:", id);
		if(id == 'player-api') {
			//console.log("Returning fake 'player-api' node");
			return this.fakeApiNode;
		}
		var el = _getElementById(id);
		return el;
	}).bind(this);

	var unavail = this.$('player-unavailable');
	if(unavail && !unavail.classList.contains("hid") && !unavail.classList.contains("ytp-error")) //works?
	{
		console.log("video seems to be unavailable");
		return;
	}
	unavail && (unavail.id = "player-unavailable-off");

	this.putCSS();

	if(!this.isEmbed || this.isPopup)
	{
		this.onMainPage(oldNode, false, upsell);
	}
	else
	{
		this.exterminate();
		this.onEmbedPage();
	}

	for(var i in itagToText)
	{
		textToItag[itagToText[i]] = parseInt(i);
	}

	//TODO which works the best
	this.win.addEventListener('beforeunload', this.saveSettings.bind(this), true);
	//this.win.addEventListener('unload', this.saveSettings.bind(this), true);

	var spfnavigate = (function() {
		//console.log("navigate");
		this.navigating = true;
		this.myvlc.clearMarquee();
		if(!this.bmusicMode)
			this.myvlc.stopVideo();
	}).bind(this);

	var spfinit = (function() {
		//console.log("init");
		if(this.navigating)
		{
			setTimeout((function(){
			this.myvlc.clearMarquee();
			clearWLButtonState();
			this.onMainPage(null, true);
			if(/\/user\//.test(this.win.location.href) ||
				/\/channel\//.test(this.win.location.href))
				loadPlayer(this.win, null, true);
			}).bind(this), 10);
			window.postMessage (JSON.stringify ({key: 'spf_method', value: 'navigate'}), window.location.origin);
		}
		this.navigating = false;
	}).bind(this);

	document.addEventListener('spfrequest', spfnavigate, false);
	document.addEventListener('spfdone', spfinit, false);

	//HTML5 player. Just bulldozer this thing. See also ytplayer.load()
	if(yt && yt.player)
	{
		if(yt.player.Application && yt.player.Application.create)
		yt.player.Application.create = function(a,b)
		{
			//console.log("Suck it Trebek!");
			return {};
		};
		yt.player.utils.videoElement_ = this.fakeApiNode;
	}
	this.inited = true;
};

ScriptInstance.prototype.initVars = function(){
	this.maxVolume = tryParseFloat(GM_getValue('vlc-volume-max', "100"), 100.0).toFixed(0);
	///User configurable booleans
	this.setDefault("bautoplay", true);
	this.setDefault("bautoplayPL", true);
	this.setDefault("bautoplayYT", false);
	//Some formats don't seek so well :(
	this.setDefault("bresumePlay", false);
	//Maybe obsolete, // TODO should make controls take up just one "line"
	this.setDefault("bembedControls", false);
	this.setDefault("buseHoverControls", false);
	// Preloads video info, set to false if things get too slow
	this.setDefault("bforceLoadEmbed", true);
	this.setDefault("badd3DFormats", false);
	// Force player div to use widescreen size. Can be helpful with smaller screens.
	this.setDefault("bforceWS", false);
	// Consider this a WIP
	this.setDefault("bcompactVolume", false);
	this.setDefault("balwaysBestFormat", false);
	this.setDefault("bforceWide", false);
	this.setDefault("bforceWidePL", false);
	this.setDefault("buseThumbnail", true);
	this.setDefault("bshowRate", false);
	this.setDefault("bshowRatePreset", false);
	this.setDefault("buseRepeat", false);
	this.setDefault("buseWidePosBar", false);
	this.setDefault("busePopups", false);
	this.setDefault("bpopupAutoplay", true);
	this.setDefault("bpopupSeparate", false);
	//this.setDefault("bignoreVol", false); //well, 'Always reset audio level to' doesn't appear to work with the plugin :/
	//this.setDefault("bnormVol", false); //security, ignored
	this.setDefault("bscrollToPlayer", false);
	this.setDefault("bconfigDropdown", true);
	this.setDefault("buseFallbackHost", false);
	//flv sucks at seeking
	this.setDefault("bdiscardFLVs", true);
	//make a bit friendlier for dark themes
	this.setDefault("bdarkTheme", false);
	this.setDefault("badaptiveFmts", false);
	this.setDefault("bshowMute", false);
	this.setDefault("bjumpTS", false);
	this.setDefault("bshowWLOnMain", false);
	this.setDefault("bautoSubEnable", false);
	this.setDefault("bbtnIcons", true);
	this.setDefault("bcustomWide", false);
	this.setDefault("bmusicMode", false);
	this.setDefault("bignoreSidebar", false);
};

/// Helpers
ScriptInstance.prototype.setDefault = function(key, def)
{
	if(GM_getValue(key, undefined) === undefined) GM_setValue(key, def);
	this[key] = this.win[key] = GM_getValue(key, def);
};

ScriptInstance.prototype.$ = function(id)
{
	var el = this._getElementById && this._getElementById(id) ||
		document.getElementById(id);
	return el;
};

ScriptInstance.prototype.$$ = function(id)
{
	return document.getElementsByClassName(id);
};

ScriptInstance.prototype.getStyle = function(el, pseudo)
{
	if(typeof(el) === 'string')
		el = this.$(el);
	return this.win.getComputedStyle(el, pseudo);
};

function getComputedPx(element, property)
{
	var p = window.getComputedStyle(element).getPropertyCSSValue(property);
	return p.getFloatValue(CSSPrimitiveValue.CSS_PX);
}

//eh, vlc not restoring volume so brute force it. timing issues? also greasemonkey access violation?
ScriptInstance.prototype.saveVolume = function(sbVol)
{
	if(this.myvlc && this.myvlc.vlc && this.myvlc.vlc.audio)
	{
		var vol = this.myvlc.vlc.audio.volume;
		if(sbVol)
			GM_setValue('vlc_vol', Math.round(sbVol));
		else if(vol > -1)
			GM_setValue('vlc_vol', vol);
	}else if(sbVol)
		GM_setValue('vlc_vol', Math.round(sbVol));
};

ScriptInstance.prototype.restoreVolume = function(stopped)
{
	if(!this.myvlc || !this.myvlc.vlc.audio) return;
	//Desktop app might have volume over 100% (app/plugin, all the same to pulseaudio)
	var volSaved = Math.min(GM_getValue('vlc_vol', 100), 100);
	if(volSaved < 0) GM_setValue('vlc_vol', 100); //fix bad save
	//if(!bignoreVol)
		this.myvlc.vlc.audio.volume = volSaved;

	var setVol = (function(v)
	{
		var s = this.$('vlc-spacer');
		var c = this.$('vlc_controls_div');
		//otherwise knob's position doesn't get updated
		if(s && c) c.style.display = 'block';
		if(this.bcompactVolume) this.sbVol.bar.style.display = 'block';

		this.sbVol.setValue(v);
		this.sbVol.bar.children.namedItem('vlcvol').innerHTML = v;

		if(this.bcompactVolume) this.sbVol.bar.style.display = '';
		if(s && c) c.style.display = '';
	}).bind(this); //Haa :P

	if(this.sbVol)
	{
		setVol(volSaved); //New strategy, just keep hammering vlc with saved volume
		if(/*!stopped && */this.myvlc.vlc.input.state == 3 &&
			(this.myvlc.vlc.audio.volume < 0 || this.myvlc.vlc.audio.volume!=volSaved)){
			setTimeout(this.restoreVolume.bind(this), 250);
		}
	}
};

ScriptInstance.prototype.restoreSettings = function(ev){
	this.restoreVolume();

	var formats = GM_getValue("vlc-formats", undefined);
	if(formats)
		formats = cleanFormats(formats.split(','));
	else
		formats = itagPrio;

	//quality
	var q = GM_getValue('ytquality', undefined);
	var sel = this.$(vlc_id+'_select');
	if(!sel) return false;
	var opt = sel.options.namedItem(q);

	if(!opt || GM_getValue('balwaysBestFormat', false))
	for(var i in formats)
	{
		opt = sel.options.namedItem(formats[i]);
		if (opt) break;
	}

	if (opt)
	{
		opt.selected = true;
		//this.onFmtChange(null, opt);
	}
	return true;
};

ScriptInstance.prototype.saveSettings = function(ev){
	this.saveVolume();

	if(this.fmtChanged && this.selectNode)
	{
		GM_setValue('ytquality', this.selectNode.options[this.selectNode.selectedIndex].getAttribute('name'));
	}
};

ScriptInstance.prototype.insertYTmessage = function(message){

	console.log(message);
	var baseDiv,container,msg;
	msg = this.$('iytmsg');

	if(!msg){
		baseDiv = this.$('alerts');
		container = document.createElement('div');
		msg = document.createElement('pre');
		link = document.createElement('a');
		link.href= "#";
		link.onclick = function(){removeChildren(baseDiv, true); return false;};
		link.innerHTML = "Close";
		msg.id = "iytmsg";
		container.setAttribute("style","position:relative;background: #FFA0A0; color: #800000; border: 1px solid; border-color: #F00;");
		msg.setAttribute("style","text-align:center; margin-top:1em; margin-bottom:1em;");
		container.appendChild(link);
		container.appendChild(msg);
		baseDiv.appendChild(container);

		//baseDiv.insertBefore(container,
		//    document.getElementById('content'));

	}else{
		message = "\r\n" + message;
	}

	msg.appendChild(document.createTextNode(message));
};

ScriptInstance.prototype.replaceYTmessage = function(message){
	this.$('iytmsg').innerHTML=message;
};

ScriptInstance.prototype.addScriptSrc = function(src) {
	var head, script;
	head = document.getElementsByTagName('head')[0];
	if (!head) { return; }
	script = document.createElement('script');
	script.type = 'text/javascript';
	script.setAttribute('src', src);
	head.appendChild(script);
};

ScriptInstance.prototype.addScript = function(src) {
	var head, script;
	head = document.getElementsByTagName('head')[0];
	if (!head) { return; }
	script = document.createElement('script');
	script.type = 'text/javascript';
	if(typeof src == "function")
		src = "(" + src.toString() + ")();";
	script.appendChild(document.createTextNode(src));
	head.appendChild(script);
};

ScriptInstance.prototype.addCSS = function(css, before, islink){

	/*if (typeof GM_addStyle != "undefined") {
		GM_addStyle(css);
	} else if (typeof addStyle != "undefined") {
		addStyle(css);
	} else */{
		var node, heads = document.getElementsByTagName("head");
		if (heads.length > 0) {
			if(islink) {
				node = document.createElement("link");
				node.setAttribute('rel', 'stylesheet');
				node.setAttribute('href', css);
			} else {
				node = document.createElement("style");
				node.type = "text/css";
				node.appendChild(document.createTextNode(css));
			}
			if(before && heads[0].hasChildNodes())
			{
				heads[0].insertBefore(node, heads[0].firstChild);
			}
			else
				heads[0].appendChild(node);
		}
	}
};

ScriptInstance.prototype.putCSS = function(){

	//this.addCSS("//netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.css", true, true);
	this.addCSS("@font-face { font-family: 'FontAwesome'; \
		/*src: url('//netdna.bootstrapcdn.com/font-awesome/4.0.3/fonts/fontawesome-webfont.woff?v=4.0.3') format('woff'), \
		url('//netdna.bootstrapcdn.com/font-awesome/4.0.3/fonts/fontawesome-webfont.ttf?v=4.0.3') format('truetype');*/\
		src: url('data:application/octet;base64,d09GRgABAAAAAAjoAA0AAAAADbgAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAABGRlRNAAABMAAAABoAAAAca0B+nEdERUYAAAFMAAAAHwAAACAAOwAGT1MvMgAAAWwAAABIAAAAVkCS61ljbWFwAAABtAAAAGkAAAGKgyXmjGdhc3AAAAIgAAAACAAAAAj//wADZ2x5ZgAAAigAAAS9AAAHGF9TqxtoZWFkAAAG6AAAAC0AAAA2BSIkyWhoZWEAAAcYAAAAHAAAACQNowYPaG10eAAABzQAAAAmAAAAOEQJABtsb2NhAAAHXAAAAB4AAAAeCQgHWm1heHAAAAd8AAAAHgAAACAAWwCzbmFtZQAAB5wAAAD2AAACLpUfDTJwb3N0AAAIlAAAAFIAAACWEU5aPnicY2BgYGQAgjO2i86D6PONuc9gNABP5QfCAAB4nGNgZGBg4ANiCQYQYGJgZGBm4AWSLGAeAwAE8wBCAHicY2BkvcA4gYGVgYOlh+UZAwPDLwjNHMMQyXiegYGJgZWZAQ4EEEyGgDTXFAaHBwwfs9gY/jMwLGRjYGRoYAASQAAAXAUNDXicY2BgYGaAYBkGRgYQaAHyGMF8FoYMIC3GIAAUYWNgeMDwQfyD5AffD6kf+j5s+pj+Mev/f5AGqLg3qrgCM/9b/jf8u/mX8NfwR/It5VsMNR8LYASaDpNkZAISTOgKcOkcPgAA/doiBAAAAAAAAAH//wACeJx1VF1oHFUUvmcms5us2Z+ZnZ1pZ5P935ltarfp/G1ISLttmsaUQmOU1jSwtiRY+/OgpRAKVhcRrcWHmIe+aGkRWshDacGiBV8WQRSEWOuLvpSC6INgQXxyyd567t1tkrY6DHfOufd85373O+cOAbLh2UGISMijeoBIdaKSDHmeEJDVQD6bM0fB9UdAZoOtkVgZMhGIpSDjk5jQlSkIMaWQ6RLrSoQ2IooSeaBEqhEFri416c/NpaUmlJpwZoVeoTV6ZWUFjsFncEx8QKsslgUeRaNFMWqpgxBe3Ri6soL0uhjHALIjQRIlRTJKSME1cwFVsx9/4x22HhJ1srpm74KsrYEWhEDOArOCk3zF1hJy1paI6ZqmCyb/XB8qNauloaES/PjB8KfDF+BuaYh+JadpVfEVWk3L8gAQ0wBimEAGrrttFHshQxsciPALQ/gK8pZ+Wo3HodG/xYKGYZoGrRLU+tFb0jvSe+Q5QnogwFnqoKnS6827ejarS4O6cKyVCquG1DDUMFoFdmRhrSZRkl6viNc5ifSUH0CSlLA9BRxX6xs9qdqsM1vi4wab7QMb9nlmF5Z1Pf6JPE9y1Ml29NUg6Np6BjsNwAfMmtsOwAbTrYBltrMLf4fo7cU4kwkTuvFFOBAyQmdEndn0NrNDITjAIpic8KfB41F97vN4DJ9kcA7AeIMD3DV+rG2wdyyy69nT9QP3AwlZ1dD3vU6j/x9fqb68sNpYWF5eEHi7t6p7arU9Io7tdq4j71uts23ewke34m35haOUg8TqwjIPrO1ZbTAksIsgTrNCcRynz3CM/npdJrBvhIqvY/dyvpa5C3pQ6ODjw1T8NE6gi0uds+laFKcs3vus7VW+Kon0MswtYnsyzQdkOb1IL9PLi6zLmYglK7UIczgRN3p7S0xlHgNzCOI3AVW3wr1GXPz1v3Ep6ylUXGqjWATfm0ewvaU4wRuRfESk37A+Pdh9OtmKt3uWzJHz5EPyCbmJFUuoSFv2HVtK5D3XLjpeNuHITtaR83LnvHlZ1TXHrhQ91zLzuaCXlx2PTfhFL8/PPQpOZy2AJefBfsUHz82ha4MajKB4GauMenluZSdU/IyeQoHBETG7aZmWE5cSbQnZLxFFRYGLct7rUHA6FGTxe0vXNN2C6SNHVodP0e9OzENmZiaVVESY6e4tD/pwo0f27a0zM9sGfbkHpmeFYLb8edIa22v19VvjLxQUUWhdPXRI+MGIvDJ8p2XcGZ4JG2iPfCn8zu1V47Vz85Htxb6TE/BFX3F8zOzrM8fGi31wcNazy+HuWRCVZAoKP41psE3bWy7vvVSrtb6Fh/T9gYSYgdP03I5NxdHaN5PGkP9L68RgpZJ8KeyECuOHjx8sOk7x4A38eMlkj/j1vfHxe/tah/84OzIVSCQCUyNvPGR2UFWDaHdF6Jv0L4juv3j8ZfrPvpsvItqcujnFkkzTcGVncZMDF+nHWUHbCufX7qNEsNrsf+Hi3znIrh9XDwoqFmKtFmXBxVKsVSMFEklRks5ls7GoGhGIkBKi0djJifurb9+fOBWLRIWOL77b8Wf3y1BVFcVs1U2lOwTVS43T13ZPzndv3tw9P7n72uknXfIvff2GZgAAAHicY2BkYGAA4rY48VPx/DZfGbjZGUDgfGPuMwT9n4GdgQ3E5WBgAlEAJEgJ1QAAAHicY2BkYGBj+M/AsJCdAQSAJCMDKuADADFFAcV4nGM8wAAGTKEMDIxfGBjYgGy2BgYG1gYoG4rZEWxpEBsAiXYDZgAAAAAAAAAAAAAACABWALYA0gEGASQBdAHSAkQDPAOMAAB4nGNgZGBg4GPYwMDNAAJMQMzIABJzAPMZABXgAQ8AAHicrY+7TsMwFIY/t2lRBWIrE4PnqokSq+rQkSEDY4YMbAG5UaU0lpxedh6Cx+GZeAROUi9IDEjU0tH5/Ps/FwN3fKDoj2LOMvCIG4rAYzI+A0fM1WPgCbfqOfBU9HdxqmgmymKo6nnEPU+Bx7zyEjgSz1fgCQ/KBJ6yUCVbHC0HKs5YOrntJXuJmiON6J6T5DfYuvZQnW3n9tbb+thU/tSIXPzwUlyeIA+d++zFYdEYElLJG4m/T774DWtiVhJGemRC5LJR7nxttUlSvdG/bii6Wcer2KSZlPz/v+Xg79gNnbRs0v+J0vpu51qdJekVpnwDJIhomAAAeJx9xUsSQDAQRdG8+MSvrKWjSBgKsRcTM/sPusdu1a2jtPqvf4bS0MiQo0AJgwo1GrTozH2dkYheD7JeXNgxiJu4s25i58iG4dM6L64JalcY5wAA') \
		format('woff'); font-weight: normal; font-style: normal; }", true);

	this.addCSS(".fa { display: inline-block; font-family: FontAwesome; font-style: normal; font-weight: normal; line-height: 1; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;} .fa-lg{font-size: 1.3333333333333333em;line-height: 0.75em;vertical-align: -15%;}");
	this.addCSS('.fa-play:before{content:"\\f04b";}.fa-pause:before{content:"\\f04c";}.fa-stop:before{content:"\\f04d";}.fa-expand:before{content:"\\f065";}.fa-external-link:before{content:"\\f08e";}.fa-arrows-alt:before{content:"\\f0b2";}.vlc-fa-youtube:before{content:"\\f167";}.fa-youtube-play:before{content:"\\f16a";}.fa-download:before{content:"\\f019";}.fa-clock-o:before{content:"\\f017";}');

	this.addCSS("button .fa ~ span { display: none; } a .fa ~ span { display: none; }");

	var css = ".player-api {overflow: visible;} /*for storyboard tooltip*/\
	#"+ vlc_id + "-holder {overflow: hidden;}\
	#cued-embed #video-title {position: absolute; left: 5px; top: 5px; background: rgba(0,0,0,0.75); z-index: 1;} \
	.movie_player_vlc { background: white; height:100%; position:relative;} \
	.movie_player_vlc select {padding: 5px 0;}\
	a.vlclink { color:#438BC5; margin:5px;}\
	.vlc_hidden { display:none !important; }\
	.vlc_hid { display:none; }\
	.vlccontrols {padding:2px 5px; color: #333333;display: table}\
	/*.vlccontrols div {margin-right:5px; }*/\
	.vlc-scrollbar {cursor: default;position: relative;width: 90%;height: 18px;border: 1px solid rgba(126, 182, 226, 0.25);display: inline-block;text-align: center;\
		margin-right: 5px; border-radius: 3px;background: #FFF; color: #444;\
		/*background: radial-gradient(ellipse at 50% 50% , rgba(27,127,204,0.25), rgba(255, 255, 255, 0.1) 90%);*/\
		text-shadow: 1px 1px 1px #FFF; line-height: 18px;}\
	.vlc-scrollbar:last-child { margin-right: 0;} \
	#sbVol { width: 80px; } #sbRate { width: 150px; } \
	.vlc-scrollbar .knob {left:-1px;top:-1px;position:absolute;width:0px;height:18px;\
		/*background:rgba(27,127,204,0.5);*/\
		background:linear-gradient(to right, rgba(27,127,204,0), rgba(27,127,204,0.5)); \
		border:1px solid rgba(27,127,204,0.7); box-shadow:0px 0px 3px rgba(27,127,204,0.7);}\
	/*#sbVol .knob {background: rgba(0,51,153,0.8);}\
	#sbRate .knob {background: rgba(0,153,51,0.8);}*/\
	.sb-narrow { width: 125px; }\
	.vlc-volume-holder { display:inline-block; } \
	#vlcvol:after {content: '%';}\
	.bar-text { position: relative /*should fix z-index*/;}\
	.progress-radial {\
		margin-right: 5px;\
		background-repeat: no-repeat; \
		line-height: 16px; text-align: center; color: #EEE; font-size: 12px; \
		display: inline-block; width: 16px; height: 16px; border-radius: 50%; border: 2px solid #2f3439; background-color: tomato;}\
	#vlc-thumbnail { width: 100%; height: 100%; cursor: pointer; }\
	#vlc-sb-tooltip { float:right; border: 2px solid black; background: #000 no-repeat; z-index:9999; width: 80px; height: 45px; \
		position: relative; border-radius: 3px;left: -100%;top: 24px; \
		/* flip in and out version */ \
		/*display:none;*/ \
		/* nice fading version */\
		/*** display: none does not work ***/\
		opacity: 0;\
		transform: scaleY(0);\
		-webkit-transform: scaleY(0);\
		transition: opacity 200ms 0ms ease, transform 0ms 200ms linear; /*wait before transforming*/ \
	}\
	#sbSeek div.knob {transition: 100ms;} \
	#sbSeek:active div.knob {transition: 0ms;} \
	#sbSeek:active #vlc-sb-tooltip, \
	.knob:active #vlc-sb-tooltip {\
		/* flip in and out version */\
		/*display: block;*/\
		/* nice fading version */\
		transform: scaleY(1); /*using scaleY so el.style.height can be set from js*/\
		-webkit-transform: scaleY(1); /*uh, why still*/\
		opacity: 1;transition: opacity 200ms 200ms ease, transform 0ms 0ms linear;}\
	#sbSeek:active #vlc-sb-tooltip.hid, .knob:active #vlc-sb-tooltip.hid { display:none; }\
	/*#sbSeek:active {border: 2px dashed red;}*//*wtf, .knob make active, #vlctime doesn't */\
	#vlc-sb-tooltip:before {border: 7px solid transparent;border-bottom: 7px solid #000;content: '';display: inline-block;left: 45%; position: absolute; top: -14px;}\
	.vlc_buttons_div {text-align:left; padding: 0 5px; color:#333333; clear:both;}\
	.vlc_buttons_div button, .vlc_buttons_div select { margin-right: 2px;}\
	.vlc_buttons_div input[type='checkbox']{vertical-align: middle;}\
	#watch7-playlist-tray { border-bottom: 1px solid #1B1B1B !important;}\
	#vlcstate {text-align:left; display: inline-block; width: 50px;}\
	#vlc-config .row { padding: 5px 0; border-bottom: 1px dotted #CCC; text-align: center; cursor: move; }\
	#vlc-config .row.over { border: 2px dashed #000; }\
	#vlc-config { color: #1b1b1b; background: white; overflow: auto; display:none;}\
	#vlc-config > div { padding: 5px; float: left; border: 3px double #CCC;}\
	#vlc-config-drag {font-size: 12px; border: 1px solid #CCC; width: 150px; padding-bottom: -1px;}\
	#vlc-config-ok { clear: both; float: right; }\
	#vlc-config-btn  span {width:24px; height: 24px; display: block; padding: 0px;\
		background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA%2FwD%2FAP%2BgvaeTAAAACXBIWXMAAAsRAAALEQF%2FZF%2BRAAAAB3RJTUUH1gcRDxwh83SzRgAABEdJREFUSMe9lV1sk1UYx39vO7Yxx9hYNlgnjgUNIyi0bMEESqgOUDY%2BFENkookgiyBXOo2AM8c3JCt4YyKIgFwsuAuGJAZCYiBTXHSgTNeR8rEJc9Ru%2FVo3YOyr7fYeL2iXruumJuq5OTnP%2B57%2F7%2Fyfc55z4D9uSrygEEIAH4WH7wNNqqrW%2FWtUIYT0eT0yEBiSLS03pRBCVlRUlE60oJgF66IDugl%2BNHx2%2BHOkppFrMFBWtpnU1NRzgJwIUlRek%2FPSnpNaUXnNiYkAihDCCKCqqhswWPcfIDA0SH5%2B%2FqRpLSqvMQKu01Uv8%2BbagllF5TV1sQClsrJSBWxCiH0RiNlsRlHGmdTiGLA1HttCe3s7Sx%2BfWpyeklAc%2BZAQ7qfo9foPd%2B4oR6dPfA%2BoXLhwIQUF85BSQ1EUgoH%2Bn4UQRlVVm6OVF2%2BrNgJ0dHTQ3d3NzmOtAIZxdo8ePWrfsH7dkykpUwkFg0gpkVKOCqWlZ1BVZQUwhFPI%2FBf2GZNnPGq7fLiMpbtOoSgKI8MBU3P19uZxACFETnJy8o3nVxenz1%2FwFIqijO5p7727DyHT06my7gcwHP7q8szsBStt5z95hbUffMPwUO%2Bqa7UVdZPWgRDCmJeXd9zhcBRGYkuWLAmtXFk85cH9e0gpeWRaGgcOfMyXP%2FTw6TvP8e4Xv3Lf0WRyN59pjqMtlb%2BohxxgOVC7d%2B%2BeUSeZWTNRVZXqi256bv1oeuC%2BEVf8nxSeUQghNU2TXV637PK6paZpUgghI0d7oiM8qYOi8pocn6PNNRzoJfjAy651cxFC0N3lHeMkvPE%2BYCRWQz%2BZuL%2FT6XqxeC4lywvIToPqszYGfTdZU1LK4EA%2FgwP9rCkppb6%2BvsJisXxdX1%2Fv%2BVuAiPim1fN4bb0Zl9NBQsp0tMBdzl72MuC%2BGg%2Byw2KxnImF6CYS375xEds2ruDbuu9ovOkkIzuXtIwsEtNmAZhUVSUzayYA3V1eHl7A2GL2ZCwgIr7nDTNbSpdy6kwdv9y4g3mFhTt%2FuNHp9eiTpuH1ev3BYLAwHiQpKWkMRBd9Yfk7nS71rWfYtLqQE6fP0%2B50sap0Pa2tbXicbfx0W0ei1v3EkSNH7lqt1t88Ho85AgkEg2zd%2Bjq7d%2B8GsI0D%2BDudtrdffZoNlkXUnv2edqeL5c8W09JyG5fjFg2tGiFfk2nA70gDZgCZdrs9ZLfbS1VVxZA7m0OHDtHb2ztGOyE6RXlzZjOiSXyd7ePE%2B36%2FYPG3XAyFJ2YAukuXLg0D7r6%2Bvs0HDx482dPTg6ZpV0KhkDVSAqN1MKfEKtcuM2AqNDE3J52r129zpbGRhlaNAcfFZb7rF%2FwxrrWo%2BSNAAOgHhoDhcGxk1MGMWTmLzzW4miIJHBzoo6FVI0nXb9Eycu8B%2FqjijAhHXjgtLDgcJS7HVfLibdWmHo%2B7KTJOnZb42LXaCk%2FMvaLE6WWUKy08lvwf7U9RNAWyAew0pQAAAABJRU5ErkJggg%3D%3D') no-repeat;}\
	/* Faenza 16px lpi_translate.png */ \
	#vlc-config-lang-icon { margin-right: 5px; display: inline-block; width: 16px; height: 16px; background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAHiSURBVDiNlZPPi1JRFMc/570pXjbYKmo1Wbka4TUx4kIQEbGN0t6dSDxo4aK/oI3UP9C0a92uAodMN26ynJBsIdIiQ2ZwMCuY0cjpB50WPsXeCNUXDvde7j3fe873nCOqigfirsculmFlYW8CZ107AnaB7x6i4+SqiqqeS6VSdyzLeg7sG4bxNh6P31XVC6pqqKqoqqmqa6p6yT2jqoiqCrAhIo+Br+6vJrBqWdae4zgPbdvuVyqV9VKpdH0ymRSA17MoZgRXRWRrSYoWcAYwgJ/ASFVvAK0ZgbHw+Mg0zS/ZbLZZrVZfjMfjnXa7Xcvlck9FpAvsAYcLWsgigQCTcrn8JhKJnHAc54rf778WjUZjwWDQajabrVAo1LUs68D1WQMuAoIryCbwSFVvAa+AKvAE2AZ2AoHAs1qtdn8wGNzL5/O3fT5fVVU3VVXmZUwmk7vAR+CdR4dRr9dbTSQSYaZl/+a++0PEy8A6sC8iN5eIeQyqugW0VlymLvAe2GDaRP+MWQqL3fZfBIbnLOl0elSv1z8Nh8Nhp9M5zGQyBy6p1+YazJ2ZlsYGXgIj4BQQazQaoUKh8KPf74tt27+KxeLJcDj8APggnmlcNokCnAdiwGngM9AAht4I/gZZ2M+dfgPB0dbgsnwagQAAAABJRU5ErkJggg==') no-repeat;}\
	.vlc-config-checkbox-div { /*min-width: 200px;*/ } \
	.vlc-config-checkbox-div label:hover { background: #F8F8F8; border: 1px solid #D3D3D3; }\
	#vlc-config-checkboxes { /*height: 255px; overflow-x: hidden; overflow-y: auto;*/ } \
	/* custom checkboxes */\
	#vlc-config-checkboxes label { width:100%;} \
	#vlc-config-checkboxes label input { display:none; } \
	#vlc-config-checkboxes label input + span { line-height: 120%; text-indent: 16px; width: 100%; display:inline-block;} \
	.vlc-wl-state {padding-left: 18px;}\
	.ccselect {max-width:85px;}\
	/*Faenza 16px gtk-delete.png */\
	.vlc-boo-bg {background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAG7SURBVDiNpZOxSwJhGMaf5NPrwigiooQLokiChsh0a6klbmpoCiJKcrz/IjBoCqItkKChQZzEhhIuWiybAilOxQ7Dq9TCwC4v3wYt7iSXfOFdnu97Hnh/7/d1ERE6KVtH7jYBPADvH7q3eWYtIjI3H93yB7d5LqXKsvijq7IsbvNcKrrlDxIRb/ZYzLGAP7jrQDXEgXZ4pqiyLKqyLO7wTAlxoF0HqrGANaTLBNF75B49HCio0zYA73VABUsDgABj3GkD6gBKw8Lt2t3DJoArAJYA1F6epMTi3PrHozoLAJV6Q+9tkup2CTe+s+uQfXBorx0D9vmsSQmPkLwYAZk74RGSn8+aRETM7GndglHKKNm8rvc4HIC587reU8ooWQCG2WAZ4SVxIUaWF/YmOWO8j1mT3wzgXmfp5ci5NOibj/4V4D2e6A2N2d6n+u0NwT4s3ABArdBg8loDsnVnalWprP9AtKyxfHpykPGwSnoGlFsSkkZRk4yiJuWWhGR6BpTxsEr59OTAvMZWiK5qPLyvrbgvv4q/wNhXUZO0FfdlNR7eJyJXu4f0G0JEGy20WVNztd63QPxPdfwbvwG5Z15mC93/JQAAAABJRU5ErkJggg=='); background-repeat: no-repeat; background-position: 2px 50%;} \
	/*FIXME deduplicate :P*/ \
	.vlc-boo-bg:hover {background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAG7SURBVDiNpZOxSwJhGMaf5NPrwigiooQLokiChsh0a6klbmpoCiJKcrz/IjBoCqItkKChQZzEhhIuWiybAilOxQ7Dq9TCwC4v3wYt7iSXfOFdnu97Hnh/7/d1ERE6KVtH7jYBPADvH7q3eWYtIjI3H93yB7d5LqXKsvijq7IsbvNcKrrlDxIRb/ZYzLGAP7jrQDXEgXZ4pqiyLKqyLO7wTAlxoF0HqrGANaTLBNF75B49HCio0zYA73VABUsDgABj3GkD6gBKw8Lt2t3DJoArAJYA1F6epMTi3PrHozoLAJV6Q+9tkup2CTe+s+uQfXBorx0D9vmsSQmPkLwYAZk74RGSn8+aRETM7GndglHKKNm8rvc4HIC587reU8ooWQCG2WAZ4SVxIUaWF/YmOWO8j1mT3wzgXmfp5ci5NOibj/4V4D2e6A2N2d6n+u0NwT4s3ABArdBg8loDsnVnalWprP9AtKyxfHpykPGwSnoGlFsSkkZRk4yiJuWWhGR6BpTxsEr59OTAvMZWiK5qPLyvrbgvv4q/wNhXUZO0FfdlNR7eJyJXu4f0G0JEGy20WVNztd63QPxPdfwbvwG5Z15mC93/JQAAAABJRU5ErkJggg=='); background-repeat: no-repeat; background-position: 2px 50%;} \
	/*Faenza 16px ok.png */\
	#vlc-config-checkboxes label input:checked + span, .vlc-ok-bg { background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAF9SURBVDiNpZM/SAJhGMafO/O48vMzt4hoaFIcnFqsJhEcW1qcWiuIVrnGhggajNK9rYiIIoegorxDO8Sg7cRbazW5pQielgS7/ucL7/J9/H4fH+/zKiTRT6l90f8UKP8WuK6bsixr9h1H8lfdarVSQohrTdPqpmnOkVRJfhDoJAf8sOu6U0KIcwB3AG6j0egVyZRfMGQYRr5UKi2QDHbPHceZllKeAagBuNB1/bRSqWySHOoVDBqGkVcU5SYQCFSLxeISSa3ZbM5IKcsALgGc6Lq+b9v2Bsmx7gNdwWQsFjsCcADgUFXVq0KhkI9EIscAygD2QqHQbr1eX++FSULpBqndbq+k0+nxRqMxDEADMAHgAcCjEOLZNM12MpncAnD/bqY9SQx2Op3FTCYzYtu2eJs3w+Hwc7VafUokEtt+2C8AgKDneYvZbDZqWZYupXyp1WpKPB7f+Qz+KgdBz/OWc7ncquM4ayRHv8vHVxcDJOdJjvwUMP8X/lx9b+Mr7eRSRxf/zIkAAAAASUVORK5CYII=') !important; background-repeat: no-repeat !important; background-position: 0 50% !important; } \
	input.tiny { width: 45px; } \
	#vlc-config-midcol div { padding-bottom: 5px;}\
	#vlc_controls_div { /*border: 1px solid rgba(0, 0, 0, 0.098); border-top: 0;*/ width:100%;}\
	/* flexy elements */ \
	.vlc-flex-container { display:flex; flex-direction: row; flex-wrap: nowrap; justify-content: flex-start; align-content: flex-start; align-items: flex-start; }\
	.vlc-flex-grow { flex-grow: 1; flex-shrink: 0; } \
	.vlc-flex-basis-100 { flex-basis: 100px; } \
	#vlc-spacer #vlc_controls_div { display:none; }\
	#vlc-spacer:hover #vlc_controls_div { display:block; }\
	#vlc-spacer { background-image: linear-gradient(bottom, rgb(175,42,38) 50%, rgb(0,0,0) 100%);\
				background-image: -moz-linear-gradient(bottom, rgb(175,42,38) 50%, rgb(0,0,0) 100%);}" +
	(this.bembedControls && this.isEmbed ? '.yt-uix-button{padding:0 0.3em;}':'');

	this.addCSS(css);

	if(this.bcompactVolume)
	{
		this.addCSS("#sbVol { position: relative; top: -65px; width: calc(100% - 2px); height: 80px; display: none; }\
			#sbVol .knob {width: 100%; left: 0px;} \
			.vlc-volume-holder { display: inline-block; margin-right: 2px; height: 26.25px; /* hm otherwise 2px higher than buttons */}\
			.vlc-volume-holder > span { \
			/* Faenza 16px audio-volume-medium.png */ \
			background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAIWSURBVDiNpZM/aFNRFIe/k/ceRWqymfqyhIYMWsqrVGPAJQpditKhYDJKt24d6ya2kxQ7lgx2S0DCGwNODkKlCCIS6tTSxTYxpFZMyZ9H+jwu70ms7VC8cIZzz7nf/d17zhFV5X9W5DLJInJNRKaG98wLcg3AH/Kv7+7uJoGrwBURqatqCwBVPWsJVZ0K/aOjoxtjY2MV27Zf5/P5CeAR8ACIqOo/T7DHx8dfBMoiW1tbuWq1+rDVaqUbjUbacZw7hmH8BEYBO1QQUVVHVTOpVGoT+Kiqd4vFYt40zfcLCwvrs7Oz68DbZDL5anp6ejJQcTNUMGma5qaIlPf39yeAJkCpVMqcnp52K5VKslAoHAL94+Nj5ufnQ9WxsAqW7/vfgB2gAXiAv7Ky8gU46fV6Zi6X8wCv2+1G5+bmrGFAWIWTs2XY29vzgP7IyIjX6XR8oG9ZVm8wGPyVFwEGtm3/CG4OzSoWi7cAL5vNfi+VSjHAS6fTTdd1Q0I7BOzU6/XPqlpbXV39GgDMxcXFw2g02l5aWuq4rhsHPMdx2uVy2R8GnO2Be2tra89V9baq2gcHB09d130mImXTNF/WarUnhmHkgiokVBU5ZxayQCf41NHt7e37y8vLmZmZmUGz2XyzsbGRCOLvVPXXeQAAAcKA5Xne43a73Y/H4x3AAj6ErXwR4DygiEgKiKnqpz+By46ziIgOHfoN2CIPv8Rm1e4AAAAASUVORK5CYII=') no-repeat scroll 50% 50%; \
			display: block; width: 16px; height: 26px;} \
			.vlc-volume-holder:hover #sbVol { display:block; } \
			#vlcvol {display: block; position: relative; top: 40%; transform: rotate(-90deg); }");
	}

	if(!this.buseWidePosBar)
		this.addCSS("#sbSeek { width: 250px; }");
	else if(this.bshowRate)
		this.addCSS("#sbSeek { width: 60%; }");

	if(this.bdarkTheme && !this.isEmbed) //TODO maybe set to some dark colors instead
		this.addCSS(".vlc-scrollbar{border: 1px solid #EEE;background: transparent;color: #EEE;}\
		.movie_player_vlc {background:transparent;} .vlccontrols {color: #EEE;}");

	//blurry shadow was assome
	this.addCSS(".yt-uix-button:focus, .yt-uix-button:focus:hover, .yt-uix-button-focused, .yt-uix-button-focused:hover {box-shadow: 0 0 2px 1px rgba(27, 127, 204, 0.4); border: 1px solid rgba(27, 127, 204, 0.7);}");
	//Optional button style: Make it round
	this.addCSS(".vlc_buttons_div .yt-uix-button {border-radius: 0; margin: 0;} \
				.vlc_buttons_div .yt-uix-button:first-child {border-radius: 5px 0 0 5px;} \
				.vlc_buttons_div .yt-uix-button:last-child {border-radius: 0 5px 5px 0;}");

	/* configuration div to be more like a drop-down menu */
	if(this.bconfigDropdown)
		this.addCSS("#vlc-config { position: absolute; z-index: 9999; border: 1px solid #CCC;}");

	// Media event detector
	// http://css-tricks.com/media-query-change-detection-in-javascript-through-css-animations/
	this.addCSS(".vlc-media-event-detector { animation-duration: 0.001s; }\
	\
	/* Keep in sync with YT's CSS */\
	@media screen and (min-width: 894px) and (min-height: 630px) { .vlc-media-event-detector { animation-name: media-event-0; } } \
	@media screen and (min-width: 1320px) and (min-height: 870px) { .vlc-media-event-detector { animation-name: media-event-1; } } \
	@media screen and (min-width: 1294px) and (min-height: 630px) { .vlc-media-event-detector { animation-name: media-event-2; } } \
	@media screen and (min-width: 1720px) and (min-height: 980px) { .vlc-media-event-detector { animation-name: media-event-3; } } \
	\
	@keyframes media-event-0 { from { clip: rect(1px, auto, auto, auto); } to { clip: rect(0px, auto, auto, auto); } }\
	@keyframes media-event-1 { from { clip: rect(1px, auto, auto, auto); } to { clip: rect(0px, auto, auto, auto); } }\
	@keyframes media-event-2 { from { clip: rect(1px, auto, auto, auto); } to { clip: rect(0px, auto, auto, auto); } }\
	@keyframes media-event-3 { from { clip: rect(1px, auto, auto, auto); } to { clip: rect(0px, auto, auto, auto); } }\
	");
};

ScriptInstance.prototype.getSessionToken = function(callback)
{
	var pageid = "";
	if(typeof(this.swf_args.pageid) != 'undefined')
		pageid = "&pageid=" + this.swf_args.pageid;

	GM_xmlhttpRequest({
		method: 'POST',
		url: this.win.location.protocol + "//" + this.win.location.host +
				"/token_ajax?action_get_wl_token=1",
		headers: headers,
		data: 'authuser=' + this.swf_args.authuser + pageid,
		onload: (function(r){
			if(r.status==200){
				//if(r.responseText.match(/status=(\d+)/)[1] == '200')
				{
					this.session_token = unescape(r.responseText.match(/addto_ajax_token=([\w-_=%]+)/)[1]);
					callback(this.session_token);
				}
			}
		}).bind(this)
	});
};

function clearWLButtonState()
{
	var el = document.querySelector('#vlc-watchlater-btn');
	if(!el) return;
	el.classList.remove("vlc-wl-state");
	el.classList.remove("vlc-ok-bg");
	el.classList.remove("vlc-boo-bg");
}

function setWLButtonState(b)
{
	var el = document.querySelector('#vlc-watchlater-btn');
	if(!el) return;
	if(b)
	{
		el.classList.add("vlc-wl-state");
		el.classList.add("vlc-ok-bg");
	} else {
		el.classList.add("vlc-wl-state");
		el.classList.add("vlc-boo-bg");
	}
}

ScriptInstance.prototype.getAddToXML = function(action, callback)
{
	var pageid = "";
	if(typeof(this.swf_args.pageid) != 'undefined')
		pageid = "&pageid=" + this.swf_args.pageid;

	var xheaders = Clone(headers);
	//xheaders['Cookie'] = document.cookie;
	xheaders['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
	GM_xmlhttpRequest({
		method: 'POST',
		url: window.location.protocol + "//" + window.location.host + "/addto_ajax?" + action,
		headers: xheaders,
		data: 'video_ids=' + this.swf_args.video_id + '&authuser=' + this.swf_args.authuser +'&session_token=' + this.session_token + pageid,
		onload: function(r){
			if(r.status==200){
				var parser=new DOMParser();
				var xmlDoc=parser.parseFromString(r.responseText, "text/xml");
				callback(xmlDoc);
			}
		}
	});
};

//TODO Probably some config param somewhere...
ScriptInstance.prototype.isInWatchLater = function()
{
	var that = this;
	this.is_in_watchlater = false;
	this.getAddToXML("action_get_dropdown=1&hide_watch_later=false", function(xmlDoc) {
		var retCode = xmlDoc.querySelector('return_code').textContent;
		if(retCode === '0')
		{
			var parser = new DOMParser();
			var html = parser.parseFromString(xmlDoc.querySelector('html_content').textContent, "text/html");
			that.is_in_watchlater = !!html.querySelector('li[data-url="/playlist?list=WL"] button[aria-checked="checked"]');
			that.is_in_watchlater && setWLButtonState(true);
		}
	});
};

ScriptInstance.prototype.ajaxWatchLater = function()
{
	var actions = ["action_delete_from_watch_later_list", "action_add_to_watch_later_list"];
	var action;
	if(this.is_in_watchlater)
		action = 0;
	else
		action = 1;

	var addToWatchLater = (function()
	{
		this.getAddToXML(actions[action] + "=1&feature=player_embedded", (function(xmlDoc) {
				var retCode = xmlDoc.querySelector('return_code').textContent;
				//console.log(retCode);
				var b = (retCode === '0' || //ok
					retCode === '6'); //duplicate
				setWLButtonState(b);
				if(b && action === 0)
				{
					clearWLButtonState();
					this.is_in_watchlater = false;
				}
				else if(b && action === 1)
					this.is_in_watchlater = true;
			}).bind(this));
	}).bind(this);

	if(this.session_token)
		addToWatchLater();
	else
		this.getSessionToken(addToWatchLater);
};

ScriptInstance.prototype.canAutoplay = function(){

	var el = document.querySelector("div#player");
	if(el && el.classList.contains("off-screen"))
		return false;

	if(this.getPL() && GM_getValue('bautoplayPL', true))
		return true;

	el = document.querySelector('#autoplay-checkbox');
	return (GM_getValue('bautoplayYT', false) && el && el.checked) 
		|| ((GM_getValue('bautoplay', true) || (this.isPopup && this.bpopupAutoplay))
				&& !this.isEmbed);
};

ScriptInstance.prototype.removeListener = function(type, listener){
	if (this.listeners[type] instanceof Array){
		var listeners = this.listeners[type];
		for (var i=0, len=listeners.length; i < len; i++){
			if (listeners[i] === listener){
				listeners.splice(i, 1);
				break;
			}
		}
	}
};

ScriptInstance.prototype.setThumbnailVisible = function(b)
{
	var thumb = this.elements.thumbnail || this.$("vlc-thumbnail");
	if(!thumb) return;

	if(b)
		thumb.classList.remove("vlc_hid");
	else
		thumb.classList.add("vlc_hid");
};

ScriptInstance.prototype.setSideBar = function(wide)
{
	if(this.isPopup || this.bignoreSidebar) return;
	var el = this.$('watch7-container');
	if(!el) return;

	var ply = this.$(gPlayerID);

	if(!wide) {
		el.classList.remove('watch-wide');
	} else {
		el.classList.add('watch-wide');
	}

	var sidebar = this.$('watch7-sidebar');
	var pl = this.getPL();

	var h = this.$('vlc_controls_div').clientHeight;
	if(wide)
		sidebar.style.marginTop = (pl ? h + 'px' : '');
	else
	{
		sidebar.style.marginTop = (-370 - (pl ? 0 : h)) + "px";
	}
};

ScriptInstance.prototype.setPlayerSize = function(wide)
{
	if(this.isEmbed)
	{
		var w = this.player.clientWidth;
		var h = this.player.clientHeight;
		this.$(vlc_id + '-holder').style.height = (h - this.$('vlc_controls_div').clientHeight) + "px";
		return;
	}

	if(wide !== undefined)
	{
		this.isWide = wide;
		this.setWideCookie(wide);
	}

	var pageDiv = document.querySelector('#page-container #page');
	if(pageDiv)
	{
		if(!wide) {
			pageDiv.classList.remove('watch-stage-mode');
			pageDiv.classList.add('watch-non-stage-mode');
			this.$('player').classList.add('watch-small');
			this.$('player').classList.remove('watch-medium');
			// FIXME A bit hackish
			this.$('player').classList.remove('watch-large');
			pageDiv.classList.remove('watch-wide');
		} else {
			pageDiv.classList.add('watch-stage-mode');
			pageDiv.classList.remove('watch-non-stage-mode');
			//TODO watch-large
			//this.$('player').classList.add('watch-large');
			this.$('player').classList.add('watch-medium');
			this.$('player').classList.remove('watch-small');
			pageDiv.classList.add('watch-wide');
		}
	}

	var vlc = this.$(gMoviePlayerID);
	if(this.isPopup) this.widthWide = "100%";
	var content = this.$('watch7-content');
	var placeholder = document.querySelector("#placeholder-player");
	var placeholderDiv = document.querySelector("#placeholder-player div");
	var w = this.player.clientWidth;//content.clientWidth;
	var h = this.player.clientHeight;//content.clientWidth;

	if (!placeholderDiv)
	{
		if(!this._sizer_timeout)
			this._sizer_timeout = window.setTimeout(
				(function(){
					this._sizer_timeout = null;
					this.setPlayerSize(wide);
				}).bind(this), 100);
		return;
	}

	if(this.bignoreSidebar)
		placeholder.style.marginBottom = (this.$('vlc_controls_div').clientHeight + 10) + "px";

	//var w = /\/user\//i.test(this.win.location.href) ? "100%" : this.width, h = this.height;
	if(this.bcustomWide && typeof(w) != 'string' && (wide || this.isPopup))
	{
		this.player.style.width = "100%";
		var ratio = this.width/this.height;
		if( (""+this.widthWide).indexOf("%")>-1 )
		{
			// set to percentage
			this.player.style.width = this.widthWide;
			//this.$('player').style.width = this.widthWide;
			// and now get corresponding width in pixels
			if(this.isPopup)
				w = this.player.clientWidth;
			else
				w = Math.max(this.player.clientWidth, this.minWidthWide); //limit smallest size to minWidthWide
		}
		else
		{
			w = parseInt(this.widthWide);
			//this.$('player').style.width = w + 'px';
			this.player.style.width = w + 'px';
		}
		h = Math.floor(w / ratio);
	}

	// Is it really not widescreen?
	var vw,vh;
	try{
		vw = document.querySelector('meta[property="og:video:width"]').content;
		vh = document.querySelector('meta[property="og:video:height"]').content;
	}catch(e){}

	if(this.bforceWS ||
		(vw&&vh&&((vw/vh==16/9) || vh == '1080' || vh == '720' || vw == '853'))
		)
	{
		h = Math.floor(w * 9/16);//TODO use video size from vlc?
	}

	//console.log("Custom size:", w,h, ratio, this.widthWide);

	// Apply size to embed element
	this.$(vlc_id).style.width = this.isPopup ? "100%" : w + 'px';
	this.$(vlc_id).style.height = this.isPopup ? "100%" : h + 'px';

	if(this.bcustomWide)
	{
		var clsHeights, i;
		if(wide)
		{
			//TODO call setPlayerSize only when isPopup is finally set (or not)
			this.elements.holder.style.height = this.isPopup ? '' : h + 'px';
			this.player.style.height = (h + this.$('vlc_controls_div').clientHeight) + "px";
			this.player.style.left = (-w/2) + "px";
			if(placeholderDiv)
				placeholderDiv.style.width = w + "px";
			clsHeights = document.querySelectorAll('.player-height');
			for(i=0; i < clsHeights.length; i++)
				clsHeights[i].style.height = h + 'px';
		}
		else // Reset explicit styles
		{
			this.$('player').style.width = '';
			this.player.style.width = '';
			this.player.style.height = '';
			this.player.style.left = '';
			if(placeholderDiv)
				placeholderDiv.style.width = '';
			this.elements.holder.style.height = '';
			clsHeights = document.querySelectorAll('.player-height');
			for(i=0; i < clsHeights.length; i++)
				clsHeights[i].style.height = '';
		}
	}

	// FIXME Quirky. Find some other way, ugh.
	if(placeholderDiv)
	{
		if(wide)
		{
			var left = -placeholderDiv.clientWidth / 2;
			placeholderDiv.style.left = left + "px";
			placeholderDiv.style.position = "relative";
		}
		else
		{
			placeholderDiv.style.left = '';
			placeholderDiv.style.position = '';
		}
		placeholderDiv.style.height = (this.player.clientHeight) + 'px';
	}

	var playlist = this.getPL();
	if(playlist)
	{
		var el = document.querySelector('#watch-appbar-playlist ol');
		var hdr = document.querySelector('div.playlist-header');
		
		if(!wide) {
			playlist.style.height = (vlc.clientHeight ) + 'px';
			playlist.style.marginTop = '';
			el.style.maxHeight = (vlc.clientHeight - hdr.clientHeight) + 'px';
			this.getPL().style.transform = '';
		} else {
			playlist.style.height = '';
			if(!this.bcustomWide)
				playlist.style.marginTop = this.$('vlc_controls_div').clientHeight + 'px';
			else
			{
				var transY = this.player.clientHeight - getComputedPx(this.getPL(), 'top') + 10;
				this.getPL().style.transform = "translateY(" + transY + "px)";
			}
			//TODO el.style.maxHeight to something
		}
	}
};

ScriptInstance.prototype.setBuffer = function(i)
{
	var val, b = "#2f3439",f = "#ff6347",el = document.querySelector('#'+vlc_id+'_controls .progress-radial');
	if(!el) return; //sometimes null for some reason
	var step = 1, loops = Math.round(100/ step), increment = (360 / loops), half = Math.round(loops / 2);
	if (i < half)
	{
		val = 90 + ( increment * i ); el.style.backgroundImage = "linear-gradient(90deg, "+b+" 50%, transparent 50%, transparent), linear-gradient("+val+"deg, "+f+" 50%, "+b+" 50%, "+b+")";
	}
	else
	{
		val = -90 + ( increment * ( i - half ) ); el.style.backgroundImage = "linear-gradient("+val+"deg, "+f+" 50%, transparent 50%, transparent), linear-gradient(270deg, "+f+" 50%, "+b+" 50%, "+b+")";
	}
};

ScriptInstance.prototype.setUriHost = function(uri, host)
{
	if(this._tmp_uri === undefined) this._tmp_uri = document.createElement('a');
	this._tmp_uri.href = uri;
	this._tmp_uri.host = host;
	return this._tmp_uri.href;
};

ScriptInstance.prototype.onFmtChange = function(ev, opt)
{
	var n = opt || ev.target.options[ev.target.selectedIndex];
	var uri = n.value;
	var fb = n.getAttribute("fallback");

	if(ev) this.fmtChanged = true;//if false, skip initial add so doAdd would play only if user changed format
	//this.VLCObj.add(n.value);
	if(this.buseFallbackHost && fb)
		uri = this.setUriHost(uri, fb);
	this.quality = n.getAttribute("name");

	var sig = n.getAttribute("s");

	if(!/signature=/.test(uri))
	{
		if(sig)
		{
			if(!window.GetDecodeParam) console.log('Video needs a signature decipherer which is still being parsed.');
			sig = window.GetDecodeParam && GetDecodeParam() &&
					Decode(sig, GetDecodeParam()) ||
					DecryptSignature(sig, this.ytplayer.config.sts);
		}
		else
			sig = n.getAttribute("sig");

		if(sig) uri += "&signature=" + sig;
	}

	if(fb)  uri += "&fallback_host=" + fb;
	this.saveSettings();

	this.myvlc.add(uri, itagToText[this.quality]);
};

ScriptInstance.prototype.onWideClick = function(ev)
{
	this.isWide = !this.isWide; //TODO rely isWide being correct always?
	this.setPlayerSize(this.isWide);
	this.setSideBar(this.isWide);
};

//Obfuscated/minified cookie script from youtube
function Ni(a, b, c, d, e, f) {
	/[;=\s]/.test(b) && console.log('Invalid cookie name "' + b + '"');
	/[;\r\n]/.test(c) && console.log('Invalid cookie value "' + c + '"');
	//fa(d) || (d = -1);
	if(d === undefined) d = -1;
	f = f ? ";domain=" + f : "";
	e = e ? ";path=" + e : "";
	d = 0 > d ? "" : 0 == d ? ";expires=" + (new Date(1970, 1, 1)).toUTCString() : ";expires=" + (new Date((Date.now) + 1E3 * d)).toUTCString();
	a.cookie = b + "=" + c + f + e + d + "";
}

function setCookie(a, b, c) {
	Ni(document, "" + a, b, c, "/", "youtube.com");
}

ScriptInstance.prototype.setWideCookie = function(a)
{
	GM_setValue("vlc-wide", a);
	setCookie("wide", a ? "1" : "0");
	try{
		this.ytplayer.config.args.player_wide = a?1:0;
	}catch(e){}
};

ScriptInstance.prototype.onHashChange = function(ev)
{
	var off = 0, m;

	//Should support:
	// [#&]a?t=1h2m or [#&]a?t=1h2m34 or [#&]a?t=1h2m34s
	// [#&]a?t=62m or [#&]a?t=62m34 or [#&]a?t=62m34s
	// [#&]a?t=34s or [#&]a?t=34

	if(typeof(ev) === 'string')
		m = ev.match(/[#&]a?t=((\d+)h)?((\d+)m)?(\d+)?s?/);
	else
		m = ev.newURL.match(/#a?t=((\d+)h)?((\d+)m)?(\d+)?s?/);

	if(!m) return;

	off = (m[2] ? parseInt(m[2]) : 0) * 3600
		+ (m[4] ? parseInt(m[4]) : 0) * 60
		+ (m[5] ? parseInt(m[5]) : 0);

	this.myvlc._seekTo(off);
};

ScriptInstance.prototype.onSetCC = function(name, lang)
{
	if(lang == "null")
	{
		this.usingSubs = false;
		this.myvlc.ccObj = null;
		return;
	}

	getXML(this.getTrackUrl(lang, name),
		this.parseCCTrack.bind(this));
};

ScriptInstance.prototype.parseCCTrack = function(r) {
	var parser = new DOMParser();
	var xmlDoc = parser.parseFromString(r, "text/xml");

	if(xmlDoc.firstChild.nodeName == 'transcript')
	{
		var cc = new ccTimer();
		cc.init(xmlDoc.firstChild);
		this.myvlc.ccObj = cc;
		this.myvlc.setupMarquee(null, null,
			GM_getValue('vlc-subs-align', 'BOTTOM'),
			GM_getValue('vlc-subs-color', 'FFFFFF'));
		this.usingSubs = true;
	}
};

ScriptInstance.prototype.parseCCList = function(r) {
	var parser = new DOMParser();
	var xmlDoc = parser.parseFromString(r, "text/xml");

	if(xmlDoc && xmlDoc.childNodes.length>0 &&
		xmlDoc.firstChild.nodeName == "transcript_list" &&
		xmlDoc.firstChild.childNodes.length > 0)
		{
			var tl = xmlDoc.firstChild;
			var ccselect = this.$(vlc_id+"_ccselect");
			removeChildren(ccselect, true);
			var nullopt = document.createElement("option");
			nullopt.setAttribute("name", "lang");
			nullopt.setAttribute("value", "null");
			ccselect.appendChild(nullopt);
			nullopt.innerHTML = _("NONE");
			for(var i = 0;  i < tl.childNodes.length; i++)
			{
				var option = document.createElement('option');
				var name = tl.childNodes[i].getAttribute("name");
				option.setAttribute("name", tl.childNodes[i].getAttribute("name"));
				option.setAttribute("value", tl.childNodes[i].getAttribute("lang_code"));
				option.innerHTML =  (name ? name + "/" : "") + tl.childNodes[i].getAttribute("lang_translated");
				ccselect.appendChild(option);
			}

			this.$(vlc_id+'_ccselect').addEventListener('change',
				(function(ev){
					var name = ev.target.options[ev.target.selectedIndex].getAttribute("name");
					this.onSetCC(name, ev.target.value);
				}).bind(this),
				false);
			this.$(vlc_id+'_ccselect').classList.remove('vlc_hidden');

			if(this.bautoSubEnable && ccselect.options.length > 1) {
				ccselect.options[1].selected = true;
				this.onSetCC(ccselect.options[1].getAttribute('name'), ccselect.options[1].value);
			}
		}
};

ScriptInstance.prototype.queryCC = function()
{
	//console.log("Has CC:" + (swf_args.has_cc||swf_args.cc_asr));
	getXML(this.getListUrl(), this.parseCCList.bind(this));
};

//host should be *.youtube.com
//fffffff, if no subs load, try to just refresh, grumble grumble...
ScriptInstance.prototype.getListUrl = function()
{
	return "//"+ this.win.location.hostname +"/api/timedtext?type=list&v=" +
		this.swf_args.video_id;
};

ScriptInstance.prototype.getTrackUrl = function(lang, name)
{
	if(typeof(name) == 'undefined') name = '';
	return "//"+ this.win.location.hostname +"/api/timedtext?type=track&" +
						"name=" + name +
						"&lang=" + lang +
						"&v=" + this.yt.getConfig('VIDEO_ID', '');
};

ScriptInstance.prototype.pullYTVars = function()
{
	if(this.isPopup && this.yt && this.ytplayer) return;
	try{
	// unsafeWindow is deprecated but...
	this.yt = this.win.yt;//unsafeWindow['yt'];
	this.ytplayer = this.win.ytplayer;//unsafeWindow['ytplayer'];

	if((!this.ytplayer || this.isEmbed) && this.yt)
	{
		this.swf_args = this.yt.config_.PLAYER_CONFIG.args;
		return;
	}
	else if(this.ytplayer)
		this.swf_args = this.ytplayer.config.args;

	var index = -1;//0-indexed, while html seems to be 1-indexed :S

	//Stuff below will err out on embed page
	if(this.getPL() && this.ytplayer)
		index = this.ytplayer.config.args.index;

	if(/\/user\/|\/channel\//.test(this.win.location.href))
	{
		var upsell = this.$('upsell-video') || this.$('upsell-video-vlc');
		var str = upsell.getAttribute('data-swf-config');

		var json = JSON.parse(str.replace(/&quot;/g, "\""));
		this.swf_args = json.args;
		this.ytplayer = {config: {args: this.swf_args}};
	}
	else if(!this.swf_args)
		this.swf_args = this.yt.getConfig('PLAYER_CONFIG',null).args;

	this.isWide = this.bforceWide || //Set wide no matter what
		(this.ytplayer && this.ytplayer.config.args.player_wide == 1) ||
		GM_getValue("vlc-wide", false); //Only wide if clicked on "Wide" button

	return true;

	}catch(e) {
		return false;
	}
};

// Do sanity check for obsolete format types saved in user prefs
function cleanFormats(frmts_dirty)
{
	var i, j, itagfrmts = [], frmts = [];

	//Convert old format list to itag list
	if(frmts_dirty.length && /[a-z]+/.test(frmts_dirty[0]))
	{
		for(i in frmts_dirty)
			itagfrmts.push(convToItag[frmts_dirty[i]]);
		GM_setValue('vlc-formats', itagfrmts.join(','));
	}
	else
		itagfrmts = frmts_dirty;

	//First add valid formats in saved order
	for(j in frmts_dirty)
		for(i in itagPrio)
		{
			if(itagPrio[i] == itagfrmts[j])
				frmts.push(itagPrio[i]);
		}

	//Append missing formats
	for(i in itagPrio)
	{
		var missing = true;
		for(j in itagfrmts)
		{
			if(itagPrio[i] == itagfrmts[j])
			{
				missing = false;
				break;
			}
		}

		if(missing) frmts.push(itagPrio[i]);
	}
	return frmts;
}

ScriptInstance.prototype._makeButton = function(id, text, icon)
{
	var btn = document.createElement("button");
	var span = document.createElement("span");
	btn.id = id;
	btn.className = "yt-uix-button yt-uix-button-default";
	if(this.bbtnIcons && icon)
		btn.innerHTML = '<i class="fa fa-lg '+ icon +'"></i>';
	span.className = "yt-uix-button-content";
	span.innerHTML = text;
	btn.title = text;
	btn.appendChild(span);
	return btn;
};

ScriptInstance.prototype._makeCheckbox = function(id, setting, text, title)
{
	var el = document.createElement("div");
	el.id = id + "-div";
	el.className = "vlc-config-checkbox-div";
	if(title || (_(id) != id && _(id).length > 1)) el.title = title || _(id)[1];
	var ck = document.createElement("input");
	ck.type = "checkbox";
	ck.id = id;
	var lbl = document.createElement("label");
	lbl.appendChild(ck);
	var span = document.createElement("span");
	span.appendChild(document.createTextNode(text || (_(id) != id ? _(id)[0] : _(id)) ));
	lbl.appendChild(span);
	el.appendChild(lbl);

	if(setting)
	{
		ck.checked = GM_getValue(setting, false);
		ck.addEventListener('click', (function(ev)
			{
				if(setting in this)
					this[setting] = ev.target.checked;
				//if(setting in window.VLC.GMValues)
				//	window.VLC.GMValues[setting] = ev.target.checked;
				GM_setValue(setting, ev.target.checked);
			}).bind(this), false);
	}
	return el;
};

ScriptInstance.prototype.openPopup = function(w,h)
{
	var popupID = '';
	if(typeof(w) == 'undefined') w = 854;
	if(typeof(h) == 'undefined') h = 480;
	if(!this.bpopupSeparate)
		popupID = 'vlc-popup-window';

	var win = window.open(this.win.location.href + "#popup" /*+ "&w=" + w + "&h=" + h*/, popupID, 'width=' +w+ ',height=' +h+ ',resizeable,scrollbars');

	return;
	/*
	win.document.body.innerHTML = '<div id="watch7-container"><div id="'+gPlayerID+'"><div id="'+gPlayerApiID+'"><div></div></div>';

	//Set few global variables
	win["yt"] = this.yt;
	win["ytplayer"] = this.ytplayer;

	//Copy CSS styles
	var styles = document.getElementsByTagName("style");
	var links = document.getElementsByTagName("link");
	var heads = win.document.getElementsByTagName("head");
	for (var i=0; i<styles.length; i++) {
		var node = styles[i].cloneNode(true);
		heads[0].appendChild(node);
	}

	for (var i=0; i<links.length; i++) {
		if(links[i].rel == "stylesheet")
		{
			var node = links[i].cloneNode(true);
			node.href = "" + node.href; //automagically adds protocol
			heads[0].appendChild(node);
		}
	}

	win.document.title = this.ytplayer.config.args.title;

	if(this.thumb) win.document.body.appendChild(this.thumb.parentNode.cloneNode(true));

	var s = new ScriptInstance(win, true);
	if(this.bdarkTheme) s.addCSS("body {background: black;}"); //TODO color
	s.win["vlc-instance"] = s; //Keep reference alive. Might be overkill. Seems to work without it too.
	*/
};

//Is full blown youtube page, but cull all the stuff
ScriptInstance.prototype.openAsPopup = function(w,h)
{
	//this.win.document.title = this.ytplayer.config.args.title;
	var player = document.querySelector('#player');
	player.parentNode.removeChild(player);

	//removeChildren(document.body.querySelector('#body-container'));
	var divs = document.body.querySelectorAll('body > div');
	for(var i=0;i<divs.length;i++)
		removeChildren(divs[i]);
	//TODO
	this.addCSS("#player.watch-small{max-width:100%; min-width:100px;}");
	this.addCSS("#player.watch-medium{max-width:100%;min-width:100px;}");
	this.addCSS("#player.watch-large{max-width:100%;min-width:100px;}");
	this.addCSS("#player{margin:0;padding:0;margin-top:-10px}");
	this.addCSS("#player,#player-api,#movie_player, #mymovie-holder, #player-mole-container{height:100%; width:100%;}");
	this.addCSS("#movie_player{display:table}");
	this.addCSS("#mymovie-holder,#vlc_controls_div{display:table-row}");
	this.addCSS("#mymovie-holder > div{display:table-cell}");
	this.addCSS(".vlc_hid{display:none !important;}");

	document.body.appendChild(player);
	document.body.className = "";
	this.isPopup = true;
	this.setPlayerSize();
};

//hasOwnProperty
function gd(o, v, d){if(v in o) return o[v]; else return d;}

ScriptInstance.prototype.generateDOM = function(options)
{
	if(typeof(options) == 'undefined') options = {};
	var wide = gd(options, 'wide', true), fs = gd(options, 'fs', true), pause = gd(options, 'pause', true),
		auto = gd(options, 'auto', true), dl = gd(options, 'dl', true), popup = gd(options, 'popup', this.busePopups);

	var vlc = document.createElement('div');
	vlc.id = gMoviePlayerID;
	vlc.className = "movie_player_vlc";

	this.moviePlayer = vlc;

	var holder = document.createElement("div");
	holder.id = vlc_id + "-holder";
	holder.className = "player-height";
	/*if(options.userPage)
	{
		holder.innerHTML = '<img id="vlc-thumbnail">';
		vlc.style.width = vlc.style.height =
			holder.style.width = holder.style.height = '100%';
	}
	else*/
	holder.innerHTML = '<div id="vlc-thumbnail"></div>';
	var embedNode = document.createElement("embed");
	embedNode.setAttribute('type', "application/x-vlc-plugin");
	embedNode.setAttribute('pluginspage', "http://www.videolan.org");
	embedNode.setAttribute('version', "VideoLAN.VLCPlugin.2");
	//set controls="yes" to show plugin's own controls by default
	embedNode.setAttribute('controls', "no");
	embedNode.setAttribute('autoplay', "no");
	embedNode.setAttribute('width', "100%");
	embedNode.setAttribute('height', "100%");
	embedNode.setAttribute('id', vlc_id);
	embedNode.setAttribute('name', vlc_id);
	holder.appendChild(embedNode);
	this.elements.thumbnail = holder.childNodes[0];
	this.elements.holder = holder;

	vlc.appendChild(holder);
	//may not be there on first load
	this.thumb = document.querySelector("span[itemprop='thumbnail'] link[itemprop='url']");
	var thumb = this.swf_args.iurlhq ? this.swf_args.iurlhq :
			this.swf_args.iurlsd ? this.swf_args.iurlsd :
			this.swf_args.iurlmq ? this.swf_args.iurlmq :
			this.swf_args.iurl;

	if(this.swf_args && this.buseThumbnail)
	{
		var href = thumb ? thumb : this.thumb ? this.thumb.href : this.swf_args.thumbnail_url;
		holder.childNodes[0].setAttribute('src', href);
		holder.style.backgroundImage = "url(" + href + ")";
		holder.style.backgroundRepeat = "no-repeat";
		holder.style.backgroundSize = "100%";
		holder.style.backgroundPosition = "50%";
		holder.style.backgroundColor = "#1A1A1A";
		holder.style.overflow = "hidden";
		if(options.upsell)
			holder.childNodes[0].addEventListener('click', (function(ev){ this.win.location.pathname = '/watch?v=' + this.swf_args.video_id; }).bind(this), false);
		else
		{
			holder.childNodes[0].addEventListener('click', (function(e){this.myvlc.play(false);}).bind(this), false);
			holder.childNodes[0]._has_onclick_evt = true;
		}
	}
	else
		holder.childNodes[0].classList.add("vlc_hidden");//perma hide

	//TODO little space, return just the channel thumbnail
	//Abort now, needs too much changes to be usable
	//if(options.upsell) return {dom: vlc, node: embedNode};

	var i, el, inp, lbl;
	var controls = document.createElement("div");
	this.elements.controls = controls;
	{
		controls.id = "vlc_controls_div";

		var volbar;

		var sliders = document.createElement("div");
		{
			sliders.id = vlc_id + "_controls";
			sliders.className = "vlccontrols vlc-flex-container";

			el = document.createElement("div");
			el.className = "progress-radial";
			el.id = "progress-radial";
			el.title = _("BUFFERINDICATOR");
			sliders.appendChild(el);

			el = document.createElement("div");
			el.id = 'sbSeek';
			el.className = 'vlc-scrollbar vlc-flex-grow vlc-flex-basis-100';
			el.title = _("POSITION");
			if(this.bembedControls && this.isEmbed)
				el.classList.add('sb-narrow');
			el.innerHTML = '<div class="knob"><div id="vlc-sb-tooltip"></div></div><div id="vlctime" class="bar-text">00:00/00:00</div>';
			sliders.appendChild(el);

			volbar = document.createElement("div");
			volbar.title = _("VOLUME");
			if(!this.bcompactVolume && (!this.buseWidePosBar || this.isEmbed))
			{
				volbar.id = 'sbVol';
				volbar.className = 'vlc-scrollbar';
				volbar.innerHTML = '<div class="knob"/></div><div id="vlcvol" class="bar-text">0</div>';
				sliders.appendChild(volbar);
			}
			else
			{
				volbar.className = 'vlc-volume-holder';
				volbar.innerHTML = '<span class="yt-uix-button-content"><div id="sbVol" class="vlc-scrollbar"><div class="knob"/></div><span id="vlcvol" class="bar-text">0</span></span>';
			}

			if(this.bshowRate)
			{
				el = document.createElement("div"); el.id = 'sbRate';
				el.className = 'vlc-scrollbar';
				el.title = _("PLAYBACKRATE");
				el.innerHTML = '<div class="knob"></div><span id="vlcrate" class="bar-text">1.0</span>';
				sliders.appendChild(el);
			}
		}

		controls.appendChild(sliders);

		/// Buttons
		var buttons = document.createElement("div");
		{
			buttons.className = "vlc_buttons_div";
			buttons.appendChild(this._makeButton('_play', _("PLAY"), 'fa-play'));
			//if(pause) buttons.appendChild(this._makeButton('_pause', "Pause"));
			buttons.appendChild(this._makeButton('_stop', _("STOP"), 'fa-stop'));
			buttons.appendChild(this._makeButton('_fs', _("FS"), 'fa-arrows-alt'));
			if(wide) buttons.appendChild(this._makeButton('_wide', _("WIDE"), 'fa-expand'));
			if(popup && !this.isPopup && !this.isEmbed)
			{
				var pop_pop = this._makeButton('_popup', _("POPUP"), 'fa-external-link');
				pop_pop.addEventListener('click', this.openPopup.bind(this), false);
				buttons.appendChild(pop_pop);
			}

			var masthead;
			if(this.bmusicMode && 
				(masthead = document.querySelector('#yt-masthead-user') ||
					document.querySelector('#yt-masthead-signin')))
			{
				var clone = buttons.cloneNode(true);
				clone.style.display = "inline-block";
				el = this._makeButton('_cv', _("CURRVIDEO"), 'vlc-fa-youtube');
				el.addEventListener('click', (function(){
					spf.navigate(this._current_video_page);
				}).bind(this), false);
				clone.appendChild(el);
				masthead.insertBefore(clone, masthead.firstChild);
			}

			if(this.bcompactVolume)
			{
				volbar.classList.add('yt-uix-button');
				volbar.classList.add('yt-uix-button-default');
				buttons.appendChild(volbar);
			} //else added after download/YT link

			if(this.bshowRate)
			{
				var nrm = this._makeButton('_rate', "1.0");
				nrm.title = _("RESETRATE");
				nrm.addEventListener('click', (function(e){
					this.sbRate.setValue(1.0);
					this.myvlc.emitValue(this.sbRate, 1.0);
				}).bind(this), false);
				buttons.appendChild(nrm);

				if(this.bshowRatePreset)
				{
					this.ratePreset = this._makeButton('_ratePreset', GM_getValue("vlc-rate-preset", 2));
					this.ratePreset.title = _("SETRATE");
					this.ratePreset.addEventListener('click', (function(e){
						this.sbRate.setValue(GM_getValue("vlc-rate-preset", 2));
						this.myvlc.emitValue(this.sbRate, GM_getValue("vlc-rate-preset", 2));
					}).bind(this), false);
					buttons.appendChild(this.ratePreset);
				}
			}
		}

		/// Mute
		if(this.bshowMute) {
			var btn = this._makeButton('_mute', _('MUTE'));
			btn.muteStyleToggle = function(mute) {
				if(mute) {
					this.classList.add('vlc-boo-bg');
					this.classList.add('vlc-wl-state');
				} else {
					this.classList.remove('vlc-boo-bg');
					this.classList.remove('vlc-wl-state');
				}
			};
			btn.addEventListener('click', (function(ev) {
				this.myvlc.vlc.audio.toggleMute();
				var vlc = this.myvlc.vlc;
				//wait for vlc to change state
				setTimeout(function(){ev.target.muteStyleToggle(vlc.audio.mute);}, 100);
			}).bind(this), false);
			buttons.appendChild(btn);
		}

		/// Format select
		var _fmtsel = this.selectNode || document.createElement("select");
		_fmtsel.id = vlc_id + '_select';
		_fmtsel.className = "yt-uix-button yt-uix-button-default";
		buttons.appendChild(_fmtsel);

		/// CC select
		var ccsel = document.createElement("select");
		{
			ccsel.id = vlc_id + '_ccselect';
			ccsel.className = "ccselect yt-uix-button yt-uix-button-default vlc_hidden";
			buttons.appendChild(ccsel);
		}

		var configbtn = this._makeButton('vlc-config-btn', '');
		configbtn.title = _("CONFIG");
		configbtn.addEventListener('click', (function(ev)
			{
				var el = this.$("vlc-config");
				if(el.style.display == 'block')
					el.style.display = 'none';
				else
					el.style.display = 'block';

				this.setSideBar(this.isWide);
			}).bind(this),
		false);

		if(!this.isEmbed) buttons.appendChild(configbtn);

		//if embed and logged in
		if((this.isEmbed || this.bshowWLOnMain) && this.swf_args && typeof(this.swf_args.authuser) != 'undefined')
		{
			var watchbtn = this._makeButton('vlc-watchlater-btn', _('WATCHLATER'), 'fa-clock-o fa-lg');
			watchbtn.addEventListener('click', this.ajaxWatchLater.bind(this), false);
			buttons.appendChild(watchbtn);
		}

		/// Download link
		var link = document.createElement("A");
		{
			link.id = "vlclink";
			link.className = "yt-uix-button yt-uix-button-default"; //might confuse some
			//link.className = "vlclink";//'#player a' overrides
			link.title = _("LINKSAVE");
			link.setAttribute("href", "#");
			link.setAttribute("target", "_new");
			link.innerHTML = (this.bbtnIcons ? '<i class="fa fa-lg fa-download"></i>' : '') + //bool just for consistency
				'<span class="yt-uix-button-content">' + _("DOWNLOAD") + '</span>';
			//https://bugzilla.mozilla.org/show_bug.cgi?id=676619
			if(!this.isEmbed && this.ytplayer && this.ytplayer.config)
				link.setAttribute("download", this.ytplayer.config.args.title + ".mp4"); //TODO link filename
			if(dl)// && isEmbed)
				buttons.appendChild(link);
		}

		///Watch on YT link
		if(this.isEmbed)
		{
			link = document.createElement("A");
			link.className = "yt-uix-button yt-uix-button-default";
			link.setAttribute("href", "//" + this.win.location.hostname + "/watch?v=" + this.swf_args.video_id);
			link.setAttribute("target", "_new");
			link.innerHTML = (this.bbtnIcons ? '<i class="fa vlc-fa-youtube fa-lg"></i>' : '') +
				'<span class="yt-uix-button-content">' + _("WATCHYT") + ' </span>';
			link.title = _("WATCHYT");
			link.addEventListener('click', (function(){this.myvlc.pauseVideo();}).bind(this), false);
			buttons.appendChild(link);
		}

		if(!this.bcompactVolume && this.buseWidePosBar && !this.isEmbed)
			buttons.appendChild(volbar);

		controls.appendChild(buttons);
	}

	if(false && !this.isEmbed)
	{
		this.txt = document.createElement("TEXTAREA");
		this.txt.id = "vlc-dash-mpd";
		controls.appendChild(this.txt);
	}

	//Configurator comes here
	// appearance is kinda ugly :P
	var config = document.createElement("div");
	{
		config.id = "vlc-config";
		var fmt = document.createElement("div");
		fmt.id = "vlc-config-formats";
		fmt.title = _("DND");

		var frmts_dirty = GM_getValue("vlc-formats", itagPrio.join(',')).split(',');
		var frmts = cleanFormats(frmts_dirty);

		var dragwrap = document.createElement("div");
		dragwrap.id = "vlc-config-drag";
		for(i in frmts)
		{
			el = document.createElement("div");
			el.setAttribute("data", frmts[i]);
			el.className = "row";
			el.draggable = true;
			el.textContent = itagToText[frmts[i]];
			dragwrap.appendChild(el);
		}
		fmt.appendChild(dragwrap);
		config.appendChild(fmt);

		//Merge random configs into one div
		var midcolumn = document.createElement("div");
		midcolumn.id = "vlc-config-midcol";
		config.appendChild(midcolumn);

		var langs = document.createElement("div");
		{
			langs.id = "vlc-config-lang";

			var s = document.createElement("span");
			s.id = "vlc-config-lang-icon";
			langs.appendChild(s);
			var sel = document.createElement("select");
			sel.id = vlc_id + '_lang_select';
			sel.className = "yt-uix-button yt-uix-button-default";
			for(i in gLangs)
			{
				var opt = document.createElement("option");
				opt.setAttribute("value", i);
				opt.textContent = gLangs[i].LANG;
				if(gLang == i) opt.selected = true;
				sel.appendChild(opt);
			}
			sel.addEventListener('change', (function(ev){
				gLang = ev.target.value;
				GM_setValue('vlc-lang', gLang);
				this.reloadPlayer();
			}).bind(this), false);
			langs.appendChild(sel);
			midcolumn.appendChild(langs);
		}

		///Playback rate
		el = document.createElement("div");
		{
			el.id = "vlc-config-rate-values";
			inp = document.createElement("input");
			inp.value = tryParseFloat(GM_getValue('vlc-rate-min', '0.25'), 0.25);
			inp.title = _("MINRATE");
			inp.className = "tiny";
			inp.addEventListener('change', (function(e){
				GM_setValue('vlc-rate-min', e.target.value);
				var f = parseFloat(e.target.value);
				this.sbRate.setMinValue(f); this.sbRate.setValue(Math.max(this.sbRate.getValue(), f));
			}).bind(this), false);
			el.appendChild(inp);

			inp = document.createElement("input");
			inp.value = tryParseFloat(GM_getValue('vlc-rate-max', '2'), 2);
			inp.title = _("MAXRATE");
			inp.className = "tiny";
			inp.addEventListener('change', (function(e){
				GM_setValue('vlc-rate-max', e.target.value);
				var f = parseFloat(e.target.value);
				this.sbRate.setMaxValue(f); this.sbRate.setValue(Math.min(this.sbRate.getValue(), f));
			}).bind(this), false);
			el.appendChild(inp);

			lbl = document.createElement("div");
			lbl.innerHTML = _("PLAYBACKRATE") + "(min / max):";
			midcolumn.appendChild(lbl);
			midcolumn.appendChild(el);
		}

		el = document.createElement("div");
		{
			el.id = "vlc-config-rate-preset";
			inp = document.createElement("input");
			inp.value = tryParseFloat(GM_getValue('vlc-rate-preset', '2'), 2);
			inp.title = _("CUSTRATEPRESET");
			inp.className = "tiny";
			inp.addEventListener('change', (function(e){
				var f = parseFloat(e.target.value);
				GM_setValue('vlc-rate-preset', f);
				this.ratePreset.innerHTML = f;
			}).bind(this), false);
			el.appendChild(inp);

			lbl = document.createElement("div");
			lbl.innerHTML = _("PLAYBACKRATEPRESET") + ":";
			midcolumn.appendChild(lbl);
			midcolumn.appendChild(el);
		}

		///Repeat wait timeout
		el = document.createElement("div");
		{
			el.id = "vlc-config-repeat";
			inp = document.createElement("input");
			inp.value = tryParseFloat(GM_getValue('vlc-repeat-wait', "0"));
			inp.title = _("vlc-config-repeat-wait")[1];
			inp.className = "tiny";
			inp.addEventListener('change', function(e){ GM_setValue('vlc-repeat-wait', e.target.value);}, false);

			lbl = document.createElement("div");
			lbl.innerHTML = _("vlc-config-repeat-wait")[0];
			el.appendChild(lbl);
			el.appendChild(inp);

			midcolumn.appendChild(el);
		}

		///Max volume
		el = document.createElement("div");
		{
			el.id = "vlc-config-volume-max";
			inp = document.createElement("input");
			inp.value = tryParseFloat(GM_getValue('vlc-volume-max', "100"), 100.0).toFixed(0);
			inp.title = _("vlc-config-volume-max")[1];
			inp.className = "tiny";
			inp.addEventListener('change', (function(e){
				GM_setValue('vlc-volume-max', e.target.value);
				var f = parseFloat(e.target.value);
				this.maxVolume = f;
				this.sbVol.setMaxValue(f); this.sbVol.setValue(Math.min(this.sbVol.getValue(), f));
				}).bind(this), false);

			lbl = document.createElement("div");
			lbl.innerHTML = _("vlc-config-volume-max")[0];
			el.appendChild(lbl);
			el.appendChild(inp);

			midcolumn.appendChild(el);
		}

		///Buffer length
		el = document.createElement("div");
		{
			el.id = "vlc-config-cache";
			inp = document.createElement("input");
			inp.value = tryParseFloat(GM_getValue('vlc-cache', "5"));
			inp.title = _("vlc-config-cache")[1];
			inp.className = "tiny";
			inp.addEventListener('change', function(e){
				var cache = tryParseFloat(e.target.value, 5);
				if(cache < 0) cache = 0;
				else if(cache > 60) cache = 60; //max 60 seconds according to vlc help
				GM_setValue('vlc-cache', cache);
				}, false);

			lbl = document.createElement("div");
			lbl.innerHTML = _("vlc-config-cache")[0];
			el.appendChild(lbl);
			el.appendChild(inp);

			midcolumn.appendChild(el);
		}

		///Wide size
		el = document.createElement("div");
		{
			el.id = "vlc-config-wide-width";
			inp = document.createElement("input");
			inp.value = GM_getValue('vlc-wide-width', this.widthWide);
			inp.title = _("vlc-config-wide-width")[1];
			inp.className = "tiny";
			inp.addEventListener('change', (function(e){ this.widthWide = e.target.value; GM_setValue('vlc-wide-width', e.target.value);}).bind(this), false);

			lbl = document.createElement("div");
			lbl.innerHTML = _("vlc-config-wide-width")[0];
			el.appendChild(lbl);
			el.appendChild(inp);

			midcolumn.appendChild(el);
		}

		///Subtitle alignment
		el = document.createElement("div");
		{
			el.id = "vlc-config-subs-align";
			inp = document.createElement("select");
			var arr = ["CENTER", "LEFT", "RIGHT", "TOP", "TOP-LEFT", "TOP-RIGHT", "BOTTOM", "BOTTOM-LEFT", "BOTTOM-RIGHT"];
			arr.forEach(function(e)
			{
				var opt = document.createElement("option");
				opt.value = e;
				opt.innerHTML = e;
				inp.appendChild(opt);
			});

			inp.value = GM_getValue('vlc-subs-align', 'BOTTOM');
			inp.title = _("vlc-config-subs-align")[1];
			inp.className = "tiny";
			inp.addEventListener('change', (function(e){
				GM_setValue('vlc-subs-align', e.target.value);
				this.myvlc.setupMarquee(null, null, e.target.value);
			}).bind(this), false);
			el.appendChild(inp);

			lbl = document.createElement("div");
			lbl.innerHTML = _("vlc-config-subs-align")[0] + ":";
			midcolumn.appendChild(lbl);
			midcolumn.appendChild(el);
		}

		///Subtitle color
		el = document.createElement("div");
		{
			el.id = "vlc-config-subs-color";
			inp = document.createElement("input");

			var SetColors = function(el, hex)
			{
				el.style.backgroundColor = "#" + hex;
				var rgb = parseInt(hex, 16);
				// From jscolor
				el.style.color =
					0.213 * ((rgb >> 16) & 0xFF) +
					0.715 * ((rgb >> 8) & 0xFF) +
					0.072 * (rgb & 0xFF) <
					128 ? '#FFF' : '#000';
			};

			inp.value = GM_getValue('vlc-subs-color', 'FFFFFF');
			inp.title = _("vlc-config-subs-color")[1];
			inp.className = "tiny";
			SetColors(inp, inp.value);

			inp.addEventListener('change', (function(e){
				var hex = e.target.value.toUpperCase();
				GM_setValue('vlc-subs-color', hex);
				this.myvlc.setMarqueeColor(hex);
				SetColors(inp, hex);
			}).bind(this), false);
			el.appendChild(inp);

			lbl = document.createElement("div");
			lbl.innerHTML = _("vlc-config-subs-color")[0] + ":";
			midcolumn.appendChild(lbl);
			midcolumn.appendChild(el);
		}

		// Floating checkboxes look nasty and don't play nicely with language selector
		var chkboxes = document.createElement("div");
		chkboxes.id = "vlc-config-checkboxes";
		/// Autoplay button
		chkboxes.appendChild(this._makeCheckbox("vlc-config-autoplay", 'bautoplay'));
		chkboxes.appendChild(this._makeCheckbox("vlc-config-autoplay-pl", 'bautoplayPL'));
		chkboxes.appendChild(this._makeCheckbox("vlc-config-autoplay-yt", 'bautoplayYT'));
		/// menu settings
		chkboxes.appendChild(this._makeCheckbox("vlc-config-repeat",   'buseRepeat'));
		chkboxes.appendChild(this._makeCheckbox("vlc-config-priomap",  'balwaysBestFormat'));
		chkboxes.appendChild(this._makeCheckbox("vlc-config-resume",   'bresumePlay'));
		chkboxes.appendChild(this._makeCheckbox("vlc-config-forcewide",'bforceWide'));
		chkboxes.appendChild(this._makeCheckbox("vlc-config-forcews",  'bforceWS'));
		chkboxes.appendChild(this._makeCheckbox("vlc-config-add3d",    'badd3DFormats'));
		chkboxes.appendChild(this._makeCheckbox("vlc-config-hover",    'buseHoverControls'));
		//chkboxes.appendChild(this._makeCheckbox("vlc-config-loadembed",     'bforceLoadEmbed')); //unused
		chkboxes.appendChild(this._makeCheckbox("vlc-config-embedcontrols", 'bembedControls'));
		chkboxes.appendChild(this._makeCheckbox("vlc-config-vertvolume",    'bcompactVolume'));
		//chkboxes.appendChild(this._makeCheckbox("vlc-config-forcepl",  'bforceWidePL')); //eh no need
		chkboxes.appendChild(this._makeCheckbox("vlc-config-thumb",  'buseThumbnail'));
		chkboxes.appendChild(this._makeCheckbox("vlc-config-rate",   'bshowRate'));
		chkboxes.appendChild(this._makeCheckbox("vlc-config-cust-speed-preset", 'bshowRatePreset'));
		chkboxes.appendChild(this._makeCheckbox("vlc-config-wide-posbar", 'buseWidePosBar'));
		chkboxes.appendChild(this._makeCheckbox("vlc-config-popup", 'busePopups'));
		chkboxes.appendChild(this._makeCheckbox("vlc-config-popup-separate", 'bpopupSeparate'));
		chkboxes.appendChild(this._makeCheckbox("vlc-config-popup-autoplay", 'bpopupAutoplay'));
		chkboxes.appendChild(this._makeCheckbox("vlc-config-scrolltoplayer", 'bscrollToPlayer'));
		chkboxes.appendChild(this._makeCheckbox("vlc-config-dropdown", 'bconfigDropdown'));
		chkboxes.appendChild(this._makeCheckbox("vlc-config-uri-fallback", 'buseFallbackHost'));
		chkboxes.appendChild(this._makeCheckbox("vlc-config-discard-flvs", 'bdiscardFLVs'));
		chkboxes.appendChild(this._makeCheckbox("vlc-config-dark-theme", 'bdarkTheme'));
		chkboxes.appendChild(this._makeCheckbox("vlc-config-adaptives", 'badaptiveFmts'));
		chkboxes.appendChild(this._makeCheckbox("vlc-config-mute-button", 'bshowMute'));
		chkboxes.appendChild(this._makeCheckbox("vlc-config-jumpts", 'bjumpTS'));
		chkboxes.appendChild(this._makeCheckbox("vlc-config-wl-main", 'bshowWLOnMain'));
		chkboxes.appendChild(this._makeCheckbox("vlc-config-subs-on", 'bautoSubEnable'));
		chkboxes.appendChild(this._makeCheckbox("vlc-config-btn-icons", 'bbtnIcons'));
		chkboxes.appendChild(this._makeCheckbox("vlc-config-custom-wide", 'bcustomWide'));
		chkboxes.appendChild(this._makeCheckbox("vlc-config-music-mode", 'bmusicMode'));
		chkboxes.appendChild(this._makeCheckbox("vlc-config-sidebar-ignore", 'bignoreSidebar'));
		config.appendChild(chkboxes);

	}

	var spacer;
	//TODO Caveat is that controls don't get updated when hidden so prepare for inconsistencies
	if(this.buseHoverControls && this.isEmbed)
	{
		spacer = document.createElement("div");
		spacer.id = "vlc-spacer";
		spacer.style.height = "15px";
		//spacer.style.background = "rgb(175,43,38)";//YT red
		spacer.innerHTML = "Hover on this bar for controls.";
		controls.style.background = "white";//Hm, div needs to be 'solid' or it gets hidden behind the plugin
		controls.style.position = "relative";
		//controls.style.display = "none";
		spacer.appendChild(controls);
		vlc.appendChild(spacer);
	}
	else
	{
		vlc.appendChild(controls);
		vlc.appendChild(config);
	}

	// check the animation name and operate accordingly
	function dispatchMEvent(event) {
		/*jshint validthis: true */
		this.setPlayerSize(this.isWide);
		this.setSideBar(this.isWide);
	}

	// window.matchMedia()
	var mediaEvents = document.createElement('div');
	mediaEvents.className = "vlc-media-event-detector";
	mediaEvents.addEventListener('animationstart', dispatchMEvent.bind(this), false);
	document.body.appendChild(mediaEvents);
	if(this.isEmbed)
	{
		var resizer = function(ev) {
			/*jshint validthis: true */
			if (this._resize_to)
				window.clearTimeout(this._resize_to);
			this._resize_to = window.setTimeout((function(ev){
					dispatchMEvent.call(this, ev);
					this._resize_to = null;
				}).bind(this), 100);
		};
		window.addEventListener('resize', resizer.bind(this));
	}

	return {dom: vlc, node: embedNode};
};

//Shamelessly stolen from http://www.html5rocks.com/en/tutorials/dnd/basics/
ScriptInstance.prototype.makeDraggable = function() {

	var that = this;
	var id_ = 'vlc-config-formats';
	var cols_ = document.querySelectorAll('#' + id_ + ' .row');
	var dragSrcEl_ = null;
	this.handleDragStart = function (e) {
		e.dataTransfer.effectAllowed = 'move';
		e.dataTransfer.setData('text/html', this.getAttribute('data'));
		dragSrcEl_ = this;
		this.classList.add('moving');
	};
	this.handleDragOver = function (e) {
		if (e.preventDefault) {
			e.preventDefault();
		}
		e.dataTransfer.dropEffect = 'move';
		return false;
	};
	this.handleDragEnter = function (e) {
		this.classList.add('over');
	};
	this.handleDragLeave = function (e) {
		this.classList.remove('over');
	};
	this.handleDrop = function (e) {
		if (e.stopPropagation) {
			e.stopPropagation();
		}
		if (dragSrcEl_ != this) {
			var parent = dragSrcEl_.parentNode;

			//Dropped-on item is the next to this and it's not the last item, so add after it
			if(dragSrcEl_.nextSibling == this && this.nextSibling)
			{
				parent.removeChild(dragSrcEl_);
				parent.insertBefore(dragSrcEl_, this.nextSibling);
			}
			else if(!this.nextSibling) //Dropped on last item in list, so just append
			{
				parent.removeChild(dragSrcEl_);
				parent.appendChild(dragSrcEl_);
			}
			else //For all other cases, add before dropped-on item
			{
				parent.removeChild(dragSrcEl_);
				parent.insertBefore(dragSrcEl_, this);
			}

			//Save it
			var arr = [];
			var el = that.$("vlc-config-drag");
			for(var i=0; i<el.childNodes.length;i++)
			{
				arr.push(el.childNodes[i].getAttribute("data"));
			}
			GM_setValue("vlc-formats", arr.join(','));
		}
		return false;
	};
	this.handleDragEnd = function (e) {
		[].forEach.call(cols_, function (col) {
			col.classList.remove('over');
			col.classList.remove('moving');
		});
	};
	[].forEach.call(cols_, function (col) {
		col.setAttribute('draggable', 'true');
		col.addEventListener('dragstart', that.handleDragStart, false);
		col.addEventListener('dragenter', that.handleDragEnter, false);
		col.addEventListener('dragover', that.handleDragOver, false);
		col.addEventListener('dragleave', that.handleDragLeave, false);
		col.addEventListener('drop', that.handleDrop, false);
		col.addEventListener('dragend', that.handleDragEnd, false);
	});
};

function getXML(url, callback)
{
	//printStack();
	//or referrer?
	//headers["Referer"] = window.location.href;
	GM_xmlhttpRequest({
		method: 'GET',
		url: url,
		headers: headers,
		onload: function(r){
			if(r.status==200){
				callback(r.responseText);
			}
		}
	});
}

ScriptInstance.prototype.parseLive = function(pl)
{
	this.urlMap = [];
	var m, t = pl.split('\n');
	for(var i=0;i<t.length-1;i++)
	{
		if((m = /#EXT-X-STREAM-INF.*?RESOLUTION=(\d+\w\d+)/.exec(t[i])) &&
			/http/i.test(t[i+1]))
		{
			var obj = {};
			obj.name = /itag\/(\d+)/.exec(t[i+1])[1];
			obj.url  = t[i+1];
			if(itagToText.hasOwnProperty(obj.name))
				obj.text = itagToText[obj.name];
			else
				obj.text = "Live " + m[1];
			this.urlMap.push(obj);
			this.qualityLevels.push(obj.name);
		}
	}
	//regen with live feeds
	this.genUrlSelect();
};

ScriptInstance.prototype.parseUrlMap = function(urls, clean)
{
	if(!urls) return;
	var that = this;
	if(clean) this.urlMap = [];
	this.sigDecodeParam = null;
	var rCLen = new RegExp("clen=(\\d+)");
	var rDur = new RegExp("dur=(\\d+)");
	urls.split(',').forEach(function(map){
		var kv = {};
		var obj = {};
		map.split('&').forEach(function(a)
		{
			var t = a.split('=');
			kv[t[0]] = unescape(t[1]);
		});

		if(!that.badd3DFormats && kv.stereo3d)
		{
			//nothing
		}
		else if('url' in kv)
		{
			var type = kv.type.split(';')[0].split('/')[1];
			if(that.bdiscardFLVs && type == 'x-flv')
				return;
			var url = kv.url;
			obj.name = kv.itag;
			obj.url = url;

			obj.text = (kv.itag in itagToText ? itagToText[kv.itag] : "Fmt " + kv.itag);

			if(rCLen.test(url))
				kv.clen = rCLen.exec(url)[1];
			if(rDur.test(url))
				kv.dur = rDur.exec(url)[1];
			obj.kv = kv;

			//if(kv['stereo3d']) obj.text += '/stereo3D';
			that.qualityLevels.push(kv.itag);
			that.urlMap.push(obj);
		}
		else if(!that.weirdstreams)
		{
			that.weirdstreams = true;
			that.insertYTmessage("VLCTube: " + ( 'conn' in kv && kv.conn.indexOf('rtmpe') > -1 ? "Sorry, encrypted rtmp stream." : "Weird stream map"));
			return;
		}
	});

	//try again
	if(!this.urlMap.length && this.bdiscardFLVs)
	{
		this.bdiscardFLVs = false;
		return this.parseUrlMap(urls);
	}

	//YT generated MPD that VLC can't play yet
	if(clean && this.ytplayer && this.ytplayer.config && this.ytplayer.config.args.dashmpd
		&& this.ytplayer.config.args.dashmpd !== '')
	{
		var obj = {
			name: "0",
			url: this.ytplayer.config.args.dashmpd,
			text: "DASH"
		};
		this.qualityLevels.push(0);
		this.urlMap.push(obj);
	}

	if(!this.urlMap.length)
	{
		console.log("no stream maps");
		return false;
	}

	return true;
};

ScriptInstance.prototype.genUrlSelect = function()
{
	this.selectNode = this.selectNode || this.$(vlc_id+"_select") || document.createElement('select');
	removeChildren(this.selectNode, true);

	var map = function(item){
		var option = document.createElement("option");
		option.setAttribute("name",  item.name);
		option.setAttribute("value", item.url);
		option.textContent = item.text;

		if(item.kv)
		{
			if('s' in item.kv)
			{
				option.setAttribute("s", item.kv.s);
				this.isCiphered = true;
			}
			else if(item.kv.sig)
				option.setAttribute("sig", item.kv.sig);
			if('fallback_host' in item.kv)
				option.setAttribute("fallback", item.kv.fallback_host);
			//used for custom MPD generation, probably remove all of it
			option.kv = item.kv;
		}

		this.selectNode.appendChild(option);
	};
	this.urlMap.forEach(map.bind(this));

	return true;
};

ScriptInstance.prototype.getPL = function()
{
	return this.$('watch-appbar-playlist');//if in playlist mode
};


ScriptInstance.prototype.getStreams = function(watchPage)
{
	var gotVars = this.pullYTVars();
	if(this.swf_args === null) {
		console.log("no source");
		if(watchPage) this.insertYTmessage ('VLCTube: Unable to find video source');
		return false;
	}

	if(gotVars) {
		var hasStreams = this.parseUrlMap(this.swf_args.url_encoded_fmt_stream_map, true);
		hasStreams = (this.badaptiveFmts && this.parseUrlMap(this.swf_args.adaptive_fmts)) || hasStreams;
		hasStreams = (this.swf_args.hlsvp && this.swf_args.hlsvp.length) || hasStreams;

		if(!hasStreams && watchPage)
		{
			console.log("Nothing to play! Bailing...");
			this.insertYTmessage ('VLCTube: Nothing to play! Bailing...');
			return false;
		}
	}
	return true;
};

///On 'watch' page
ScriptInstance.prototype.onMainPage = function(oldNode, spfNav, upsell)
{
	var that = this;
	var userPage = /^\/user\/|^\/channel\//.test(this.win.location.pathname);
	var watchPage = /^\/watch/.test(this.win.location.pathname);

	if(!this.getStreams(watchPage))
		return;

	this.isInWatchLater();
	if(spfNav && this.bmusicMode &&
		this.swf_args && this.swf_args.video_id &&
			(this.swf_args.video_id == this._current_video_id))
	{
		this.setPlayerSize(this.isWide);
		this.setSideBar(this.isWide);
		return;
	}

	//FIXME ytspf appears too late
	//this.bmusicMode = this.bmusicMode && ytspf.enabled;

	if(!spfNav /*|| (!upsell && document.querySelector("#movie_player"))*/)
	{
		//if(!this.getStreams(watchPage))
		//	return;

		//FIXME Already removed, but html5 player element doesn't get the hint
		if(oldNode)
			removeChildren(oldNode, true);
		else
			this.exterminate();

		/* Player */
		if(upsell)
			this.player = this.$('upsell-video') || this.$('upsell-video-vlc');
		else
			this.player = this.$(gPlayerApiID) || this.$(gPlayerApiID+"-vlc");

		if(!this.player)
		{
			if(!upsell) this.insertYTmessage("VLCTube: Failed, no player element.");
			return;
		}

		this.player.classList.remove('player-height');
		this.player.id = upsell ? 'upsell-video-vlc' : gPlayerApiID /*+"-vlc"*/; //Use youtube CSS and also so that JS would work

		var vlcNode = this.generateDOM({userPage:userPage, upsell:upsell, wide:!userPage, dl:!userPage});
		this.player.appendChild(vlcNode.dom);
		this.makeDraggable();

		this.setupVLC(vlcNode.node);
		this.genUrlSelect();
		// TODO seems to linger around too long
		/*if(userPage && !upsell)
		{
			var upseller = new ScriptInstance(window);
			upseller.init(false, null, true);
		}*/
	}

	this.setThumbnailVisible(this.buseThumbnail);
	if(this.bscrollToPlayer) this.player.scrollIntoView(true);

	var plbtn = document.querySelector('div.playlist-nav-controls button.toggle-autoplay');

	function togglePLNext(ev)
	{
		if(GM_getValue('vlc-pl-autonext', false))
			plbtn.classList.add('yt-uix-button-toggled');
		else
			plbtn.classList.remove('yt-uix-button-toggled');
		if(ev) //from event listener
			GM_setValue('vlc-pl-autonext', !GM_getValue('vlc-pl-autonext', false));
	}

	if(plbtn)
	{
		togglePLNext();
		plbtn.addEventListener('click', togglePLNext, false);
	}

	this.$(vlc_id+'_ccselect').classList.add('vlc_hidden');
	this.myvlc.ccObj = null;
	//too much flipping between vlc, old thumbnail, new thumbnail
	//this.setThumbnailVisible(true);
	//this.myvlc.stopVideo();
	this.setBuffer(0);
	this.setPlayerSize(this.isWide);
	this.setSideBar(this.isWide);
	this.qualityLevels = [];
	//TODO remove this
	var wlspan = document.querySelector('#vlc-watchlater-btn span');
	if(wlspan){
		wlspan.classList.remove('vlc-wl-state');
		wlspan.classList.remove('vlc-ok-bg');
		wlspan.classList.remove('vlc-boo-bg');
	}

	// wait or GM_s/getValue return garbage
	var setup = function(){
		//watchPage = /\/watch/.test(this.win.location.href);
		//console.log("Watch:", watchPage, this.win.location.href);

		// TODO seems to linger around too long
		/*if(spfNav && userPage && !upsell)
		{
			//Blah, no sources
			var upseller = new ScriptInstance(window);
			upseller.init(false, null, true);
			console.log("spf upseller");
		}*/

		this.SetupAPI();
		this.overrideRef();

		var unavail = this.$('player-unavailable');
		if(unavail && !unavail.classList.contains("hid"))
		{
			console.log("video seems to be unavailable");
			return;
		}

		if(!this.isPopup && !watchPage) return;
		if(spfNav)
		{
			//if(!this.getStreams(watchPage))
			//	return;

			this.genUrlSelect();

			var thumb = this.swf_args.iurlhq ? this.swf_args.iurlhq :
						this.swf_args.iurlsd ? this.swf_args.iurlsd :
						this.swf_args.iurlmq ? this.swf_args.iurlmq :
						this.swf_args.iurl;
			var tn = this.elements.thumbnail || document.querySelector("#vlc-thumbnail");
			var tn2 = this.elements.holder || document.querySelector("#" + vlc_id + "-holder");
			if(thumb && this.buseThumbnail)
			{
				tn.classList.remove("vlc_hidden");//new video probably
				//tn.setAttribute('src', this.thumb.href);
				tn2.style.backgroundImage = "url(" + thumb + ")";
				tn2.style.backgroundRepeat = "no-repeat";
				tn2.style.backgroundSize = "100%";
				tn2.style.backgroundPosition = "50%";
				//not needed but just in case
				if(tn._has_onclick_evt !== true)
				{
					tn.addEventListener('click', (function(ev){ this.myvlc.playVideo(); }).bind(this), false);
					tn._has_onclick_evt = true;
				}
			}
			else
				tn.classList.add("vlc_hidden");//perma hide
			this.myvlc.stateUpdate();
		}

		this.$('player-api').style.overflow = "";
		//this.setThumbnailVisible(true);
		this._current_video_id = this.swf_args.video_id;
		this._current_video_page = window.location.href;
		this.myvlc.stopVideo();
		this.initialAddToPlaylist();
		this.doViewTracking();
		this.queryCC();
		this.overrideRef();
		this.setupStoryboard();
		//FIXME still few pixels off
		this.setPlayerSize(this.isWide);
		this.setSideBar(this.isWide);
		if(/#popup/.test(this.win.location.href))
			this.openAsPopup();
	};
	this.win.setTimeout(setup.bind(this), 1000);

	return true;
};

ScriptInstance.prototype.doViewTracking = function()
{
	//TODO Correct hostname is s.youtube.com though but CORS is acting up (?)
	var ptracking = '//www.youtube.com/api/stats/playback?ns=yt&el=detailpage&ver=2&euri'
		+ '&docid=' + this.swf_args.video_id
		+ '&ei=' + this.swf_args.eventid
		+ '&plid=' + this.swf_args.plid
		+ '&cpn=nuffin';
		//+ '&cplayer=UNIPLAYER&c=WEB&cver=html5'
		//+ '&vm=' + this.swf_args.vm
		//+ '&of=' + this.swf_args.of
		//+ '&fexp=' + this.swf_args.fexp;
	getXML(ptracking, function(r){});
};

var xhr_state = ["UNSENT", "OPENED", "HEADERS_RECEIVED", "LOADING", "DONE"];
ScriptInstance.prototype.loadEmbedVideo = function()
{
	var that = this;
	var url = this.win.location.protocol + "//"
			+ this.win.location.hostname + "/get_video_info?video_id="
			+ this.swf_args.video_id
			+ "&html5=1&cver=html5&el=embedded&iframe=1&asv=3&eurl="
			+ escape(this.yt.config_.EURL)
			+ "&sts=" + this.yt.config_.PLAYER_CONFIG.sts;

	getXML(url,
		function(resp)
		{
			var param_map = {};
			var stream_map = [];

			var params = resp.split('&');

			for(var i=0; i<params.length; i++)
			{
				var t = params[i].split('=');
				param_map[t[0]] = t[1];
			}

			if(param_map.status == "fail")
			{
				var title = that.$$('html5-title');
				if(title.length)
				{
					el = document.createElement("SPAN");
					el.innerHTML = unescape(param_map.reason).replace(/\+/g,' ');
					title[0].appendChild(document.createTextNode(" - "));
					title[0].appendChild(el);
				}
				return;
			}

			that.parseUrlMap(decodeURIComponent(param_map.url_encoded_fmt_stream_map), true);
			if(that.badaptiveFmts)
				that.parseUrlMap(decodeURIComponent(param_map.adaptive_fmts), false);
			that.genUrlSelect();

			//set global width/height before generation
			that.width = "100%";
			that.height = document.body.clientHeight;
			removeChildren(that.player, true);
			function insertPlayer() {
				var vlcNode = that.generateDOM({wide:false, dl:false});
				vlcNode.dom.style.height = "100%";

				that.player = that.$('player');
				that.player.appendChild(vlcNode.dom);

				//Now fix the height
				var spacer = that.$('vlc-spacer');

				if(spacer)
				{
					that.$("vlc_controls_div").style.display = "block";//Show so that clientHeight is computed
					that.$("vlc_controls_div").style.top = -that.$("vlc_controls_div").clientHeight + "px";

					that.$(vlc_id+"-holder").style.height = (that.$(gMoviePlayerID).clientHeight - spacer.clientHeight) + "px";
					that.$("vlc_controls_div").style.display = '';//Reset to CSS or none if using javascript
				}
				else
					//FIXME hidden element height is 0px
					that.$(vlc_id+"-holder").style.height = (that.$(gMoviePlayerID).clientHeight - that.$("vlc_controls_div").clientHeight) + "px";

				that.setupVLC(vlcNode.node);
			}

			var embed = that.$('cued-embed');

			function playEmbed(ev){
				//Do once or crash the plugin
				if(!that.$('movie_player')) {
					insertPlayer();
					var player = that.$('player');
					player.style.width = "100%";
					player.style.height = "100%";
					that.initialAddToPlaylist();
					that.queryCC();
					that.overrideRef();
					that.setupStoryboard();
					that.doViewTracking();
				}
				embed.classList.add('hid');
				that.myvlc.playVideo();
				that.onHashChange(that.win.location.href);
			}

			if(embed)
			{
				var _vid = embed;//use as fallback
				var thumb = that.$('video-thumbnail');

				//Blah, arguments.callee no worky in strict mode
				thumb.removeEventListener('click', that._loadEmbedCB, false);
				thumb.addEventListener('click', playEmbed , false);
				playEmbed();
			}
		}
	);
};

ScriptInstance.prototype.onEmbedPage = function()
{
	var that = this;
	// writeEmbed(); overwrites
	this.pullYTVars();
	this.yt.getConfig = this.yt.getConfig || function(p){ return this.config_[p]; };

	if(!this.swf_args)
	{
		console.log('VlcTube: Unable to find video source');
		return;
	}

	var thumb = this.swf_args.iurlsd ? this.swf_args.iurlsd :
			this.swf_args.iurlmq ? this.swf_args.iurlmq :
			this.swf_args.iurl;

	if(document.body.clientWidth > 800)
		thumb = this.swf_args.iurlhq ? this.swf_args.iurlhq : thumb;

	// iurlmaxres with 4k video though... maybe too much
	if(document.body.clientWidth > 1200)
		thumb = this.swf_args.iurlmaxres ? this.swf_args.iurlmaxres : thumb;

	this.$('player').innerHTML = '<div id="cued-embed" title="Click to play." style="cursor:pointer">\
			<h2 style="color:white;font-size:small"><div id="video-title" class="html5-title">\
			<a style="color:white" target="_new" href="//www.youtube.com/watch?v='+
			this.swf_args.video_id + '">' + this.swf_args.title + '</a>\
		</div></h2><img id="video-thumbnail" class="video-thumbnail" style="height: 100vh; width:100%;" src="'+
		thumb + '"></div>';

	/*if(this.bforceLoadEmbed)
	{
		this.loadEmbedVideo();
	}
	else*/
	{
		this._loadEmbedCB = this.loadEmbedVideo.bind(this);
		this.$('video-thumbnail').addEventListener('click', this._loadEmbedCB, false);
	}
};


//ytplayer.config.args.storyboard_spec
ScriptInstance.prototype.setupStoryboard = function()
{
	if(this.storyboard)
		this.sbPos.unregister(this.storyboard);
	this.storyboard = null;
	var el = document.querySelector('#vlc-sb-tooltip');
	//hide/reset
	el.style.backgroundImage = '';
	el.classList.add('hid');
	if(this.ytplayer && this.ytplayer.config && this.ytplayer.config.args.storyboard_spec)
	{
		this.storyboard = new Storyboard(el, this.ytplayer.config.args.storyboard_spec);
		this.sbPos.register(this.storyboard);
		this.storyboard.setImg(0);
		el.classList.remove('hid');
	}
};

ScriptInstance.prototype.initialAddToPlaylist = function(bypass, dohash)
{
	if(bypass || this.restoreSettings())
	{
		var sel = this.$(vlc_id+'_select');
		if(!sel && this.isEmbed) return true;
		var opt = sel.options.item(sel.selectedIndex);
		this.onFmtChange(null, opt);
		//Fake hashchange
		//FIXME jump when video plays for vlc to seek to
		//if(dohash)
			setTimeout(this.onHashChange.bind(this, this.win.location.href), 500);
		return true;
	}
	return false;
};

ScriptInstance.prototype.setupVLC = function(vlcNode)
{
	var that = this;
	this.myvlc = new VLCObj(this);
	this.sbPos = new ScrollBar(this);
	this.sbPos.initSB('#sbSeek', '#sbSeek div.knob', 2, 0, 1, true);
	var spacer = that.$('vlc-spacer');

	if(spacer)
		this.elements.controls.style.display = "block";//Show so that css is computed

	var maxvolume = tryParseFloat(GM_getValue('vlc-volume-max', "100"), 100.0).toFixed(0);
	if(maxvolume < 100) maxvolume = 100;

	this.sbVol = new ScrollBar(this);
	this.sbVol.initSB('#sbVol', '#sbVol div.knob', bcompactVolume?1:2, 0, maxvolume, true,
		function(pos){this.bar.children.namedItem('vlcvol').innerHTML = Math.round(pos);});

	if(this.bshowRate)
	{
		this.sbRate = new ScrollBar(this);
		//sbRate.init('#sbRate', '#sbRate div.knob', 0, -1, 3, true);
		//Limiting default range to 0.25 to 2 so that 150px bar still has some precision
		var ratemin = tryParseFloat(GM_getValue('vlc-rate-min', "0.25"), 0.25);
		var ratemax = tryParseFloat(GM_getValue('vlc-rate-max', "2"), 2);
		this.sbRate.initSB('#sbRate', '#sbRate div.knob', 2, ratemin, ratemax, true,
			function(pos){this.bar.children.namedItem('vlcrate').innerHTML = pos.toFixed(3);});
		this.sbRate.setValue(1.0);
	}

	if(spacer)
		this.elements.controls.style.display = '';//reset

	this.myvlc.initVLC(vlcNode, this.sbPos, this.sbVol, this.sbRate);

	if(!this.isEmbed)
	{
		this.win.addEventListener('hashchange', this.onHashChange.bind(this), false);
		var fun = this.onWideClick.bind(this);
		[].forEach.call(document.querySelectorAll('#_wide'), function(btn) {
			btn.addEventListener('click', fun, false);
		});
	}

	this.playerEvents = new CustomEvent();
	this.moviePlayer.addEventListener = function(event, fun, bubble) {that.playerEvents.addListener(event, fun);};
	this.moviePlayer.removeEventListener = function(event, fun) {that.playerEvents.removeListener(event, fun);};

	this.SetupAPI();
	//Compatibility functions
	//console.log("unsafeWindow.__yt_www", unsafeWindow._yt_www.p);
	//this.player.watch.player = {};
	//unsafeWindow._yt_www.v('yt.www.watch.player', {});
	//unsafeWindow._yt_www.v('yt.www.watch.player.init', function(e){console.log("init called", arguments);});
	//str2obj(window, 'yt.www.watch').player = this.fakeApiNode;
};

ScriptInstance.prototype.SetupAPI = function()
{
	var that = this;
	//FIXME sometimes needs a reload
	this.fakeApiNode.getLastError = function(e){return "ok";};
	this.fakeApiNode.seekTo = function(e){that.myvlc._seekTo(e);};
	this.fakeApiNode.pauseVideo = function(){that.myvlc.pauseVideo();};
	this.fakeApiNode.playVideo = function(){that.myvlc.playVideo();};
	this.fakeApiNode.stopVideo = function(){if(!that.bmusicMode) that.myvlc.stopVideo();};
	this.fakeApiNode.getCurrentTime = function(){return that.myvlc.getCurrentTime();};
	this.fakeApiNode.getDuration = function(){return that.myvlc.getDuration();};
	this.fakeApiNode.getAvailableQualityLevels = function(){return that.myvlc.getAvailableQualityLevels();};
	this.fakeApiNode.getPlaybackQuality = function(){return that.myvlc.getPlaybackQuality();};
	this.fakeApiNode.setPlaybackQuality = function(e){that.myvlc.setPlaybackQuality(e);};
	this.fakeApiNode.getVolume = function(){return that.myvlc.getVolume();};
	this.fakeApiNode.setVolume = function(e){that.myvlc.setVolume(e);};
	this.fakeApiNode.isMuted = function(){return false;};
	this.fakeApiNode.isReady = function(){return !!that.myvlc.vlc && !!that.myvlc.vlc.input;};
	this.fakeApiNode.getCurrentVideoConfig = function(){return null;};
	this.fakeApiNode.getPlaybackRate = function(){return that.myvlc.vlc.input.rate;};
	this.fakeApiNode.setPlaybackRate = function(e){that.myvlc.vlc.input.rate = e;};
	this.fakeApiNode.isMuted = function(){return that.myvlc.vlc.audio.mute;};
	this.fakeApiNode.loadVideoByPlayerVars = function(vars){console.log("FakeAPI: loadVideoByPlayerVars, ignored.", vars);};
	this.fakeApiNode.setAutonavState = function(state){};
	this.fakeApiNode.getPlayerState = function(){
		if(!that.myvlc.input) return 0;
		switch(that.myvlc.input.state){
			case 0: case 7: return -1;//idle, error
			case 1: return 5;//opening
			case 2: return 3;//buffering
			case 3: return 1;//playing
			case 4: return 2;//paused
			case 5: case 6: return 0;//stopped, ended
		}
	};
	this.fakeApiNode.canPlayType = function(){
		//console.log("canPlayType", arguments);
		return true;
	};

	this.fakeApiNode.addEventListener = function(event, fun, bubble) {
		that.playerEvents.addListener(event, fun);
	};
	this.fakeApiNode.removeEventListener = function(event, fun) {
		that.playerEvents.removeListener(event, fun);
	};
	if(typeof onYouTubePlayerReady === "function")
		onYouTubePlayerReady(this.fakeApiNode);
};

ScriptInstance.prototype.exterminate = function()
{
	//blank flash div as soon as possible
	if(!this.isEmbed)
	{
		var p = this.$(gPlayerApiID) || this.$(gPlayerApiID+"-vlc") || this.$('p'); //Youtube page
		if(!p)
		{
			this.insertYTmessage("VLCTube: Didn't find '"+gPlayerApiID+"' div. Bummer.");
			return;
		}

		while(p.childNodes.length > 0) //use removeChild or HTML5 player keeps blasting in the background :/
			removeChildren(p.childNodes[0]);
	}
	else if(this.$('player1'))
	{
		var vp = this.$('player1'); //Flash/HTML5 embed iframe, html5 has 'html5-video-player' class
		vp.parentNode.removeChild(vp);
	}
	//else
	// something with 'cued-embed' class :S

	var videos = document.querySelectorAll('video');
	for(var i=0; i<videos.length; i++)
		removeChildren(videos[i]);

	this.hasSettled = 0;//reset count
};

//Ah, stupid, brute-force it /wtf
//FIXME sometimes needs a reload :/
ScriptInstance.prototype.hasSettled = 0;
ScriptInstance.prototype.overrideRef = function()
{
	if(this.isPopup) return;
	var that = this;
	try
	{
		if(this.yt.getConfig('PLAYER_REFERENCE') === this.fakeApiNode)
		{
			this.hasSettled++;
			if(this.hasSettled>10)
				return;
		}
		else
			this.hasSettled = 0;
		//this.yt.setConfig('PLAYER_REFERENCE', this.myvlc);
		//Less security errors, more useful 'no such property' errors?
		this.yt.setConfig('PLAYER_REFERENCE', this.fakeApiNode);
		this.yt.www.watch.player = this.fakeApiNode;
		this.yt.player.getPlayerByElement = function(id){
			//console.log('Hijacked getPlayerByElement', id);
			if(id == 'player-api')
				return that.fakeApiNode;
			else if(id == 'movie_player')
				return that.moviePlayer;
		};
		//TODO restore seekTo
		//this.yt.www.watch.player.seekTo = this.myvlc._seekTo;
		this.yt.www.watch.player.seekTo = function(t){
			that.myvlc._seekTo(t);
		};
	}catch(e){
		//console.log(e);
	}

	this.win.setTimeout(function(e){that.overrideRef();}, 1000);
};

// Remove old stuff and recreate (with new settings)
ScriptInstance.prototype.reloadPlayer = function()
{
	if(!this.isEmbed)
	{
		this.myvlc.clearUpdate();
		this.initVars();
		this.exterminate();
		this.onMainPage();
		this.restoreVolume();//eventPlaying should, but sometimes doesn't???
		this.overrideRef();
	}
};

var VLCinstance = new ScriptInstance(window);

function loadPlayer(oldNode, upsell)
{
	VLCinstance.init(false, oldNode, upsell);
	//win.addEventListener('DOMNodeInserted', function(e){inst.DOMevent_xhr(e);}, true);
}

function loadPlayerOnLoad(oldNode, upsell)
{
	window.addEventListener('load', function(e){
		loadPlayer(oldNode, upsell);
	}, false);
}

function GM_getValue(key, val)
{
	if(window.VLC.GMValues.hasOwnProperty(key) &&
		window.VLC.GMValues[key] !== undefined &&
			window.VLC.GMValues[key] !== null)
		return window.VLC.GMValues[key];
	return val;
}

function GM_setValue(key, val)
{
	//window.VLC.GM_setValue(key, val);
	//window.VLC.GMValues[key] = val;
	if(key in window.VLC.GMValues)
	{
		window.VLC.GMValues[key] = val;
		window.postMessage (JSON.stringify ({key: key, value: val}), window.location.origin);
	}
}

function GM_xmlhttpRequest(params)
{
	var xhr = new XMLHttpRequest();
	xhr.open(params.method, params.url, true);
	if(params.data)
		xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
	for(var h in params.headers)
		xhr.setRequestHeader(h, params.headers[h]);
	xhr.onreadystatechange = function () {
		if (xhr.readyState != 4) return;
		params.onload(xhr);
	};
	xhr.send(params.data);
	//VLC.myxmlhttpRequest(params);
}

	var oldNode, loader = loadPlayer,
		e = document.querySelector('#movie_player') ||
		document.querySelector('#player');

	if(
	   (/\/embed\//.test(window.location.pathname) /*&& e.id == 'player1'*/)//embedded
	   )
	{
		//console.log("Load player for embed. DOMEvent element: ", e.id, e);
	}
	else if(e.id == 'movie_player')
	{
		loader = yt.pubsub ? loadPlayer : loadPlayerOnLoad;
		player = document.querySelector('#player');
		if(player && player.classList.contains('off-screen')) {
			//console.log("load off-screen player", e);
			loader = loadPlayer;
		}
		removeChildren(e); //FIXME fallback player
	}

	loader(oldNode);
	return VLCinstance;
}; /// var VLCTube = ...

function injectScript(src)
{
	var head = document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0];
	if (!head) 
	{
		setTimeout(injectScript.bind(this, src), 100);
		return; 
	}
	var script = document.createElement('script');
	script.type = 'text/javascript';
	script.appendChild(document.createTextNode(src));
	head.appendChild(script);
}

//Parse html5 player js (ytplayer.config.assets.js) and feed it to Decode
//sig.length == 81 special case?
function GetDecodeParamv1(str)
{
	var arr = [], m;
	if((m = str.match(/\.signature=([$\w]+)\(/)))
	{
		var rFuncCode = new RegExp('function ' + (m[1][0] == '$' ? '\\' : '') + m[1]+'\\((\\w+)\\){(.*?)}');
		m = rFuncCode.exec(str);
		if(!m) return null;

		funcParam = m[1];
		funcCodeLines = m[2].split(';');

		rSwap1 = new RegExp(funcParam+'=\\w+\\('+funcParam+',(\\d+)');
		rSwap2 = new RegExp('=\\w+\\[(\\d+)\\%\\w+\\.length\\]');
		rSlice = new RegExp(funcParam+'\\.slice\\((\\d+)');
		rReverse = new RegExp(funcParam+'\\.reverse');

		for(var i=0;i<funcCodeLines.length;i++)
		{
			if((m = rSwap1.exec(funcCodeLines[i])))
				arr.push(parseInt(m[1]));
			else if((m = rSwap2.exec(funcCodeLines[i])))
				arr.push(parseInt(m[1]));
			else if((m = rSlice.exec(funcCodeLines[i])))
				arr.push(-parseInt(m[1]));
			else if(rReverse.test(funcCodeLines[i]))
				arr.push(0);
		}
	}
	return arr.length ? arr : null;
}

function GetDecodeParam(str)
{
	var arr = [], m;

	//Code crimes /watch?v=8Gv0H-vPoD
	m = str.match(/(\w+):function\(\w+,\w+\){var\s+c=.*?length/);
	var fReplace = m[1];

	m = str.match(/(\w+):function\(\w+\){.*?reverse/);
	var fReverse = m[1];

	m = str.match(/(\w+):function\(\w+,\w+\){\w\.splice/);
	var fSlice = m[1];

	if((m = str.match(/"signature",\s*([$\w]+)\(/)))
	{
		var rFuncCode = new RegExp('(?:function\s)?' + (m[1][0] == '$' ? '\\' : '') + m[1]+'(?:=function)?\\((\\w+)\\){([^]+?split[^]+?)}');
		m = rFuncCode.exec(str);
		if(!m) return null;

		var funcParam = m[1];
		var funcCodeLines = m[2].split(';');

		var rSwap = new RegExp('\\w+\\.'+fReplace+'\\('+funcParam+',(\\d+)');
		var rSlice = new RegExp('\\w+\\.'+fSlice+'\\('+funcParam+',(\\d+)');
		var rReverse = new RegExp('\\w+\\.'+fReverse+'\\('+funcParam);

		for(var i=0;i<funcCodeLines.length;i++)
		{
			if((m = rSwap.exec(funcCodeLines[i])))
				arr.push(parseInt(m[1]));
			else if((m = rSlice.exec(funcCodeLines[i])))
				arr.push(-parseInt(m[1]));
			else if(rReverse.test(funcCodeLines[i]))
				arr.push(0);
		}
	}
	return arr.length ? arr : null;
}

function str2obj(obj, a) {
	var c = a.split('.'), d = obj;
	for (var e; c.length && (e = c.shift()); )
		if(d[e]) d = d[e]; else return null;
	return d;
}

function loadDefaults()
{
	// Wasn't unsafeWindow supposed to be pretty much window.wrappedJSObject?
	var win = window.wrappedJSObject;
	///User configurable values
	var obj = {};

	//TODO error if [Object] got saved with GM_setValue
	//clone it here and use try..catch later
	if(typeof(cloneInto) === 'function')
		obj = cloneInto(obj, unsafeWindow);

	var varNames = [
		'badaptiveFmts', 'badd3DFormats', 'balwaysBestFormat',
		'bautoSubEnable', 'bautoplay', 'bautoplayPL', 'bautoplayYT', 'bbtnIcons',
		'bcompactVolume', 'bconfigDropdown', 'bcustomWide', 'bdarkTheme',
		'bdiscardFLVs', 'bembedControls', 'bforceLoadEmbed', 'bforceWS',
		'bforceWide', 'bforceWidePL', 'bjumpTS', 'bpopupAutoplay',
		'bpopupSeparate', 'bresumePlay', 'bscrollToPlayer', 'bshowMute',
		'bshowRate', 'bshowRatePreset', 'bshowWLOnMain', 'buseFallbackHost',
		'buseHoverControls', 'busePopups', 'buseRepeat', 'buseThumbnail',
		'buseWidePosBar', 'bmusicMode', 'bignoreSidebar',
		'vlc-formats', 'vlc-lang', 'vlc-pl-autonext', 'vlc-rate-preset', 'vlc-rate-max',
		'vlc-rate-min', 'vlc-volume-max', 'vlc-wide', 'vlc-wide-width',
		'vlc-cache', 'vlc_vol', 'ytquality', 'vlc-subs-align', 'vlc-subs-color'];

	varNames.forEach(function(key)
	{
		try {
			//TODO error if [Object] got saved with GM_setValue
			var v = GM_getValue(key, undefined);
			obj[key] = (v !== undefined ? v : null);
		} catch(e){
			console.log(e);
		}
	});

	//var unsafeObj = createObjectIn(unsafeWindow, {defineAs: "VLC"});
	//unsafeObj.GMValues = obj;
	injectScript('VLC = {}; VLC.GMValues =' + JSON.stringify(obj));

	///Get signature decipherer from html5 player
	var js = str2obj(win, "ytplayer.config.assets.js") ||
			str2obj(unsafeWindow, "ytplayer.config.assets.js") ||
			str2obj(win, "yt.config_.PLAYER_CONFIG.assets.js") ||
			str2obj(unsafeWindow, "yt.config_.PLAYER_CONFIG.assets.js");
	if(js)
	{
		var url = window.location.protocol + js;
		GM_xmlhttpRequest({
			method: 'GET',
			url: url,
			onload: function(r){
				if(r.status == 200)
				{
					var sigDecodeParam = GetDecodeParam(r.responseText);
					injectScript("\
					function GetDecodeParam(){return " + (sigDecodeParam ? "[" + sigDecodeParam.toString() + "]" : 'null') +";}\
					if (VLCinstance){VLCinstance.initialAddToPlaylist();}");
				} else
					console.log("VLCTube: failed to retrieve decipherer.");
			}
		});
	}

	var parseLive = function()
	{
		if((hlsvp = str2obj(win, "ytplayer.config.args.hlsvp")))
		{
			GM_xmlhttpRequest({
				method: 'GET',
				url: hlsvp,
				onload: function(r)
				{
					if(r.status == 200)
						win.VLCinstance.parseLive(r.responseText);
				}
			});
		}
	};
	parseLive();

	function SaveGMValues()
	{
		var values = win.VLC.GMValues;
		varNames.forEach(function(key)
		{
			if(values[key] !== undefined)
				GM_setValue(key, values[key]);
		});
	}
	// Don't save if embedded video or it overwrites changes made on 'watch' page.
	//if(!/\/embed\//.test(window.location.href))
	//	window.addEventListener('beforeunload', SaveGMValues, false);

	function getMessage (event)
	{
		if(!/youtube\./.test(event.origin) || event.data === "")
			return;
		var msg = JSON.parse (event.data);
		if (msg.key === 'spf_method' && msg.value === 'navigate')
		{
			parseLive();
		}
		else if(varNames.find(function(a){ return msg.key === a; }))
			GM_setValue(msg.key, msg.value);
	}
	window.addEventListener ("message", getMessage, false);
}

//Recursively remove node and node's children
function removeChildren(node, keepThis)
{
	if(node === undefined || node === null)
	{
		return;
	}

	while (node.hasChildNodes())
	{
		removeChildren(node.firstChild, false);
	}

	//silence html5 element
	if (node.tagName === "VIDEO")
	{
		node.pause();
		node.play = function(){console.log('video.play()');}
		node.src = "";
		node.load();
	}

	if(!keepThis) node.parentNode.removeChild(node);
}

// Nuclear option
var noVideoElement = function()
{
	// Nuclear option
	// YT's HTML5 player code uses MutationObserver and observe() on <video/>
	// so use <div/> instead plain [object]
	var fakeVideo = document.createElement('DIV');
	var fakeVideoParent = document.createElement('DIV');
	fakeVideoParent.appendChild(fakeVideo); //just in case as html5 player logic checks for parent node
	fakeVideo.load = function(){};
	fakeVideo.play = function(){};

	var _createElement = document.createElement.bind(document);
	var localCreateElement = function(tag){
		if(tag === 'video' && !/\/html5/.test(window.location.href))
		{
			//console.log("Hijacked createElement:", tag);
			// Return a 'fake' element or see if overriding play() is enough.
			//return fakeVideo;

			var el = _createElement(tag);
			el.play = function(){ console.log("Attempted to call play() on hijacked <video/>"); };
			return el;
		}
		return _createElement(tag);
	};

	document.createElement = localCreateElement;
};

var domObserver;
function DOMevent(mutations)
{
	for(var k=0; k < mutations.length; k++)
	{
		var mutation = mutations[k];
		//console.log(mutation.type, mutation.target.id);
		if(mutation.target.id == "player-api" || mutation.target.id == "player"
		)
		{
			for(var i=0; i < mutation.target.childNodes.length; i++)
			{
				var e = mutation.target.childNodes[i];
				//console.log("    child:", e.id, mutation.target.id);

				if((/\/embed\//.test(window.location.pathname)/* && e.id == 'player1'*/) ||
					(e.id == 'movie_player')
					//|| unsafeWindow.yt.pubsub
				)
				{
					//if(e.id == 'movie_player' && !unsafeWindow.yt.pubsub)
					//	continue;
					domObserver.disconnect();
					removeChildren(e);
					loadDefaults();
					injectScript("var VLCinstance = " +VLCTube.toString() + "();");
					return;
				}
			}
		}
	}
}

var excludedSites = [/www\.wimp\.com/];

if(/origin=/.test(window.location.href))
{
	for(var i in excludedSites)
		if(excludedSites[i].test(window.location.href))
			return;
}

if((!/\/embed\//.test(window.location.pathname) && window.top !== window.self) ||
	/controls=0/.test(window.location.href))
	return;

//if(/\/user\//.test(window.location))
//	loadPlayerOnLoad(window, null, true);

//document-start
injectScript("("+noVideoElement.toString() + ")();");
domObserver = new MutationObserver(DOMevent);
domObserver.observe(document, {subtree:true, childList:true});

//document-end
//loadPlayer(window, null, false);

})();
