const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'cricketTeam.db')
let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server running at http://localhost:3000')
    })
  } catch (e) {
    console.log(`DB error:${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

const convertDbObjectToResponseObject=(dbObject)=>{
  return{
    playerId:dbObject.player_id,
    playerName:dbObject.player_name,
    jerseyNumber:dbObject.jersey_number,
    role:dbObject.role,
  };
};

app.get('/players/', async (request, response) => {
  const getPlayersQuery = `SELECT * FROM cricket_team`
  const playersArray = await db.all(getPlayersQuery)
  response.send(playersArray.map((eachPlayer)=>
   convertDbObjectToResponseObject(eachPlayer)
   )
  );
});

app.post('/players/', async (request, response) => {
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const addPlayerQuery = `INSERT INTO cricket_team(player_name,jersey_number,role)
    VALUES
    (
      '${playerName}',
      ${jerseyNumber},
      '${role}'
    )
    ;`
  const dbResponse = await db.run(addPlayerQuery)
  response.send('Player Added to Team')
})

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerQuery = `select * from cricket_team where player_id=${playerId};`
  const player = await db.get(getPlayerQuery)
  response.send(convertDbObjectToResponseObject(player))
})

app.put('/players/:playerId/', async (request, response) => {
  const {playerName, jerseyNumber, role} = request.body
  const {playerId} = request.params
  const updateQuery = `UPDATE cricket_team set 
  player_name='${playerName}',
  jersey_number=${jerseyNumber},
  role='${role}'
  where player_id=${playerId};
  `
  await db.run(updateQuery)
  response.send('Player Details Updated')
})

app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deleteQuery = `delete from cricket_team where player_id=${playerId};`

  await db.run(deleteQuery)
  response.send('Player Removed')
})

module.exports = app
