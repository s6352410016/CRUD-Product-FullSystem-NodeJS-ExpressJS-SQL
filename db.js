const mysql = require('mysql')

const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'productsdb'
})

conn.connect(err => {
    if(err){
        throw err
    }else{
        console.log('Connected success')
    }
})

module.exports = conn