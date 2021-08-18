import logging
import traceback
import pymysql.cursors
import RPi.GPIO as GPIO
from dbutils.persistent_db import PersistentDB
from flask import Flask
from flask_cors import CORS, cross_origin
from flask_restful import Api, Resource, reqparse
import threading
import socketserver
import socket
import os

app = Flask(__name__)
VALUES = []
logging.basicConfig(filename=app.root_path + '/db_manager.log', level=logging.INFO,
                    format='%(asctime)s - %(levelname)s: %(message)s')
api = Api(app)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

mIsActive = False
tableName = "tablenameString"
global postArray
# connection to mysql database
db_config = {
  'host': '192.168.178.153',
  'user': 'messmodul',
  'password': 'Jockel01.',
  'database': 'MESSDATEN',
  'connect_timeout': 5
}

mysql_connection_pool = PersistentDB(
  creator=pymysql,
  **db_config
)

udpServer = None
ARD_UDP_IP = "192.168.178.146"
ARD_UDP_PORT = 9000
# arg parser for API (running Measurement)
parser = reqparse.RequestParser()
parser.add_argument('kommentar', required=True, help='argument required')
parser.add_argument('position', type=int, required=False, help='argument required')

# arg parser for API3 (creating Table)
parser2 = reqparse.RequestParser()
parser2.add_argument('tableName', type=int, required=True, help='argument required')

# arg parser for Angular Exception Logging
parser3 = reqparse.RequestParser()
parser3.add_argument('errorMessage', type=str, required=True, help='error message required')

# RPi.GPIO setup
GPIO.setwarnings(False)
GPIO.setmode(GPIO.BCM)
OUTPUT_PIN = 23
GPIO.setup(OUTPUT_PIN, GPIO.OUT)


# Contains get for send new Values to the Frontend
# Contains put for setting Comments in the Database while Measuring
class MeasurementDatabaseApi(Resource):
  # used for the Chart to show all new Values
  def get(self):
    try:
      global VALUES
      vals = VALUES
      VALUES = []
      print("Get angekommen")
      return vals, 200
    except Exception as ex:
      logging.error("MeasurementDatabaseApi.get(): " + str(ex) + "\n" + traceback.format_exc())
      return 'Verbindungsfehler', 500

  # used while the Measurement for adding comments on the database
  def put(self):
    try:
      args = parser.parse_args()
      cnx = mysql_connection_pool.connection()
      cursor = cnx.cursor()
      sql = "UPDATE `VALUE` SET `KOMMENT`=%s WHERE `POSITION`=%s;"
      cursor.execute(sql, (args['kommentar'], args['position']))
      cnx.commit()
      cursor.close()
      cnx.close()
      return 'Data updated', 200
    except Exception as ex:
      logging.error("MeasurementDatabaseApi.put(): " + str(ex) + "\n" + traceback.format_exc())
      return 'Verbindungsfehler', 500


class MeasurementTableApi(Resource):
  # used for "Datenbestand" to show all avaiable Data-Tables
  def get(self):
    try:
      cnx = mysql_connection_pool.connection()
      cursor = cnx.cursor()
      sql = "SHOW TABLES FROM MESSDATEN"
      cursor.execute(sql, )
      result = cursor.fetchall()
      cursor.close()
      cnx.close()
      return result, 200
    except Exception as ex:
      logging.error("MeasurementTableApi.get(): " + str(ex) + "\n" + traceback.format_exc())
      return 'Verbindungsfehler', 500


# Class for Starting the Measurement
# Contains get for sending the name of the Database-Table of the current Measurement to the Arduino
# Contains put for sending the name of the current Measurement from the Frontend to the API
class MeasurementStartApi(Resource):
  def get(self):
    try:
    # Set boolean True
      global mIsActive
      mIsActive = True
    # Arduino on
      sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
      sock.sendto(b"070", (ARD_UDP_IP, ARD_UDP_PORT))
      print("Arduino gestartet")
      sock.close()
      sock = None
    # UDP-Receiver on
      SUDPServer.start_server()
    # Light on
      GPIO.output(OUTPUT_PIN, GPIO.HIGH)
      return "arduino gestartet", 200
    except Exception as ex:
      logging.error("MeasurementStartApi.get(): " + str(ex) + "\n" + traceback.format_exc())
      return 'Verbindungsfehler', 500

  # used for getting the tableName from the Frontend to the API
  def put(self):
    args = parser2.parse_args()
    global tableName
    try:
    # Create new SqlTable
      cnx = mysql_connection_pool.connection()
      cursor = cnx.cursor()
      sql = "CREATE TABLE `%s` LIKE `VALUE`;"
      cursor.execute(sql, (args['tableName']))
      cursor.close()
      cnx.close()
      tableName = args['tableName']
      return args['tableName'], 200
    except Exception as ex:
      logging.error("MeasurementStartApi.put(): " + str(ex) + "\n" + traceback.format_exc())
      return 'Verbindungsfehler', 500


