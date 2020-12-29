// Log 1
console.log('This is a Console Log message')

// Push Notifications
/**
 * Check if notifications are supported
 * 1. If yes ask user to allow notifications
 * 2. If yes and user declines notifications show web app alerts in dialogs
 * 2. If no show standard web app alerts in dialogs
 */
function isPushNotificationSupported() {
  return "serviceWorker" in navigator && "PushManager" in window;
}

/**
 * asks user consent to receive push notifications and returns the response of the user, one of granted, default, denied
 */
function initializePushNotifications() {
  // request user grant to show notification
  return Notification.requestPermission(function(result) {
    return result;
  });
}

// Battery
// Checking the battery level and status
/**
 * Using the battery API function to test for better
 * resource that would help sustain more battery or save if
 * the user was working on a task
 */

let isBatterySupported = 'getBattery' in navigator;

if(!isBatterySupported) {
  console.log("Battery not supported");
}

if (isBatterySupported) {
  window.onload = function () {
    function updateBatteryStatus(battery) {
      document.querySelector('#charging').textContent = battery.charging ? 'charging' : 'not charging';
      document.querySelector('#level').textContent = battery.level;
      document.querySelector('#dischargingTime').textContent = battery.dischargingTime / 60;
    };

    let batteryPromise = navigator.getBattery();
        batteryPromise.then(batteryCallback);

    function batteryCallback(batteryObject) {
      printBatteryStatus(batteryObject);
      batteryObject.addEventListener('chargingchange', function(ev) {
        printBatteryStatus(batteryObject);
      });
      batteryObject.addEventListener('levelchange', function(ev) {
        printBatteryStatus(batteryObject);
      });
    };

    function printBatteryStatus(batteryObject) {
      console.log("IsCharging", batteryObject.charging);
      console.log("Percentage", batteryObject.level);
      console.log("charging Time", batteryObject.chargingTime);
      console.log("DisCharging Time", batteryObject.dischargingTime);
    };

    navigator.getBattery().then(function(battery) {
      // Update the battery status initially when the promise resolves ...
      updateBatteryStatus(battery);

      // .. and for any subsequent updates.
      battery.onchargingchange = function () {
        updateBatteryStatus(battery);
      };

      battery.onlevelchange = function () {
        updateBatteryStatus(battery);
      };

      battery.ondischargingtimechange = function () {
        updateBatteryStatus(battery);
      };
    });
  };
};

// Network Connection and Speed
/**
 * Use the Network Connection to determine essential
 * CSS and JS for users connection.
 */
if (navigator.connection) {
  console.log(navigator.connection.type);
  console.log(navigator.connection.effectiveType);
  console.log(navigator.connection.rtt);
  console.log(navigator.connection.downlink);
  console.log(navigator.connection.downlinkMax);
}
/**
 * ! Important: Not ready for prime time.
if (navigator.connection.saveData === false) {
  console.log(navigator.connection.saveData);
}
*/

if (!navigator.connection) {
  console.log('Network Information Not Available.')
}
// var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

// function updateConnectionStatus() {
//   console.log("Connection type changed from " + type + " to " + connection.effectiveType);
//   type = connection.effectiveType;
// }

// connection.addEventListener('change', updateConnectionStatus);

// Preloading Videos if connection is faster than 2g
// let preloadVideo = true;
// if (connection) {
//   if (connection.effectiveType === 'slow-2g') {
//     preloadVideo = false;
//   }
// }

