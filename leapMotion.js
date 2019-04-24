var Cylon = require('cylon');

let lastFrameVector = null;
const fullTurnDegrees = 360;

let hotValveOpenAmount = 0;
let coldValveOpenAmount = 0;

Cylon.robot({
  name: "Leap Motion",
    connections: {
        leapmotion: { adaptor: 'leapmotion' }
    },
    devices: {
        leapmotion: { driver: 'leapmotion' }
    },
    work: function () {
      this.leapmotion.on("hand", function (data) {
        // INFO FOR VECTORS, from the perspective of the user
        //X+ is Right
        //X- is Left
        //Y+ is Up
        //Y- is Down
        //Z+ is Backwards
        //Z- is Forwards
        // console.log(data.frame.hands);
        if (data.frame.hands.length = 1) {
          const hand = data.frame.hands[0],
          palmPosition = hand.palmPosition, // Center Position of the palm in mm from the Leap Motion origin
          direction = hand.direction, // Unit direction vector pointing from the palm position toward the fingers
          palmVelocity = hand.palmVelocity, // Rate of change of the palm position in mm/sec
          palmNormal = hand.palmNormal, // Normal Vector of the palm
          fingers = hand.fingers, // Array containing Finger Objects arranged from 0(thumb) to 4(pinky)
          grabStrength = hand.grabStrength, // Value representing Grab Strength, 0 -> 1
          pinchStrength = hand.pinchStrength, // Value representing Pinch Strength, 0 -> 1
          palmX = hand.palmX, // X portion of palmPosition
          palmY = hand.palmY, // Y portion of palmPosition
          palmZ = hand.palmZ; // Z portion of palmPosition
      
      
          if (this.robot.isGrabbing(grabStrength)){
            if (lastFrameVector === null) {
              lastFrameVector = direction;
            } else {
              const handDomain = this.robot.getHandSide(palmPosition[0]);
              const rotationAmountDegrees = this.robot.getRotation(lastFrameVector, direction);

              // Update the Hot and Cold tap Openess values
              this.robot.tapOpenClose(handDomain, rotationAmountDegrees);
              
              console.log(`
                The Hot tap is open ${Math.ceil(hotValveOpenAmount)}%
                The Cold tap is open ${Math.ceil(coldValveOpenAmount)}%
              `);
              lastFrameVector = direction;
            };

            // console.log(this.robot.getRotation(direction));
            // console.log(`
            // Start Vector: <X${startVector[0]}, Z${startVector[2]}>
            // Currect Vector: <X${direction[0]}, Z${direction[2]}>
            // Radian Difference: ${angles[0]} radians
            // Degree Difference: ${angles[1]} degrees
            // Tap Open Amount: ${angles[1] / fullTurnDegrees}
            // Hand Position: (X${palmPosition[0]}, Z${palmPosition[2]})
            // Hand Domain: ${this.robot.getHandSide(palmPosition[0])}
            // `);
          
          };
        };
      });
    },
    isGrabbing: function ( grabStrength ) {
      switch(true){
        case(grabStrength >= 0.95):
          return true;
        default:
          return false;
      };
    },
    isPinching: function ( pinchStrength ) {
      switch(true){
        case(pinchStrength >= 0.9):
          return true;
        default:
          return false;
      };
    },
    getDotProduct: function (vec1, vec2) {
      let rotationDirection = 0;
      if (vec2[0] > vec1[0]){
        // Hand is rotating Clockwise
        rotationDirection = 1;
      } else if (vec2[0] < vec1[0]) {
        // Hand is rotating Counterclockwise
        rotationDirection = -1;
      }
      const xProduct = (vec1[0] * vec2[0]);
      const zProduct = (vec1[2] * vec2[2]);
      const dotProduct = xProduct + zProduct;
      return {dotProduct: dotProduct, rotationDirection: rotationDirection};
    },

    getRotation: function (vector1, vector2) {
      const dotProductReturnValue = this.getDotProduct(vector1, vector2);
      const dotProduct = dotProductReturnValue.dotProduct;
      const rotationDirection = dotProductReturnValue.rotationDirection;
      const handRotationRads = Math.acos(dotProduct);
      const handRotationDegs = handRotationRads * 57.2958 * (rotationDirection);
      return handRotationDegs;
    },

    getHandSide: function (handPositionX) {
      if (handPositionX >= 50) {
        return "Cold";
      } else if (handPositionX <= -50) {
        return "Hot";
      } else {
        return "None";
      };
    },

    tapOpenClose: function (handDomain, rotationAmountDegrees) {

      
      // Convert the rotation in degrees to percentage of total turn amount
      // One turn is 360 degrees, so by dividing by that we can find the percentage the user has turned the tap
      let rotationAmountPercent = ((rotationAmountDegrees / fullTurnDegrees) * 5);
      
      console.log(rotationAmountPercent);

      // If the rotation amount is small enough, just ignore it.
      // if (rotationAmountPercent > -0.9 || rotationAmountPercent < 0.9) {
      //   rotationAmountPercent = 0;
      // };
      
      if (handDomain === "Cold") {
        // Add or Subtract the Rotation Amount in Degrees from the current Open Value of this tap
        coldValveOpenAmount += rotationAmountPercent;

        if (coldValveOpenAmount > 100) {
          coldValveOpenAmount = 100;
        } else if (coldValveOpenAmount < 0) {
          coldValveOpenAmount = 0;
        };
      } else if (handDomain === "Hot") {
        // Add or Subtract the Rotation Amount in Degrees from the current Open Value of this tap
        hotValveOpenAmount += rotationAmountPercent;

        if (hotValveOpenAmount > 100) {
          hotValveOpenAmount = 100;
        } else if (hotValveOpenAmount < 0) {
          hotValveOpenAmount = 0;
        };
      };
    }
}).start();
