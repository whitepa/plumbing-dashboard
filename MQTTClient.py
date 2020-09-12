import paho.mqtt.client as mqtt
import threading

class MQTTClient:
    def __init__(self, publisher, host, port, username, password):
        self.publisher = publisher
        self.lock = threading.Lock()
        self.cv = threading.Condition(self.lock)
        self.shutdown = False
        self.client = mqtt.Client()
        self.host = host
        self.port = port
        self.username = username
        self.password = password
        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message

    def __enter__(self):
        self.client.username_pw_set(self.username, self.password)
        self.client.connect(self.host, self.port, 60)
        self.client.loop_start()
        self.thread = threading.Thread(target=self.loop)
        self.thread.start()
            
    def __exit__(self, exc_type, exc_value, traceback):
        with self.lock:
            self.shutdown = True
            self.cv.notify()
        self.thread.join()
        self.client.loop_stop()

    def on_connect(client, userdata, flags, rc):
        print("MQTT connected with result code "+str(rc))

    def on_message(client, userdata, msg):
        print("MQTT: ", msg.topic + " " + str(msg.payload))
    
    def loop(self):
        print("MQTT loop starting")
        with self.cv:
            while self.shutdown == False:
                # Get publishable data
                msgs = self.publisher.getMessagesToPublish()
                for msg in msgs:
                    self.client.publish(msg['topic'],msg['payload'],msg['qos'],msg['retain'])
                self.cv.wait(0.2)
        print("MQTT loop exiting")