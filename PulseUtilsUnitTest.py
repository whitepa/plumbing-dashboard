import unittest
import PulseUtils
import time

class TestExponentiallyDampedMovingAverage(unittest.TestCase):

    def getValue(self):
        return 5.0

    def getRate(self):
        value = self.numPulses
        self.numPulses = 0
        return value
    def ratePulse(self,count):
        self.numPulses+=count

    def test_basic(self):
        edma = PulseUtils.ExponentiallyDampedMovingAverage(11, 200, 50, self.getValue)
        with edma:
            time.sleep(1)
            value = edma.getValue()
        self.assertAlmostEqual(5.0,value,delta=0.05)
        
    def test_rate(self):
        self.numPulses = 0
        rate = PulseUtils.ExponentiallyDampedMovingAverage(11, 1000, 100, self.getRate)
        with rate:
            count = 40
            while count > 0:
                count-=1
                time.sleep(0.1) # 10 per second
                self.ratePulse(1)
                value = rate.getValueAsRate(1000)
                print("Damped Rate: ", value)
            self.assertAlmostEqual(10.0,value,delta=0.5)
            time.sleep(4)
            value = rate.getValueAsRate(1000)
            print("Damped Rate (Zero): ", value)
            self.assertAlmostEqual(0,rate.getValueAsRate(1000),delta=0.5)


if __name__ == '__main__':
    unittest.main()