var Cylon = require('cylon');
// import * as Cylon from "cylon";

Cylon.robot({
  connections: {
    leapmotion: { adaptor: 'leapmotion' }
  },

  devices: {
    leapmotion: { driver: 'leapmotion' }
  },

  work: function(my) {
    my.leapmotion.on("frame", function(frame) {
      if (frame.hands.length > 0) {
        const palmNormal = frame.hands[0].palmNormal;
        const palmNormalY = palmNormal[1];
        let palmFacing;

        switch(true){
          case (palmNormalY > 0.6) :
            palmFacing = "Palm Facing Up";
            break;
          case (palmNormalY < -0.6) :
            palmFacing = "Palm Facing Down";
            break;
          default:
            palmFacing = "Palm Sideways";
            break;
        };

        console.log(frame.hands[0]);
        console.log(`
        Grab Strength: ${frame.hands[0].grabStrength}
        Palm Normal Y: ${palmNormalY}
        Palm Facing: ${palmFacing}
        `)
      } else {
        console.log("No Hand Detected");
      };
    });
  }
}).start();