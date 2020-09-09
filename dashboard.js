// Water System Dashboard

class Annunciator {
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
class Button {
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
class Gauge {
    constructor(x, y, title, unit, min, max, minsafe, maxsafe) {
        this.x = x;
        this.y = y;
        this.title = title;
        this.unit = unit;
        this.min = min;
        this.max = max;
        this.minsafe = minsafe;
        this.maxsafe = maxsafe;
    }

    drw(value, low, high) {
        this.value = value;

        let gaugeOffsetY = -50;
        let colorIllum = '#AED662';
        let colorIllumDanger = '#F68030';
        let colorOff = '#454F33';
        let colorOffDanger = '#4F4533';
        let outsideRadius = 140;
        let insideRadius = 120;
        let arcStart = -4.5 * QUARTER_PI;
        let arcEnd = 0.5 * QUARTER_PI;
        let peakArcWidth = 0.03 * QUARTER_PI;
        if (value > this.maxsafe || value < this.minsafe) {
          fill(colorOffDanger);
        } else {
          fill(colorOff);
        }
        arc(this.x, this.y + gaugeOffsetY, outsideRadius, outsideRadius, arcStart, arcEnd);
        if (value > this.maxsafe || value < this.minsafe) {
          fill(colorIllumDanger);
        } else {
          fill(colorIllum);
        }
        // draw value
        let arcValue = (value / (this.max - this.min)) * (arcEnd - arcStart) + arcStart;
        arc(this.x, this.y + gaugeOffsetY, outsideRadius, outsideRadius, arcStart, arcValue);

        // draw high peak
        if (high != 0) {
            if (high > this.max) high = this.max;
            let arcHigh = (high / (this.max - this.min)) * (arcEnd - arcStart) + arcStart;
            if (high > this.maxsafe || high < this.minsafe) {
              fill(colorIllumDanger);
            }
            else
            {
              fill(colorIllum);
            }
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
let gHouse = new Gauge(100,gaugeHeight, 'HOUSE', 'GPM', 0, 10, 0, 100);
let gIrrigation = new Gauge(303,gaugeHeight, 'IRRIGATION', 'GPM', 0, 10, 0, 100);
let gInletPSI = new Gauge(506,gaugeHeight, 'INLET', 'PSI', 0, 200, 5, 40);
let gOutletPSI = new Gauge(709,gaugeHeight, 'OUTLET', 'PSI', 0, 200, 40, 90);

let meterHeight = 270;
let gHouseUsage = new UsageMeter(100, meterHeight, 130, 15, "gal");
let gIrrigationUsage = new UsageMeter(300, meterHeight, 130, 15, "gal");

let gInletSafeRange = new SafeRangeIndicator(506, meterHeight, '5 - 40 PSI');
let gOutletSafeRange = new SafeRangeIndicator(709, meterHeight, '50 - 90 PSI');

// 6 annunciators
let a_x = 62;
let a_x_sep = 135;
let a_y = 45;
let gFire       = new Annunciator(a_x,a_y, 'FIRE', '#FF0200', '#444444');
let gFlood      = new Annunciator(a_x+=a_x_sep,a_y, 'FLOOD', '#FF8002', '#444444');
let gInletHigh  = new Annunciator(a_x+=a_x_sep,a_y, 'INLET\nHIGH', '#FEFF00', '#444444');
let gInletLow   = new Annunciator(a_x+=a_x_sep,a_y, 'INLET\nLOW', '#03FFFF', '#444444');
let gOutletHigh = new Annunciator(a_x+=a_x_sep,a_y, 'OUTLET\nHIGH', '#FEFF00', '#444444');
let gOutletLow  = new Annunciator(a_x+=a_x_sep,a_y, 'OUTLET\nLOW', '#03FFFF', '#444444');

let gSilence     = new Button(100, 380, 'SILENCE');
let gTest        = new Button(300, 380, 'TEST');
let gResetFire   = new Button(500, 380, 'RESET\nFIRE');
let gResetRanges = new Button(700, 380, 'RESET\nRANGES');

let gInfoBar = new InfoBar(20, 455, 760);

function setup() {
    createCanvas(800, 480);
    background('#000000');
    frameRate(10);
    noStroke();
}

function draw() {
  background('#000000');

  gHouse.drw(7.3, 0, 9.5);
  gIrrigation.drw(5.1);
  gInletPSI.drw(15.9, 0, 150);
  gOutletPSI.drw(70.3, 0, 150);
  gHouseUsage.drw(107.7, 150.1);
  gIrrigationUsage.drw(0, 104.0);

  gInletSafeRange.drw();
  gOutletSafeRange.drw();

  gFire.drw('ON');
  gFlood.drw('ON');
  gInletHigh.drw('ON');
  gInletLow.drw('OFF');
  gOutletHigh.drw('OFF');
  gOutletLow.drw('OFF');

  gSilence.drw();
  gTest.drw();
  gResetFire.drw();
  gResetRanges.drw();

  const mintime = Date("2020/09/01, 03:12:45");
  gInfoBar.drw(78.2, 59.0, mintime);
}

