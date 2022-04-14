chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete' && tab.url) {
        chrome.scripting.executeScript(tabId, {file: './inject_script.js'}, function () {
            chrome.scripting.executeScript(tabId, {file: './foreground.bundle.js'}, function () {
                console.log('INJECTED AND EXECUTED');
            });
        });
    }
});

//Listen when the browser is opened
chrome.windows.onCreated.addListener(function () {
    //Getting data
    chrome.storage.local.get("updateDateCookies", async function (result) {

        //Time after which unused cookies are deleted
        //To be set in settings
        let max_diff = 1000 * 60 * 60 * 24 * 7 * 2; //2 weeks

        //data fetched
        if (result && result["updateDateCookies"])
            result = result["updateDateCookies"];
        else
            result = {};

        let value = {};

        let date_now = Date.now().toString();

        //Getting all the cookies
        await chrome.cookies.getAll({}).then(cookies => {
            let key;
            cookies.forEach(cookie => {
                key = "domain" + cookie.domain + "name" + cookie.name;

                //If we don't have a date in the storage for the cookie we add it
                if (!result[key]) {
                    value[key] = date_now;
                }
                //We check if the cookie hasn't been used for too long
                else if (result[key] && date_now - result[key] > max_diff) {
                    //Delete cookie
                    chrome.cookies.remove({
                        "name": cookie.name,
                        "storeId": cookie.storeId,
                        "url": "https://" + cookie.domain + cookie.path
                    }, function () {
                        delete result[key]
                        if (chrome.runtime.lastError) {
                            console.log("Runtime error.");
                        }
                    });
                }
                //If lower than max_diff
                else {
                    value[key] = result[key];
                }
            })
        }).catch(err => console.log(err));

        //We put the now upodated cookies' date in the storage
        await chrome.storage.local.set({"updateDateCookies": value}).then(() => {
            if (chrome.runtime.error) {
                console.log("Runtime error.");
            }
        }).catch(err => console.log(err));
    });
});

//To update the last time a cookie was used
//Listen to new tabs
chrome.tabs.onActivated.addListener(setInfos);
//Listener to updated tabs (when the url is modifies for instance)
chrome.tabs.onUpdated.addListener(setInfos);


function setInfos() {

    //Query the active tab
    let queryOptions = {active: true, currentWindow: true};
    chrome.tabs.query(queryOptions, function (tabs) {
        if (tabs.length > 0 && tabs[0].url !== "") {

            //Getting all the cookie whose url matches the active tab
            chrome.cookies.getAll({"url": tabs[0].url}, function (cookies) {

                //Getting stored cookies' dates
                chrome.storage.local.get("updateDateCookies", function (result) {
                    let value;
                    // Getting them only if they exist
                    if (result && result["updateDateCookies"])
                        value = result["updateDateCookies"];
                    else
                        value = {};

                    //Updating cookies' dates
                    let date_now = Date.now().toString()
                    let key;
                    cookies.forEach(cookie => {
                        key = "domain" + cookie.domain + "name" + cookie.name;
                        value[key] = date_now;
                    });
                    //Putting the new date into the local storage
                    chrome.storage.local.set({"updateDateCookies": value}, function () {
                        if (chrome.runtime.error) {
                            console.log("Runtime error.");
                        }
                    });
                });
            });
        }
    });
}
