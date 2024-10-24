const sql = require('mssql');

// Cấu hình kết nối đến SQL Server
const sqlConfig = {
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    server: process.env.SERVER_MSSQL,
    options: {
        encrypt: false, // Bật mã hóa nếu sử dụng với Azure
        trustServerCertificate: true,
    },
};

const poolPromise = sql.connect(sqlConfig)
    .then(pool => {
        console.log('Connected to SQL Server');
        return pool;
    })
    .catch(err => {
        console.error('Database connection failed:', err);
        process.exit(1);
    });

const shutDown = () => {
    console.log('Shutting down server...');
    // Đóng kết nối với cơ sở dữ liệu
    sql.close(sqlConfig)
        .then(() => {
            console.log('Database connection closed');
            process.exit(0);
        })
        .catch(err => {
            console.error('Failed to close database connection:', err);
            process.exit(1);
        });
}

// Lắng nghe các tín hiệu đóng server (như Ctrl+C trong terminal)
process.on('SIGINT', shutDown);
process.on('SIGTERM', shutDown);

module.exports = {
    sqlConfig,
    poolPromise
}