//This class implements all methods to analyse trackers whithin a web page

const fingerprinterScript = () => {
  /**
   * Returns the number of times strings in an array are present in a text
   */
  const findElementFromArrayInText = (array, text) => {
      var nbAppearance = 0;
      array.forEach((element) => {
          if(text.includes(element)){
              nbAppearance ++;
          }
      });
      return nbAppearance;
  }
  
  //This class implements all methods to analyse trackers whithin a web page
  const scripts = document.scripts;
  console.log("Nb of scripts: " + scripts.length);

  // Access to navigator properties
  var navigatorProperties = ["appCodeName", "appName", "appVersion",
  "buildID", "cookieEnabled", "doNotTrack",
  "geolocation", "language", "languages",
  "onLine", "oscpu", "platform", "product",
  "productSub", "userAgent", "vendorSub",
  "vendor", "javaEnabled", "permissions",
  "mediaDevices", "webdriver", "hardwareConcurrency",
  "maxTouchPoints", "activeVRDisplays"];

  // Access to Navigator methods
  var navigatorPropertiesToInstrument = ["vibrate", "sendBeacon", "getGamepads"];

  // Access to plugins
  var pluginProperties = ["name", "filename", "description", "version", "length"];

  // Access to MIMETypes
  var mimeTypeProperties = ["description", "suffixes", "type"];

  // Access to Audio API
  var audioProperties = ["AudioContext", "OfflineAudioContext", "OscillatorNode", "AnalyserNode", "GainNode", "ScriptProcessorNode"];

  let navigatorPropertiesCount = 0;
  let navigatorPropertiesToInstrumentCount = 0; 
  let pluginPropertiesCount = 0;
  let mimeTypePropertiesCount = 0;
  let audioPropertiesCount = 0;

  for (let i = 0; i < scripts.length; i++) {
      if (scripts[i].src) {
          externalSourceLink = scripts[i].src;
          console.log(externalSourceLink);

      }
      const scriptContent = scripts[i].text;

      navigatorPropertiesCount += findElementFromArrayInText(navigatorProperties, scriptContent);
      navigatorPropertiesToInstrumentCount += findElementFromArrayInText(navigatorPropertiesToInstrument, scriptContent);
      pluginPropertiesCount += findElementFromArrayInText(pluginProperties, scriptContent);
      mimeTypePropertiesCount += findElementFromArrayInText(mimeTypeProperties, scriptContent);
      audioPropertiesCount += findElementFromArrayInText(audioProperties, scriptContent);
  }
  console.log("navigatorPropertiesCount: " + navigatorPropertiesCount);
  console.log("navigatorPropertiesToInstrumentCount: " + navigatorPropertiesToInstrumentCount);
  console.log("pluginPropertiesCount: " + pluginPropertiesCount);
  console.log("mimeTypePropertiesCount: " + mimeTypePropertiesCount);
  console.log("audioPropertiesCount: " + audioPropertiesCount);
  var total = (navigatorPropertiesCount+navigatorPropertiesToInstrumentCount+pluginPropertiesCount+mimeTypePropertiesCount+audioPropertiesCount);
  console.log("Total = " + total);

  let port = chrome.runtime.connect({ name: "fingerprinter" });
  port.postMessage({ nb: total });
  /*
  port.onMessage.addListener(function (msg) {
      console.log("[EXTENSIONS] Response: " + msg.answer);
  });
  */
}