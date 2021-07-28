import pymysql.cursors
from flask import Flask
from flask_restful import Api, Resource, reqparse
from dbutils.persistent_db import PersistentDB
from flask_cors import CORS, cross_origin
import RPi.GPIO as GPIO

app = Flask(__name__)
api = Api(app)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'
global mIsActive
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

GPIO.setmode(GPIO.BCM)
OUTPUT_PIN = 23
GPIO.setup(OUTPUT_PIN, GPIO.OUT)



GPIO.cleanup()# Class for the running Measurement
# Contains get for send new Values to the Frontend
# Contains put for setting Comments in the Database while Measuring
class SimpleApi(Resource):
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
      print(result)
      return result, 200
    except Exception as ex:
      print(ex)
      return 400

  # used while the Measurement for adding comments on the database
  def put(self):
    args = parser.parse_args()
    try:
      cnx = mysql_connection_pool.connection()
      cursor = cnx.cursor()
      sql = "UPDATE `VALUE` SET `KOMMENT`=%s WHERE `POSITION`=%s;"
      cursor.execute(sql, (args['kommentar'], args['position']))
      cnx.commit()
      cursor.close()
      cnx.close()
      return 'Data updated', 200
    except Exception as ex:
      print(ex)
      return 400


class SimpleApi2(Resource):
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
      print(result)
      return result, 200
    except Exception as ex:
      print(ex)
      return 400

  def put(self):
    args = parser

# Class for Starting the Measurement
# Contains get for sending the name of the Database-Table of the current Measurement to the Arduino
# Contains put for sending the name of the current Measurement from the Frontend to the API
class SimpleApi3(Resource):
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
      return ex, 400

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
      result = cursor.fetchall()
      cursor.close()
      cnx.close()
      tableName = args['tableName']
      mIsActive = True
      GPIO.output(OUTPUT_PIN, GPIO.HIGH)
      return args['tableName'], 200
    except Exception as ex:
      print(ex)
      return "Database connection failed", 400

class SimpleApi4(Resource):
  def get(self):
    global mIsActive
    mIsActive = False
    GPIO.output(OUTPUT_PIN, GPIO.LOW)

# this adds our resources to the api
# we define what resource we want to add and which path we would like to use
api.add_resource(SimpleApi, '/', '/<int:lastPosition>')
api.add_resource(SimpleApi2, '/management')
api.add_resource(SimpleApi3, '/start')
api.add_resource(SimpleApi4, '/stop')
if __name__ == '__main__':
  app.run( debug=True, host="192.168.178.153", port=5000)
