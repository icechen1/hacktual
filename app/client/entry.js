import io from 'socket.io-client';
import Typer from './Typer.js';

require('./scss/style.scss');
require('./scss/crt_style.css');

var MAX_KEY_SPEED = 40;
var MAX_KEY_UNIQUENESS = 40;

var UNIQUENESS_SCORE_WEIGHT = 0.5;
var SPEED_SCORE_WEIGHT = 0.5;

var SLIDER_INACTIVE = "=";
var SLIDER_ACTIVE = "||";
var SLIDER_WIDTH = 130;

var socket = io();
socket.on('connect', function () {
  socket.emit('joinRoom', {
    username: 'glados',
    room: roomID,
  });
  socket.on('newAverage', function(msg){
  	var newAverage = msg.value / 100;
  	var preActive = SLIDER_WIDTH * newAverage;
  	var postActive = SLIDER_WIDTH - preActive - SLIDER_ACTIVE.length;

  	var sliderString = "";
  	for (var i = 0 ; i < preActive ; i++) {
  		sliderString = sliderString + SLIDER_INACTIVE;
  	}
  	sliderString = sliderString + SLIDER_ACTIVE;

  	for (var i = 0 ; i < postActive ; i++) {
  		sliderString = sliderString + SLIDER_INACTIVE;
  	}

  	$("#header").html(sliderString);
    console.log(msg);
  });
});

var _this = this;

var mKeyPresses = [];
var typer = new Typer($("#console"), function(keyCode) {
	mKeyPresses.push(keyCode);
});

setInterval(function() {
	var uniqueCount = mKeyPresses.length == 0 ? 0 : 1; // measure of uniqueness
	var current = mKeyPresses[0];	
	mKeyPresses.sort();
	var i = 0;
	for (; i < mKeyPresses.length ; i++) {
		if (mKeyPresses[i] != current) {
			current = mKeyPresses[i];
			uniqueCount ++;
		}
	}
	var speed = mKeyPresses.length;
	// send keys/second
	speed = speed > MAX_KEY_SPEED ? MAX_KEY_SPEED : speed;
	uniqueCount = uniqueCount > MAX_KEY_UNIQUENESS ? MAX_KEY_UNIQUENESS : uniqueCount; 

	var score = 100 * UNIQUENESS_SCORE_WEIGHT * uniqueCount/MAX_KEY_UNIQUENESS + 
				100 * SPEED_SCORE_WEIGHT * speed/MAX_KEY_SPEED;
	//console.log(score);
	socket.emit('sendScore', {
		rate: score
	})
	mKeyPresses = [];
}, 1000); // inizialize timer for sending key press factor over socket