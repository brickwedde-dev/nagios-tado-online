const { Tado } = require("node-tado-client");

var tado = new Tado();

tado.login(process.argv[2], process.argv[3])
.then(() => {
  tado.getMe()
  .then(async (resp) => {
    var anyOffline = true;
    for(var home of resp["homes"]) {
      try {
        var devices = await tado.getDevices(home["id"]);
        for(var device of devices) {
          if (device["serialNo"] == process.argv[4]) {
            if (device["batteryState"] != "NORMAL") {
              console.log("Warning: battery " + process.argv[4])
              process.exit(1);
            }
            if (device["connectionState"]) {
              if (device["connectionState"]["value"]) {
                console.log("OK: online")
                process.exit(0);
              } else if (new Date().getTime() - new Date(device["connectionState"]["timestamp"]).getTime() < 3600000) {
                console.log("OK: online " + (new Date().getTime() - new Date(device["connectionState"]["timestamp"]).getTime()) + " ago")
                process.exit(0);
              }
            }
          }
        }
      } catch(e) {
        console.log("Critical: getDevices failed for homeId " + home["id"], e)
        process.exit(2);
      }
    }
    console.log("Critical: " + process.argv[4])
    process.exit(2);
  })
  .catch((e) => {
    console.log("Critical: getMe failed")
    process.exit(2);
  })
})
.catch((e) => {
  console.log("Critical: Login failed")
  process.exit(2);
})

