import logging
import traceback
import pymysql.cursors
from dbutils.persistent_db import PersistentDB
from flask import Flask
from flask_cors import CORS, cross_origin
from flask_restful import Api, Resource, reqparse #
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

MEASUREMENT_IS_ACTIVE = False
TABLENAME = ''

# UDP-Connection to the Arduino
ARD_UDP_IP_SEND = "192.168.5.2"
ARD_UDP_PORT_SEND = 9000
ARD_UDP_IP_RECEIVE = "192.168.5.1"
ARD_UDP_PORT_RECEIVE = 5100

# connection to mysql database
db_config = {
  'host': '192.168.4.2',
  'user': 'messmodul',
  'password': 'Jockel01.',
  'database': 'MESSDATEN',
  'connect_timeout': 5
}

# Configuration to setup a persistent database-connection
mysql_connection_pool = PersistentDB(
  creator=pymysql,
  **db_config
)

# arg parser for API (running Measurement)
commentParser = reqparse.RequestParser()
commentParser.add_argument('kommentar', required=True, help='argument required')
commentParser.add_argument('position', type=int, required=True, help='argument required')

# arg parser for API3 (creating Table)
tableCreateParser = reqparse.RequestParser()
tableCreateParser.add_argument('tableName', type=int, required=True, help='argument required')

# arg parser for Angular Exception Logging
exceptionParser = reqparse.RequestParser()
exceptionParser.add_argument('errorMessage', type=str, required=True, help='error message required')

metaDataParser = reqparse.RequestParser()
metaDataParser.add_argument('place', type=str, required=False)
metaDataParser.add_argument('distance', type=float, required=True, help='distance required')
metaDataParser.add_argument('user', type=str, required=False)

# ARD-Messages
ARD_Start = bytes("070", "ascii")
ARD_Stop = bytes("071", "ascii")
ARD_Kali = bytes("072", "ascii")
ARD_StartReset = bytes("073", "ascii")
ARD_SDRead = bytes("074", "ascii")

# Contains GET for send new Values to the Frontend and insert them in right database-table
# Contains PUT for setting Comments in the Database while Measuring
class MeasurementDatabaseApi(Resource):
  # TODO check if executemany works
  # used for the Chart to show all new Values
  # Inserts the requested data into the database-table 'tableName'
  def get(self):
    global VALUES
    vals = []
    try:
      if (len(VALUES) != 0):
        print("Get angekommen")
        vals = VALUES
        VALUES = []
#        cnx = mysql_connection_pool.connection()
 #       cursor = cnx.cursor()
       # sql = "INSERT INTO %s (POSITION, HOEHE) VALUES (%s, %s)" %TABLENAME
  #      cursor.executemany("INSERT INTO %s (POSITION, HOEHE) VALUES (%s, %s)" %TABLENAME, (vals))
      return vals, 200
    except Exception as ex:
      print(ex)
      logging.error("MeasurementDatabaseApi.get(): " + str(ex) + "\n" + traceback.format_exc())
      return 'Verbindungsfehler', 500

  # used while the Measurement for adding comments on the database
  def put(self):
    try:
      args = commentParser.parse_args()
      cnx = mysql_connection_pool.connection()
      cursor = cnx.cursor()
      sql = "INSERT INTO `comments` VALUES (%s, %s,%s)"
      cursor.execute(sql, (TABLENAME, args['position'], args['kommentar']))
      cnx.commit()
      cursor.close()
      cnx.close()
      print("comment geadded")
      return 'Comment loaded into comments', 200
    except Exception as ex:
      print(ex)
      if ("Duplicate entry" in str(ex)):
        try:
          args = commentParser.parse_args()
          cnx = mysql_connection_pool.connection()
          cursor = cnx.cursor()
          sql = "UPDATE `comments` SET `comment`=%s WHERE `measurement`=%s AND `position`=%s"
          cursor.execute(sql, (args['kommentar'], TABLENAME, args['position']))
          cnx.commit()
          cursor.close()
          cnx.close()
          print("Kommentar geupdatet")
          return 'Comment updated', 200
        except Exception as ex:
          print(ex)
          return "Verb-Fehler", 500


class MeasurementTableApi(Resource):
  # used for "Datenbestand" to show all avaiable Data-Tables
  def get(self):
    try:
      print('TableApi')
      cnx = mysql_connection_pool.connection()
      cursor = cnx.cursor()
      sql = "SELECT * FROM `metadata` ORDER BY `measurement`"
      cursor.execute(sql, )
      result = cursor.fetchall()
      cursor.close()
      cnx.close()
      print(result)
      return result, 200
    except Exception as ex:
      print('ErrorTableApi')
      logging.error("MeasurementTableApi.get(): " + str(ex) + "\n" + traceback.format_exc())
      return 'Verbindungsfehler', 500


