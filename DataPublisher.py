from SensorData import PressureSensorData, FlowSensorData
import time

class DataPublisher():
    # handle the stats data itself regarding all water and plumbing systems
    # decide when and what to publish to MQTT.
    #
    # Generally speaking, data is only published to MQTT when changes occur. All
    # data is published with retain=1 to allow instant display of current stats
    # on dashboard startup (or any client connection)
    #
    # This class is intended to sit in between the "input thread" and the
    # "publishing thread" This separates into two contexts the inputs vs the
    # decisions of what and when to publish.  This is important as the input
    # thread is very timing sensitive so as to not miss any signal transitions,
    # and since the publishing thread is dealing with MQTT communications (which
    # may block), these responsibilities must be handled in separate threads.
    def __init__(self):
        self.fireFlow = False
        self.houseFlow = FlowSensorData("water/houseFlow")
        self.irrigationFlow = FlowSensorData("water/irrigationFlow")
        self.inletPressure = PressureSensorData("water/inlet", 5, 40)
        self.outletPressure = PressureSensorData("water/outlet", 60, 90)
        self.mqttInletMinPressure = 1000
        self.mqttInletMaxPressure = 0
        self.mqttOutletMinPressure = 1000
        self.mqttOutletMaxPressure = 0
        self.mqttMinRoomTemp = 1000
        self.mqttMinRoomTempTimestamp = 0
        self.mqttRoomTemp = 1000
    
    def EnterContext(self, stack):
        self.houseFlow.EnterContext(stack)
        self.irrigationFlow.EnterContext(stack)

    def fireFlowInput(self, isFlowing):
        if (isFlowing and self.fireFlow == False):
            self.fireFlow = True # latches ON until explicitly cleared via MQTT
    def GetFireFlow(self):
        if (self.fireFlow == True):
            self.fireFlow = False
            return True
        else:
            return False

    def houseFlowInput(self, input):
        self.houseFlow.Input(input)

    def irrigationFlowInput(self, input):
        self.irrigationFlow.Input(input)

    def inletPressureInput(self, input):
        self.inletPressure.Input(input)

    def outletPressureInput(self, input):
        self.outletPressure.Input(input)

    def receivedMessage(self, topic, payload):
        if topic == "water/inlet/minPressure":
            self.mqttInletMinPressure = float(payload)
            print("Reset inlet min to " + str(payload))
        if topic == "water/inlet/maxPressure":
            self.mqttInletMaxPressure = float(payload)
            print("Reset inlet max to " + str(payload))
        if topic == "water/outlet/minPressure":
            self.mqttOutletMinPressure = float(payload)
            print("Reset outlet min to " + str(payload))
        if topic == "water/outlet/maxPressure":
            self.mqttOutletMinPressure = float(payload)
            print("Reset outlet max to " + str(payload))
        if topic == "water/alarm":
            print("Set Alarm state: " + str(payload))
        if topic == "water/minRoomTemp":
            self.mqttMinRoomTemp = float(payload)
            print("Set min room temp to " + str(payload))
        if topic == "water/minRoomTempTimestamp":
            self.mqttMinRoomTempTimestamp = float(payload)
            print("Set min room temp timestamp to " + str(payload))
        if topic == "water/roomTemp":
            self.mqttRoomTemp = float(payload)
            print("Set room temp to " + str(payload))

    def getMessagesToPublish(self):
        # TODO only publish what has changed
        # Returns an array of messages which can be published via paho MQTT's
        # "publish multiple"
        #
        # Create a list of all current pairs
        pairs = []
        if self.GetFireFlow():
            pairs.append({'topic':"water/fireFlow",'payload':str(True)})
        pairs.append({'topic':"water/houseFlow/currentGPM",'payload':str(self.houseFlow.GetCurrentGPM())})
        pairs.append({'topic':"water/houseFlow/maxGPM",'payload':str(self.houseFlow.GetMaxGPM())})
        pairs.append({'topic':"water/houseFlow/dailyVolume",'payload':str(self.houseFlow.GetDailyVolume())})
        pairs.append({'topic':"water/houseFlow/dailyAverage",'payload':str(self.houseFlow.GetDailyAverage())})
        pairs.append({'topic':"water/irrigationFlow/currentGPM",'payload':str(self.irrigationFlow.GetCurrentGPM())})
        pairs.append({'topic':"water/irrigationFlow/maxGPM",'payload':str(self.irrigationFlow.GetMaxGPM())})
        pairs.append({'topic':"water/irrigationFlow/dailyVolume",'payload':str(self.irrigationFlow.GetDailyVolume())})
        pairs.append({'topic':"water/irrigationFlow/dailyAverage",'payload':str(self.irrigationFlow.GetDailyAverage())})
        pairs.append({'topic':"water/inlet/pressure",'payload':str(self.inletPressure.pressure)})
        pairs.append({'topic':"water/outlet/pressure",'payload':str(self.outletPressure.pressure)})
        if (self.inletPressure.minPressure < self.mqttInletMinPressure):
            pairs.append({'topic':"water/inlet/minPressure",'payload':str(self.inletPressure.minPressure)})
        if (self.inletPressure.maxPressure > self.mqttInletMaxPressure):            
            pairs.append({'topic':"water/inlet/maxPressure",'payload':str(self.inletPressure.maxPressure)})
        if (self.outletPressure.minPressure < self.mqttOutletMinPressure):
            pairs.append({'topic':"water/outlet/minPressure",'payload':str(self.outletPressure.minPressure)})
        if (self.outletPressure.maxPressure > self.mqttOutletMaxPressure):
            pairs.append({'topic':"water/outlet/maxPressure",'payload':str(self.outletPressure.maxPressure)})
        if (self.mqttRoomTemp < self.mqttMinRoomTemp):
            self.mqttMinRoomTemp = self.mqttRoomTemp
            self.mqttMinRoomTempTimestamp = time.time()
            pairs.append({'topic':"water/minRoomTemp", 'payload':str(self.mqttMinRoomTemp)})
            pairs.append({'topic':"water/minRoomTempTimestamp", 'payload':str(self.mqttMinRoomTempTimestamp)})

        msgs = []
        for x in pairs:
            x['qos'] = 1
            x['retain'] = True
            msgs.append(x)
        
        return msgs
    
