import logging
import traceback

import pymysql.cursors
import RPi.GPIO as GPIO
from dbutils.persistent_db import PersistentDB
from flask import Flask
from flask_cors import CORS, cross_origin
from flask_restful import Api, Resource, reqparse

app = Flask(__name__)

logging.basicConfig(filename=app.root_path + '/db_manager.log', level=logging.INFO,
                    format='%(asctime)s - %(levelname)s: %(message)s')
api = Api(app)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

mIsActive = False
global tableName

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
  def get(self, lastPosition):
    try:
      cnx = mysql_connection_pool.connection()
      cursor = cnx.cursor()
      sql = "SELECT `HOEHE`, `KOMMENT`, `POSITION` FROM `VALUE` WHERE `POSITION` > %s;"
      cursor.execute(sql, (lastPosition))
      result = cursor.fetchall()
      cursor.close()
      cnx.close()
      return result, 200
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
  # returns the current TableName, that should be written in that measurement (usual receiver: Arduino; Command: '192.168.178.153:5000/start/')
  # --> Arduino-Command:
  # while (true) {
  #   (if pinX == high) {
  #     tableName = get('192.168.178.153:5000/start/');
  #     break;
  #     }
  # }
  # while (pinX = high) {
  # Messen, Messen, Messen!
  # }
  def get(self):
    try:
      return tableName, 200
    except Exception as ex:
      logging.error("MeasurementStartApi.get(): " + str(ex) + "\n" + traceback.format_exc())
      return 'Verbindungsfehler', 500

  # used for getting the tableName from the Frontend to the API
  def put(self):
    args = parser2.parse_args()
    global tableName
    global mIsActive
    try:
      cnx = mysql_connection_pool.connection()
      cursor = cnx.cursor()
      sql = "CREATE TABLE `%s` LIKE `VALUE`;"
      cursor.execute(sql, (args['tableName']))
      cursor.close()
      cnx.close()
      tableName = args['tableName']
      mIsActive = True
      GPIO.output(OUTPUT_PIN, GPIO.HIGH)
      return args['tableName'], 200
    except Exception as ex:
      logging.error("MeasurementStartApi.put(): " + str(ex) + "\n" + traceback.format_exc())
      return 'Verbindungsfehler', 500

class MeasurementStopApi(Resource):
  def get(self):
    try:
      global mIsActive
      mIsActive = False
      GPIO.output(OUTPUT_PIN, GPIO.LOW)
      return "Messung gestoppt", 200
    except Exception as ex:
      logging.error("MeasurementStopApi.get(): " + str(ex) + "\n" + traceback.format_exc())
      return 'Verbindungsfehler', 500

class MeasurementStatusApi(Resource):
  def get(self):
    try:
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

# this adds our resources to the api
# we define what resource we want to add and which path we would like to use
api.add_resource(MeasurementDatabaseApi, '/measurement', '/<int:lastPosition>')
api.add_resource(MeasurementTableApi, '/tables')
api.add_resource(MeasurementStartApi, '/start')
api.add_resource(MeasurementStopApi, '/stop')
api.add_resource(MeasurementStatusApi, '/status')
api.add_resource(AngularErrorLoggerApi, '/errorlogger')

if __name__ == '__main__':

  # app.run(debug=True, port=5000)
  app.run(debug=True, host="192.168.178.153", port=5000)
