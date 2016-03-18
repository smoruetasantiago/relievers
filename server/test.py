import urllib2
import time
import RPi.GPIO as io
io.setmode(io.BCM)

door_sensor = 18
sensorTrigger = True
 
io.setup(door_sensor, io.IN, pull_up_down=io.PUD_UP)
 
# function for the door opening
def door_open():
    print("1")
 
# function for the door closing
def door_close():
    print("0")
 
if io.input(door_sensor): # if door is opened
   door_open() # fire GA code
if not io.input(door_sensor): # if door is closed
    door_close() # fire GA code
