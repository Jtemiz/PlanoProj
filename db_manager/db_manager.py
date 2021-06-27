import pymysql.cursors
from flask import Flask
from flask_restful import Api, Resource, reqparse
from dbutils.persistent_db import PersistentDB
from flask_cors import CORS, cross_origin

app = Flask(__name__)
api = Api(app)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

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
# arg parser to define needed/required args with datatype etc
parser = reqparse.RequestParser()
parser.add_argument('kommentar', required=True, help='argument required')
parser.add_argument('position', type=int, required=True, help='argument required')

parser2 = reqparse.RequestParser()
parser2.add_argument('tableName', type=int, required=True, help='argument required')

# the api that handeles our requests
class SimpleApi(Resource):
  # the get function returns the data dict with status 200
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

  # the post function checks if the required arg is passed
  # if not it will return an error
  # if yes it will return the recieved data to the client with status 200
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
  def put(self):
    args = parser2.parse_args()
    try:
      cnx = mysql_connection_pool.connection()
      cursor = cnx.cursor()
      sql = "CREATE TABLE `%s` LIKE `VALUE`;"
      cursor.execute(sql, (args['tableName']))
      result = cursor.fetchall()
      cursor.close()
      cnx.close()
      return result, 200
    except Exception as ex:
      print(ex)
      return "DAS IST FALSCH", 400

# this adds our resources to the api
# we define what resource we want to add and which path we would like to use
api.add_resource(SimpleApi, '/', '/<int:lastPosition>')
api.add_resource(SimpleApi2, '/management')





if __name__ == '__main__':
  app.run(debug=True)

