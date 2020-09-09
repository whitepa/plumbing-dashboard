class annunciator {
   constructor(x,y,title,colorOn,colorOff) {
     this.x = x;
     this.y = y;
     this.title = title;
     this.colorOn = colorOn;
     this.colorOff = colorOff;
   }
  
   drw(state) {
     this.state = state;
     let bgColor = '#222222';
     let width = 100;
     let height = 60;
     let thickness = 3;
     if (state == 'ON') {
       fill(this.colorOn);
     } else {
       fill(this.colorOff);
     }
     rect(this.x - width/2,this.y - height / 2,width,height);
     fill(bgColor);
     rect(this.x - width / 2 + thickness,this.y - height / 2 + thickness,
          width - thickness * 2,height - thickness * 2);
     if (state == 'ON') {
       fill(this.colorOn);
     } else {
       fill(this.colorOff);
     }
     textAlign(CENTER, CENTER);
     textSize(20);
     text(this.title, this.x, this.y);

   }
}
class button {
   constructor(x,y,title) {
     this.x = x;
     this.y = y;
     this.title = title;
   }
   drw() {
     let width = 150;
     let height = 100;
     let thickness = 2;
     fill('#CCCCCC');
     rect(this.x - width / 2, this.y - height / 2, width, height);
     fill('#000000');
     rect(this.x - width / 2 + thickness, this.y - height / 2 + thickness,
          width - thickness * 2, height - thickness * 2);
     fill('#CCCCCC');
     textSize(30);
     textAlign(CENTER, CENTER);
     text(this.title, this.x, this.y);
   }
}
class gauge {
    constructor(x, y, title, unit, min, max) {
        this.x = x;
        this.y = y;
        this.title = title;
        this.unit = unit;
        this.min = min;
        this.max = max;
    }

    drw(value, low, high) {
        this.value = value;

        let gaugeOffsetY = -50;
        let colorIllum = '#AED662';
        let colorOff = '#454F33';
        let outsideRadius = 140;
        let insideRadius = 120;
        let arcStart = -4.5 * QUARTER_PI;
        let arcEnd = 0.5 * QUARTER_PI;
        let peakArcWidth = 0.03 * QUARTER_PI;
        fill(colorOff);    
        arc(this.x, this.y + gaugeOffsetY, outsideRadius, outsideRadius, arcStart, arcEnd);
        fill(colorIllum);

        // draw value
        let arcValue = (value / (this.max - this.min)) * (arcEnd - arcStart) + arcStart;
        arc(this.x, this.y + gaugeOffsetY, outsideRadius, outsideRadius, arcStart, arcValue);

        // draw high peak
        if (high != 0 && high <= this.max) {
            let arcHigh = (high / (this.max - this.min)) * (arcEnd - arcStart) + arcStart;
            arc(this.x, this.y + gaugeOffsetY, outsideRadius, outsideRadius,
                arcHigh - peakArcWidth, arcHigh + peakArcWidth);
        }

      
        fill('#000000');    
        arc(this.x, this.y + gaugeOffsetY, insideRadius, insideRadius, arcStart, arcEnd);

        textAlign(CENTER, BASELINE);
        textSize(40);
        fill('#CCCCCC'); 
        text( this.value, this.x, this.y - 39);
        textSize(25);
        text( this.unit, this.x, this.y - 8);
        textSize(15);
        text( this.title, this.x, this.y + 15);
      
    }
}

class UsageMeter {
  constructor(x,y,width,height, units) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.units = units;
  }
  drw(current, average) {
    // x,y is dead center on the bar
    // width height are for the bar itself
    // needles and text are fixed size

    // calculate range
    // maximum bar length is 25% over average
    const thick = 1;
    const fontSize = 12;
    let max = average * 1.25;
    let currentX = current / max * (this.width - thick * 2) + this.x - this.width / 2;
    let avgX = average / max * this.width + this.x - this.width / 2;

    // box
    fill('#FFFFFF');
    rect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
    fill('#000000');
    rect(this.x - this.width / 2 + thick, this.y - this.height / 2 + thick, this.width - thick * 2, this.height - thick * 2);

    // bar
    fill('#AED662');
    rect(this.x - this.width / 2 + thick, this.y - this.height / 2 + thick, (current / max) * (this.width - thick * 2), this.height - thick * 2);

    // current annotation
    fill('#CCCCCC');
    const tsl = 8; // triangle side length
    {
      const x1 = currentX;
      const y1 = this.y - this.height / 2;
      const x2 = x1 - 0.6 * tsl;
      const y2 = y1 - 0.8 * tsl;
      const x3 = x1 + 0.6 * tsl;
      const y3 = y1 - 0.8 * tsl;
      triangle(x1,y1, x2, y2, x3, y3);
      textSize(fontSize);
      textAlign(CENTER,BASELINE);
      text(current + ' ' + this.units, currentX, y2 - 3);
    }
    // average annotation
    fill('#CCCCCC');
    {
      const x1 = avgX;
      const y1 = this.y + this.height / 2;
      const x2 = x1 - 0.6 * tsl;
      const y2 = y1 + 0.8 * tsl;
      const x3 = x1 + 0.6 * tsl;
      const y3 = y1 + 0.8 * tsl;
      triangle(x1,y1, x2, y2, x3, y3);
      textSize(fontSize);
      textAlign(CENTER,TOP);
      text(average + ' ' + this.units + '\navg', avgX, y2 + 3);
    }
  }
}

