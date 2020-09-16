from PulseUtils import ExponentiallyDampedMovingAverage


# Pulse Counters will compute total, daily, and instant flows, and
# publish to MQTT in asynchronous threads
# The input() method must be called periodically with the value of
# the associated GPIO input. The rate at which this is called must
# be fast enough such that you don't miss two transitions of the
# signal. This will obviously depend on your use case.
class PulseCounter():
    def __init__(self):
        self.previousValue = 0
        self.pulseRateInput = 0
        self.pulseCount = 0
        self.gallonsPerPulse = 0.1
        self.pulseRate = ExponentiallyDampedMovingAverage(11,5000,500,self.getRateInput)
    
    def EnterContext(self, stack):
        stack.enter_context(self.pulseRate)

    def GetTotalVolume(self):
        return self.pulseCount * self.gallonsPerPulse
    def GetCurrentGPM(self):
        return self.pulseRate.getValueAsRate(60000) * self.gallonsPerPulse

    def getRateInput(self):
        value = self.pulseRateInput
        self.pulseRateInput = 0
        #print("getRateInput returns ", value)
        return value

    def Input(self, value):
        if value == 1 and self.previousValue == 0:
            # transitioned high
            self.pulseCount += 1
            self.pulseRateInput += 1
        self.previousValue = value
        # TODO check for and store maximum
