/**
 * This example illustrates the basics of creating a Bogey visualization.
 *
 * We'll be sending balls of random colors across the screen, one for each request in the server log.
 *
 * When creating a visualization, you may find it helpful to enable demo mode, which generates a stream of random
 * request data.
 */

var fs = require('fs');
var $ = require('jquery');
var _ = require('underscore');

var thumbnail = fs.readFileSync(__dirname + '/thumbnail.png', 'base64');

module.exports = {
    bogey: {
        // The name of the visualization.
        name: 'Example',

        // URL to a thumbnail image to display on the home screen.
        thumbnail: 'data:image/png;base64,' + thumbnail,

        run: function (bogey) {
            // Define some settings.
            var BALL_RADIUS = 3;
            var MIN_BALL_SPEED = 300;
            var MAX_BALL_SPEED = 500;
            var COLORS = [
                'Orange', 'AntiqueWhite ', 'Aqua', 'Coral', 'Pink', 'GoldenRod', 'Khaki', 'LightSlateGray',
                'MediumSeaGreen', 'Olive'
            ];

            var balls = [];
            var showFps = true;
            var showRpms = true;

            // Set Bogey's message color to white.
            bogey.setMessageColor('white');

            // Get the container element from Bogey.
            var $container = $(bogey.container);

            // Create a canvas element and insert it into the container.
            var $canvas = $('<canvas></canvas>');
            $container.append($canvas);

            // Resize the canvas to fill the screen.
            var canvas = $canvas.get(0);
            canvas.height = $container.height();
            canvas.width = $container.width();

            // Get the 2d context from the canvas.
            var ctx = canvas.getContext('2d');

            // The request event is triggered whenever a log line is parsed by the server.
            bogey.on('request', function (data) {
                // For simplicity, we'll ignore the data object and just assign a random color and starting position to
                // our ball.
                var randomColor = _.sample(COLORS);
                var randomY     = _.random(BALL_RADIUS * 2, canvas.height - (BALL_RADIUS * 2));
                var speed       = _.random(MIN_BALL_SPEED, MAX_BALL_SPEED);

                // Push this new ball to the array of all balls.
                balls.push({
                    color: randomColor,
                    speed: speed,
                    y: randomY,
                    x: 0
                });
            });

            // The frame event is triggered for each frame (using requestAnimationFrame), which tries for 60fps.
            bogey.on('frame', function (event) {
                // Clear the canvas.
                ctx.fillStyle = 'black';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Loop over the array of balls.
                for (var i = 0; i < balls.length; i++) {
                    // Reference to the object.
                    var ball = balls[i];

                    // Calculate the distance the ball should move this frame. b.speed is the distance the ball should travel
                    // per second, and delta is the number of seconds since the last frame.
                    var dist = ball.speed * event.delta;

                    // Update the position of the ball.
                    ball.x += dist;

                    // Set the ball color.
                    ctx.fillStyle = ball.color;

                    // Draw the ball on the canvas.
                    ctx.beginPath();
                    ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2, true);
                    ctx.closePath();
                    ctx.fill();
                }

                // Every 20 frames, check for balls that are out of bounds and remove them.
                if (event.count % 20 === 0) {
                    balls = balls.filter(function (ball) {
                        return ball.x < canvas.width + BALL_RADIUS;
                    });
                }

                // Display the number of active balls in the lower left corner.
                ctx.font = "12px Arial";
                ctx.fillStyle = 'white';
                ctx.fillText(balls.length + ' balls', 15, canvas.height - 15);

                // Also display frames per second and requests per minute.
                if (showFps) {
                    ctx.fillText(bogey.fps + ' fps', 90, canvas.height - 15);
                }

                if (showRpms) {
                    ctx.fillText(bogey.rpms + ' rpms', 140, canvas.height - 15);
                }
            });

            // Register the F key to toggle the display of frames per second.
            bogey.registerKey('f', 'Toggle display of FPS', function () {
                showFps = !showFps;
            }, this);

            // Register the R key to toggle the display of requests per minute.
            bogey.registerKey('r', 'Toggle display of RPMs', function () {
                showRpms = !showRpms;
            }, this);
        }
    }
};
