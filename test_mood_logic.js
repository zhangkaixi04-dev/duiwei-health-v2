
const { storageService } = require('./src/services/storageService');

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

global.localStorage = localStorageMock;
global.window = { dispatchEvent: () => {} };
global.Event = class Event {};

// Test Mood Logging
const today = '2024-03-09';
console.log('--- Testing Mood Log ---');

// 1. Initial State
let logs = storageService.getDailyLogs(today);
console.log('Initial logs:', logs.mood ? logs.mood.length : 'undefined');

// 2. Save First Mood
storageService.saveDailyLog(today, 'mood', { value: 'happy' });
logs = storageService.getDailyLogs(today);
console.log('After 1st save:', logs.mood.length, logs.mood[0].value);

// 3. Save Second Mood
storageService.saveDailyLog(today, 'mood', { value: 'sad' });
logs = storageService.getDailyLogs(today);
console.log('After 2nd save:', logs.mood.length, logs.mood[1].value);

// 4. Verify Array Structure
if (logs.mood.length === 2 && logs.mood[0].value === 'happy' && logs.mood[1].value === 'sad') {
    console.log('SUCCESS: Multiple mood records supported.');
} else {
    console.log('FAILURE: Mood records overwritten or not saved.');
}
