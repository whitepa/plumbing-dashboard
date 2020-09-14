from ADS1115 import ADS1115
import threading
import time
import math

class PressureSensor:
    # I strongly dislike the ADS1115 interface. This class encapsulates all its
    # quirks to make it easy for the main program to just get the pressure
    # values. Normally, you'd instantiate multiple instances of this pressure
    # sensor class for each pressure sensor, although the ADS1115 doesn't allow
    # truly parallel sampling of each channel. Therefore, it's best to have a
    # single instance synchronously read each value from the ADC.
    def __init__(self):
        self.inletPressure = 0
        self.outletPressure = 0
        self.adc = ADS1115()
        self.lock = threading.Lock()
        self.cv = threading.Condition(self.lock)
        self.shutdown = False

    def __enter__(self):
        self.thread = threading.Thread(target=self.runloop)
        self.thread.start()

    def __exit__(self, exc_type, exc_value, traceback):
        with self.lock:
            self.shutdown = True
            self.cv.notify()
        self.thread.join()
    
    def runloop(self):
        with self.cv:
            while self.shutdown == False:
                self.adc.channel = 0
                self.adc.config_single_ended()
                time.sleep(0.2) # sleep here to give the interface the time it needs (??)
                # Without the sleep, you will read the value for the previously
                # set channel.
                inlet = self.adc.read_adc()
                #print("Inlet="+str(inlet['r']))
                self.inletPressure = inlet['r'] # TODO conversion

                self.adc.channel = 1
                self.adc.config_single_ended()
                time.sleep(0.2)
                outlet = self.adc.read_adc()
                #print("Outlet="+str(outlet['r']))
                self.outletPressure = outlet['r'] # TODO conversion
                self.cv.wait(0.1)