class MeasurementStopApi(Resource):
  def get(self):
    try:
    # set boolean false
      global mIsActive
      mIsActive = False
    # stop receiving Values
      SUDPServer.stop_server()
    # stop Arduino
      sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
      sock.sendto(b"071", (ARD_UDP_IP, ARD_UDP_PORT))
      print("Arduino gestoppt")
      sock.close()
      sock = None
    # Light out
      GPIO.output(OUTPUT_PIN, GPIO.LOW)
      return "Messung gestoppt", 200
    except Exception as ex:
      logging.error("MeasurementStopApi.get(): " + str(ex) + "\n" + traceback.format_exc())
      return 'Verbindungsfehler', 500


class MeasurementStatusApi(Resource):
  def get(self):
    try:
      print(mIsActive)
      return mIsActive, 200
    except Exception as ex:
      logging.error("MeasurementStatusApi.get(): " + str(ex) + "\n" + traceback.format_exc())
      return 'Verbindungsfehler', 500


class AngularErrorLoggerApi(Resource):
  def post(self):
    try:
      args = parser3.parse_args()
      print(args['errorMessage'])
      logging.error("Angular Exception: " + str(args['errorMessage']))
      return 'Fehler geloggt', 200
    except Exception as ex:
      logging.error("AngularErrorLoggerApi.get(): " + str(ex) + "\n" + traceback.format_exc())
      return 'Verbindungsfehler', 500

class SystemApi(Resource):
  def get(self):
    try:
      os.system("/var/www/html/update.sh")
      return 'update durchgeführt', 200
    except Exception as ex:
      logging.error("SystemApi.get: " + str(ex) + "\n" + traceback.format_exc())
      return 'Update konnte nicht durchgeführt werden', 500

# This class is a subclass of the DatagramRequestHandler and overrides the handle method
class MyUDPRequestHandler(socketserver.DatagramRequestHandler):
  def handle(self):
    message = self.rfile.readline().strip().decode('UTF-8')
    global VALUES
    typeDataSplit = message.split("%")
    if typeDataSplit[0] == "MES":
      dataSplit = typeDataSplit[1].split("/")
      data = {
      "type": typeDataSplit[0],
      "position": dataSplit[0],
      "height": dataSplit[1].split("$")[0]
      }
      print(data)
      VALUES.append(data)


# This class provides a multithreaded UDP server that can receive messages sent to the defined ip and port
class UDPServer(threading.Thread):
  server_address = ("192.168.178.153", 5100)
  udp_server_object = None

  def run(self):
    print("Server gestartet")
    try:
      self.udp_server_object = socketserver.ThreadingUDPServer(self.server_address, MyUDPRequestHandler)
      self.udp_server_object.serve_forever()
    except:
      pass

  def stop(self):
    self.udp_server_object.shutdown()
    print("UDP server shutdown")


class SUDPServer():
  __server: socketserver.ThreadingUDPServer = None

  @staticmethod
  def start_server():
    if SUDPServer.__server == None:
      SUDPServer()
      SUDPServer.__server.start()

  @staticmethod
  def stop_server():
    if SUDPServer.__server != None:
      SUDPServer.__server.stop()
      SUDPServer.__server = None

  def __init__(self):
    if SUDPServer.__server is not None:
      raise Exception("Class is already initialized")
    SUDPServer.__server = UDPServer()


# this adds our resources to the api
# we define what resource we want to add and which path we would like to use
api.add_resource(MeasurementDatabaseApi, '/measurement')
api.add_resource(MeasurementTableApi, '/tables')
api.add_resource(MeasurementStartApi, '/start')
api.add_resource(MeasurementStopApi, '/stop')
api.add_resource(MeasurementStatusApi, '/status')
api.add_resource(AngularErrorLoggerApi, '/errorlogger')
api.add_resource(SystemApi, '/update')
if __name__ == '__main__':
  app.run(debug=False, host="192.168.178.153", port=5000)
