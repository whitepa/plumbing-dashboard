# Custom Plumbing / Water System Dashboard
![](dashboard.png)
## Background
My family and I live on a large hillside, with our house nearly 90 feet above the street level.  Since the water main is at the street, this leads to quite a bit of pressure loss by the time the water makes it up the hill. (There is typically only around 15PSI where it enters the house).  As a result, a water pump is required to boost the pressure back up to usable levels.  Additionally, the steep hill means that fire trucks cannot safely make it up the driveway, and therefore we are required to have fire sprinklers in the house (also plumbed through the same system). Lastly, the recent addition of an irrigation system for landscaping has introduced additional requirements on our plumbing.

Due to the geography in the area, the water company maintains a series of pressure reducing valves (PRVs) in the water system, to ensure delivery of safe pressures into the various homes connected to the system. Unfortunately, those PRVs tend to fail from time to time, and surprisingly do not do so in a safe manner. On multiple occasions, I have measured upwards of 135 PSI entering our house (even taking into acccount the 90 foot rise above the street!) This is a highly dangerous condition that has now occurred multiple times without warning.

Given all of these challenges, I wanted an automated system which could monitor the incoming water pressure, the pressure of the system inside our house, warn us if and when the fire sprinkler system is triggered, as well as monitor and display other basic stats such as water usage and system temperature (it freezes here in the winter). As I already use Home Assistant for other home automation tasks, it would also be nice if those statistics and conditions could be shared with it via MQTT.

Welcome to the plumbing-dashboard project!

## Components

### Water System
Since I had to hire a plumber to install the additional line and backflow preventer for our irrigation system, I decided to add all the required metering and sensors at the same time to minimize the labor costs. Here is a diagram of the work required:
![](WaterSystem.svg)

### Sensor Hardware
The sensor hardware required for all the functionality is as follows:
* Potter Fire Flow Switch
* 2x DAE 1.0" Flow Meter with Pulse Output (0.1 gal per pulse)
* 2x Dwyer Instruments 628 S45617001 Pressure Gauge
* Raspberry Pi 3B+
* NCD.io 2-Channel 4-20 mA Current Loop Receiver

The Potter Fire Flow switch was already installed when our house was built, although the sprinkler contractor who put it in never hooked it up to anything. I imagine this is likely some kind of code violation, but honestly I'd rather utilize it for my own purposes (which will likely turn out way better than whatever 1950s technology they would have installed).

For the flow meters, I like DAE because they offer a version that gives one pulse per 0.1 gallon.  It seems that most pulse-based meters are a full gallon per pulse, which doesn't give me the resolution I want. With a goal of being able to detect smaller leaks in the house, I'd prefer not to need up to one gallon of water to go by before the flow is detectable.

Of all the components in the system, the pressure gauges probably took the most time to research.  For whatever reason, potable water pressure gauges which are digitally readable are hard to come by, especially reasonably priced ones. These from Dwyer are NSF rated for potable water, and give output via a 4-20ma loop, which is easily readable by a Raspberry Pi with the NCD.io current loop receiver (which connects to the Pi via i2c). The ones I bought are good from 0-200 PSI.

### Sensor Software
Since my goal is to make the sensor data available to whatever other devices and systems in my home which may require it, I chose to publish the data to MQTT. I already have an MQTT broker (Mosquitto) running as part of my Home Assistant installation, so I chose to publish sensor data there. This simplifies the sensor software such that it only needs to convert the incoming signals to usable values, and then publish those values to MQTT.

#### Data Model

I have also chosen to make the MQTT broker the single source of truth for the current state of the system.  This allows manipulation of the state directly from either the backend (water-monitor script) or the frontend (dashboard UI) without any sort of API calls needed between them. Both the backend and frontend subscribe to the water/# MQTT topic, and are able to receive updates accordingly. All updates to the state use the "retain" flag in MQTT, which allows restarted clients to immediately receive the current state upon connection/subscription.

| MQTT Topic | Description |
|-|-|
| water/alarm | Physical fire alarm state: "True" when alarm is sounding, "False" when off. The backend, upon detecting a transition from no fire flow to positive fire flow, shall set this to "True" one time. The "Silence" button on the frontend shall set this to "False" one time per button press. |
| water/annunciatorTest | Annunciator test in progress. When "True", all annunciators shall activate, and minor alarms (flood / pressure deviation) shall sound. |
| water/fireFlow | Indication of water flowing through the fire sprinkler system. If the flow sensor indicates a flow, this value shall be continuously set to "True" by the backend. The "Reset Fire" button on the frontend shall set this to "False" one time per button press. |
| water/houseFlow/ | A subdirectory of topics dedicated to water flow for the interior plumbing system |
| water/irrigationFlow/ | A subdirectory of topics dedicated to water flow in the irrigation system |
| water/*Flow/currentGPM | Current gallons per minute detected in the given flow. |
| water/*Flow/maxGPM | Maximum gallons per minute detected in the given flow. Will be set by the backend only when a new maximum is detected. Can be reset at any time by publishing a new value to this topic. |
| water/*Flow/dailyVolume | Total gallons detected since the previous midnight local time. |
| water/*Flow/dailyAverage | Mean daily gallons detected on this flow. |
| water/inlet/ | Water pressure observations at the water pump inlet. |
| water/outlet/ | Water pressure observations at the water pump outlet. |
| water/[in\|out]let/pressure | Current pressure in PSI. |
| water/[in\|out]let/minPressure | Minimum observed pressure in PSI. |
| water/[in\|out]let/maxPressure | Maximum observed pressure in PSI. |
| water/roomTemp | Utility room temperature in Fahrenheit. |
| water/minRoomTemp | Minimum observed room temperature. |
| water/minRoomTempTimestamp | UNIX timestamp when the minimum observation was made. |
| water/floodDetected | Flood sensor state: "True" if water is currently detected on the floor. |

#### Backend
The backend is implemented in Python, with most of it in the "water-monitor" script.

#### Fire Flow
The Fire Flow sensor is the simplest of all the sensors to sample.  It's just a switch, so GPIO on the Pi coupled with a resistor works perfectly.

#### Pressure Sensors
#### Flow Meters


### Dashboard

### Future Improvements
#### Eliminate external dependency on MQTT
Today, the MQTT broker I am using is part of my Home Assistant deployment, which runs on a separate server in my garage.  Ideally, I should be running an MQTT broker (likely Mosquitto) directly on the Raspberry Pi which runs the dashboard.  My main MQTT broker would then connect to it and subscribe to the entire water/# topic heirarchy. This would allow the plumbing monitor, dashboard display, annunciators, and alarms to continue to function on their own even if the Home Assistant system were unavailable, or goes away.
#### Pump Safety
Our pump is always-on, plugged directly into mains power.  If a low inlet pressure event occurs, the pump could burn itself up trying to boost the outlet pressure. Therefore as a future improvement, I'd like to tie the low-inlet-pressure condition to a relay which kills power to the pump. The pump is 1.8HP and runs on a 240v 20A circuit so a real industrial relay will be required (the Sparkfun / Adafruit stuff likely won't cut it). As a side note, this situation has already happened once while Washington Water was servicing a failed PRV. Luckily, the technicians remembered I had a booster pump and were nice enough to stop by the house right after this event started to let me know to unplug the pump!  Talk about going above and beyond!