var config = {};

/* Dash */
config.dash = {};
config.dash.mac = "";
config.dash.interface = "";

/* Twitter */
config.twitter = {};
config.twitter.consumer_key = "";
config.twitter.consumer_secret = "";
config.twitter.access_token = "";
config.twitter.access_token_secret = "";

/* Camera */
config.camera = {};
config.camera.location = "/home/pi/photos";
config.camera.file_count = 1000;

/* Audio */
config.audio = {};
config.audio.file = "../doorbell.wav";

/* ITTT */
config.ittt = {};
config.ittt.triggers = [
	/* { trigger: "" , key: "" } */
	];

module.exports = config;

