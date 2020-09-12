import time
import math
import threading

class ExponentiallyDampedMovingAverage:
    def __init__(self, precision, dampingIntervalMillisec, updateIntervalMillisec, getter):
        #initialize instance
        self.precision = precision
        self.dampingIntervalMillisec = dampingIntervalMillisec
        self.updateIntervalMillisec = updateIntervalMillisec
        self.getter = getter
        self.value = 0
        self.dampingRate = updateIntervalMillisec / dampingIntervalMillisec
        self.exp = (1 << self.precision) * (1.0 / math.exp(self.dampingRate))
        # Schedule a calculate call every damping interval. I'd prefer to use a
        # more global precision async execution engine (a runloop of some sort)
        # for this, as a dedicated thread for each value is maximum overkill.
        self.lock = threading.Lock()
        self.cv = threading.Condition(self.lock)
        self.shutdown = False

    def __enter__(self):
        print("EDMA __enter__")
        self.thread = threading.Thread(target=self.runloop)
        self.thread.start()
    
    def __exit__(self, exc_type, exc_value, traceback):
        print("EDMA __exit__")
        with self.lock:
            self.shutdown = True
            self.cv.notify()
        self.thread.join()

    def getValue(self):
        # maybe throw if runloop isn't running; "did you use 'with'?"
        return self.value / (1 << self.precision)

    def getValueAsRate(self, perMillisec):
        return self.value * perMillisec / self.updateIntervalMillisec / (1 << self.precision)

    def calculate(self):
        current = int(self.getter()) << self.precision
        newvalue = int(self.value * self.exp)
        newvalue += int(current * ((1 << self.precision) - self.exp))
        self.value = newvalue >> self.precision
        # print("Calculated newvalue of ", self.value);

    def runloop(self):
        print("EDMA runloop starting")
        lastCalc = 0
        with self.cv:
            while self.shutdown == False:
                now = time.time() # TODO monotonic needed
                updateInterval = self.updateIntervalMillisec / 1000
                if now - lastCalc >= updateInterval:
                    self.calculate()
                    lastCalc = time.time() # TODO monotonic needed
                    waitTime = updateInterval
                else:
                    waitTime = updateInterval - (now - lastCalc)
                self.cv.wait(waitTime)
        print("EDMA runloop exiting")
