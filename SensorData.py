# Classes to track Sensor Data

from PulseCounter import PulseCounter

class PressureSensorData:
    def __init__(self, topic, minSafe, maxSafe):
        self.topic = topic
        self.minSafe = minSafe
        self.maxSafe = maxSafe

        self.pressure = 0
        self.minPressure = 1000
        self.maxPressure = 0
    
    def Input(self,input):
        self.pressure = input
        if input != 0:
            self.maxPressure = max(self.pressure, self.maxPressure)
            self.minPressure = min(self.pressure, self.minPressure)
        # print(self.topic + ": " + str(self.pressure))

class FlowSensorData:
    def __init__(self, topic):
        self.topic = topic
        self.maxGPM = 0
        self.totalVolume = 0
        self.dailyVolume = 0
        self.dailyAverage = 0
        self.numDays = 0
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
        return self.maxGPM

    def Input(self, input):
        self.pulseCounter.Input(input)
        current = self.pulseCounter.GetCurrentGPM()
        if current > self.maxGPM:
            self.maxGPM = current
        # TODO Check if this is a new day, and update dailys
