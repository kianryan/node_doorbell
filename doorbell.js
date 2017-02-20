var config = require('./config');
const path = require('path');

var dash_button = require('node-dash-button');
var dash = dash_button(config.dash.mac, config.dash.interface, 1000, 'all');

var RaspiCam = require("raspicam");
var camera = new RaspiCam({
	mode: "photo",
	output: path.join(config.camera.location, "camera-bin.jpg"),
	width: 2592,
	height: 1944,
	quality: 70,
	drc: 'high'
});

var Twit = require("twit");
var T = new Twit({
	consumer_key: config.twitter.consumer_key,
	consumer_secret: config.twitter.consumer_secret,
	access_token: config.twitter.access_token,
	access_token_secret: config.twitter.access_token_secret
});

var request = require('request');
var base64 = require('node-base64-image');
var Sound = require('node-aplay');

console.log("Listening...");

dash.on("detected", function() {
	console.log("Button press detected.");

	/* Make noise */
	new Sound(config.audio.file).play();

	camera.set("output", path.join(config.camera.location, "camera-" + Date.now() + ".jpg"));
	camera.start();

	/* Send maker notification immediately*/
	config.ittt.triggers.forEach(function (trigger) {
		request.post("https://maker.ifttt.com/trigger/" + trigger.trigger + "/with/key/" + trigger.key,
				function() {
					console.log("ITTT triggered: " + trigger.trigger);
				});
	});
});

camera.on("read", function(err, timestamp, filename) {

	if (/~$/.exec(filename)) {
		console.log("Temp file: " + filename);
		return;
	}

	console.log("Attempt to read filename: " + filename);

	base64.encode(path.join(config.camera.location, filename), {
		string: true,
		local: true
	}, function(err, b64content) {

		if (err) {
			console.log("Error when encoding media: " + err);
			return;
		}

		console.log("Uploading media...");
		T.post('media/upload', { media_data: b64content }, function (err, data, response) {

			if (err) {
				console.log("Error when uploading media: " + err);
				return;
			} else {
				var mediaIdStr = data.media_id_string;
				var datestamp = new Date().toString();

				// now we can reference the media and post a tweet (media will attach to the tweet)
				var params = { status: 'Someone pressed the doorbell at ' + datestamp + '.',
					media_ids: [mediaIdStr] };

				console.log("... media uploaded, posting message ...");

				T.post('statuses/update', params, function (err, data, response) {
					console.log("... status updated");
				});
			}
		});
	});
});
