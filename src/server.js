require('express-async-errors')

const express = require('express')
const AppError = require('./utils/AppError');
const migrationsRun = require('./database/sqlite/migrations')

const routes = require('./routes')

const app = express()
app.use(express.json())

app.use(routes)

migrationsRun()

app.use((error, request, response, next ) => {
  if(error instanceof AppError){
    return response.status(error.statusCode).json({
      status: 'error',
      message: error.message
    })
  }
  
  return response.status(500).json({
    status: 'error',
    message: 'Internal server error'
  })
})


const port = 3000
app.listen(port, () => {
  console.log(`Server is running on port:${port}`)
})
