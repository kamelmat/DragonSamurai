import { gameConfig } from './config/gameConfig.js';

console.log('Starting game initialization');

// Create game instance
new Phaser.Game(gameConfig);
console.log('Game instance created');

// Add global error handler
window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('Error: ' + msg + '\nURL: ' + url + '\nLine: ' + lineNo + '\nColumn: ' + columnNo + '\nError object: ' + JSON.stringify(error));
    return false;
}; 