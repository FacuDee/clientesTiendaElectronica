const mysql = require('mysql2');
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',  // Ej: 'root'
    password: 'admin08_sql',
    database: 'tienda_electronica'     // Nombre de tu BD en Workbench
});
module.exports = pool.promise();