class SafeRangeIndicator {
  constructor(x,y,range) {
    this.x = x;
    this.y = y;
    this.range = range;
  }
  drw() {
    fill('#CCCCCC');
    textAlign(CENTER,CENTER);
    textSize(16);
    text('SAFE WHEN\n' + this.range, this.x, this.y);
  }
}

class InfoBar {
    constructor(x,y,width) {
      this.x = x;
      this.y = y;
      this.width = width;
    }

    drw(temp, mintemp, mintime) {
      fill('#CCCCCC');
      textSize(16);
      // TIME
      textAlign(LEFT, CENTER);
      const now = new Date();
      text(now.toLocaleString(), this.x, this.y);
      // TEMP
      textAlign(CENTER, CENTER);
      text(temp + ' F', this.x + this.width / 2, this.y);
      // MIN TEMP
      textAlign(RIGHT, CENTER);
      text('MIN: ' + mintemp + ' F @ ' + now.toLocaleString(), this.x + this.width, this.y);
    }

}

let gaugeHeight = 210;
let g_house = new gauge(100,gaugeHeight, 'HOUSE', 'GPM', 0, 10);
let g_irrigation = new gauge(303,gaugeHeight, 'IRRIGATION', 'GPM', 0, 10);
let g_inlet_psi = new gauge(506,gaugeHeight, 'INLET', 'PSI', 0, 200);
let g_outlet_psi = new gauge(709,gaugeHeight, 'OUTLET', 'PSI', 0, 200);

let meterHeight = 270;
let gHouseUsage = new UsageMeter(100, meterHeight, 130, 15, "gal");
let gIrrigationUsage = new UsageMeter(300, meterHeight, 130, 15, "gal");

let gInletSafeRange = new SafeRangeIndicator(506, meterHeight, '5 - 40 PSI');
let gOutletSafeRange = new SafeRangeIndicator(709, meterHeight, '50 - 90 PSI');

// 6 annunciators
let a_x = 62;
let a_x_sep = 135;
let a_y = 45;
let a_fire        = new annunciator(a_x,a_y, 'FIRE', '#FF0200', '#444444');
let a_flood       = new annunciator(a_x+=a_x_sep,a_y, 'FLOOD', '#FF8002', '#444444');
let a_inlet_high  = new annunciator(a_x+=a_x_sep,a_y, 'INLET\nHIGH', '#FEFF00', '#444444');
let a_inlet_low   = new annunciator(a_x+=a_x_sep,a_y, 'INLET\nLOW', '#03FFFF', '#444444');
let a_outlet_high = new annunciator(a_x+=a_x_sep,a_y, 'OUTLET\nHIGH', '#FEFF00', '#444444');
let a_outlet_low  = new annunciator(a_x+=a_x_sep,a_y, 'OUTLET\nLOW', '#03FFFF', '#444444');

let b_silence   = new button(100, 380, 'SILENCE');
let b_test      = new button(300, 380, 'TEST');
let b_resetFire = new button(500, 380, 'RESET\nFIRE');
let b_resetRanges = new button(700, 380, 'RESET\nRANGES');

let gInfoBar = new InfoBar(20, 455, 760);

function setup() {
    createCanvas(800, 480);
    background('#000000');
    frameRate(10);
    noStroke();
}

function draw() {
  background('#000000');

  g_house.drw(7.3, 0, 9.5);
  g_irrigation.drw(5.1);
  g_inlet_psi.drw(135.9, 0, 150);
  g_outlet_psi.drw(70.3, 0, 150);
  gHouseUsage.drw(107.7, 150.1);
  gIrrigationUsage.drw(50.1, 104.0);

  gInletSafeRange.drw();
  gOutletSafeRange.drw();

  a_fire.drw('ON');
  a_flood.drw('ON');
  a_inlet_high.drw('ON');
  a_inlet_low.drw('OFF');
  a_outlet_high.drw('OFF');
  a_outlet_low.drw('OFF');

  b_silence.drw();
  b_test.drw();
  b_resetFire.drw();
  b_resetRanges.drw();

    //g_one.drw(time%100);
    //g_two.drw(100 - time%100);
  const mintime = Date("2020/09/01, 03:12:45");
  gInfoBar.drw(78.2, 59.0, mintime);
}