# Class for Starting the Measurement
# Contains get for sending the name of the Database-Table of the current Measurement to the Arduino
# Contains put for sending the name of the current Measurement from the Frontend to the API
class MeasurementStartApi(Resource):
  def get(self):
    try:
    # Set boolean True
      global MEASUREMENT_IS_ACTIVE
      MEASUREMENT_IS_ACTIVE = True
    # Arduino on
      sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
      sock.sendto(ARD_StartReset, (ARD_UDP_IP_SEND, ARD_UDP_PORT_SEND))
      print("arduino gestartet, Kilometer zurückgesetzt")
      sock.close()
    # UDP-Receiver on
      SUDPServer.start_server()
      return "arduino gestartet, Kilometer zurückgesetzt", 200
    except Exception as ex:
      logging.error("MeasurementStartApi.get(): " + str(ex) + "\n" + traceback.format_exc())
      return 'Verbindungsfehler', 500

  # used for getting the tableName from the Frontend to the API and create a new table in the Database named "TABLENAME"
  def put(self):
    args = tableCreateParser.parse_args()
    global TABLENAME
    try:
    # Create new SqlTable
      cnx = mysql_connection_pool.connection()
      cursor = cnx.cursor()
      sql = "CREATE TABLE `%s` LIKE `ExampleTable`;"
      cursor.execute(sql, (args['tableName']))
      cursor.close()
      cnx.close()
      TABLENAME = args['tableName']
      return args['tableName'], 200
    except Exception as ex:
      print(ex)
      logging.error("MeasurementStartApi.put(): " + str(ex) + "\n" + traceback.format_exc())
      return 'Verbindungsfehler', 500

# TODO reset Position-Counter in Arduino (in MeasurementStartApi or here?)
# Contains GET for sending stop-signal from Frontend to the API and Arduino
class MeasurementStopApi(Resource):
  def get(self):
    try:
      sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
      sock.sendto(ARD_Stop, (ARD_UDP_IP_SEND, ARD_UDP_PORT_SEND))
      sock.close()
      return "Arduino: Messung gestoppt, Kilometerstand beibehalten", 200
    except Exception as ex:
      print(ex)
      logging.error("MeasurementStopApi.get(): " + str(ex) + "\n" + traceback.format_exc())
      return 'Verbindungsfehler', 500

  def put(self):
    try:
    # set boolean false
      global MEASUREMENT_IS_ACTIVE
      MEASUREMENT_IS_ACTIVE = False
    # stop receiving Values
      SUDPServer.stop_server()
    # stop Arduino
      sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
      sock.sendto(ARD_Stop, (ARD_UDP_IP_SEND, ARD_UDP_PORT_SEND))
      sock.close()
    # add MetaData to Table
      print("start inserting")
      args = metaDataParser.parse_args()
      cnx = mysql_connection_pool.connection()
      cursor = cnx.cursor()
      sql = "INSERT INTO `metadata` VALUES (%s, %s, %s, %s)"
      cursor.execute(sql, (TABLENAME, args['place'], args['distance'], args['user']))
      cnx.commit()
      cursor.close()
      cnx.close()
      return "Messung gestoppt", 200
    except Exception as ex:
      print(ex)
      logging.error("MeasurementStopApi.get(): " + str(ex) + "\n" + traceback.format_exc())
      return 'Verbindungsfehler', 500


class MeasurementStatusApi(Resource):
  def get(self):
    try:
      print(MEASUREMENT_IS_ACTIVE)
      return MEASUREMENT_IS_ACTIVE, 200
    except Exception as ex:
      logging.error("MeasurementStatusApi.get(): " + str(ex) + "\n" + traceback.format_exc())
      return 'Verbindungsfehler', 500

# used for receiving Exceptions from Frontend
class AngularErrorLoggerApi(Resource):
  # receives Exections from Angular-Frontend and loggs them to db_manager.log
  def post(self):
    try:
      args = exceptionParser.parse_args()
      print(args['errorMessage'])
      logging.error("Angular Exception: " + str(args['errorMessage']))
      return 'Fehler geloggt', 200
    except Exception as ex:
      logging.error("AngularErrorLoggerApi.get(): " + str(ex) + "\n" + traceback.format_exc())
      return 'Verbindungsfehler', 500

# used for starting updates
class SystemApi(Resource):
  #starts local shell-script to update the API & Frontend
  def get(self):
    try:
      os.system("/var/www/html/update.sh")
      return 'update durchgeführt', 200
    except Exception as ex:
      logging.error("SystemApi.get: " + str(ex) + "\n" + traceback.format_exc())
      return 'Update konnte nicht durchgeführt werden', 500


# TODO: Implement methode that checks if all measured data were received (Counter)
# This class is a subclass of the DatagramRequestHandler and overrides the handle method
class MyUDPRequestHandler(socketserver.DatagramRequestHandler):
  def handle(self):
    message = self.rfile.readline().strip().decode('UTF-8')
    global VALUES
    if "STAT" not in message:
      typeDataSplit = message.split(";")
      data = {
      "index": int(typeDataSplit[0]),
      "position": float(typeDataSplit[1]),
      "height": float(typeDataSplit[2]),
      "speed": float(typeDataSplit[3])
      }
      VALUES.append(data)


# This class provides a multithreaded UDP server that can receive messages sent to the defined ip and port
class UDPServer(threading.Thread):
  server_address = (ARD_UDP_IP_RECEIVE, ARD_UDP_PORT_RECEIVE)
  udp_server_object = None

  def run(self):
    try:
      self.udp_server_object = socketserver.ThreadingUDPServer(self.server_address, MyUDPRequestHandler)
      self.udp_server_object.serve_forever()
      print("Server gestartet")
    except Exception as ex:
      logging.error("MeasurementStopApi.get(): " + str(ex) + "\n" + traceback.format_exc())
      print(ex)

  def stop(self):
    try:
      self.udp_server_object.shutdown()
      print("UDP server shutdown")
    except Exception as ex:
      logging.error("MeasurementStopApi.get(): " + str(ex) + "\n" + traceback.format_exc())
      print(ex)


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

# TODO adapt IP to productionMode
if __name__ == '__main__':
  app.run(debug=False, host='192.168.4.2', port=5000)
