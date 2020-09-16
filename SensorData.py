# Classes to track Sensor Data

from PulseCounter import PulseCounter

class PressureSensorData:
    def __init__(self, topic, minSafe, maxSafe):
        self.topic = topic
        self.minSafe = minSafe
        self.maxSafe = maxSafe

        self.pressure = 0
        self.minPressure = 0
        self.maxPressure = 0
    
    def Input(self,input):
        self.pressure = input
        self.maxPressure = max(self.pressure, self.maxPressure)
        self.minPressure = min(self.pressure, self.minPressure)
        # print(self.topic + ": " + str(self.pressure))

class FlowSensorData:
    def __init__(self, topic):
        self.topic = topic
        self.totalVolume = 0
        self.dailyVolume = 0
        self.dailyAverage = 0
        self.numDays = 0
        self.currentFlowRate = 0
        self.pulseCounter = PulseCounter()

    def EnterContext(self, stack):
        self.pulseCounter.EnterContext(stack)

    def GetCurrentGPM(self):
        return self.pulseCounter.GetCurrentGPM()
    def GetDailyVolume(self):
        return self.pulseCounter.GetTotalVolume()
    def GetDailyAverage(self):
        return self.dailyAverage
    def GetMaxGPM(self):
        return 0 # TODO input loop should track this

    def Input(self, input):
        self.pulseCounter.Input(input)
        # TODO Check if this is a new day, and update dailys
