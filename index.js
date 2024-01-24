const { Tado } = require("node-tado-client");

var tado = new Tado();

tado.login(process.argv[2], process.argv[3])
.then(() => {
  tado.getMe()
  .then(async (resp) => {
    var anyOffline = false;
    var aOffline = "";
    for(var home of resp["homes"]) {
      try {
        var devices = await tado.getDevices(home["id"]);
        for(var device of devices) {
          if (!device["connectionState"] || !device["connectionState"]["value"]) {
            anyOffline = true;
            aOffline.push(device["deviceType"] + " " + device["serialNo"]);
          }
        }
      } catch(e) {
        console.log("Critical: getDevices failed for homeId " + home["id"])
        process.exit(2);
      }
    }
    if (anyOffline) {
      console.log("Critical: " + aOffline.join(", "))
      process.exit(2);
    }
    console.log("OK: All online")
    process.exit(0);
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

