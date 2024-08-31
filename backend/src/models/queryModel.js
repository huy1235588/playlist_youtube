const sql = require('mssql');
const { sqlConfig } = require('../config/db');

class QueryModel {
    constructor() {
        this.pool = null;
    }

    // Tạo kết nối đến SQL Server nếu chưa có
    async connect() {
        if (!this.pool) {
            this.pool = await sql.connect(sqlConfig);
        }
    }

    //  Đóng kết nối khi không còn sử dụng nữa.
    async disconnect() {
        if (this.pool) {
            await this.pool.close();
            this.pool = null;
        }
    }

    // Selct 50 Video đầu tiên theo thứ tự thêm vào 
    async select50Video() {
        try {
            await this.connect();
            const request = this.pool.request();

            // Chọn dữ liệu từ View Display50Video
            const result = await request
                .query(`Select *
                        From Display50Video`
                );

            // Trả về dữ liệu nếu có
            if (result.recordset.length > 0) {
                return result.recordset;
            } else {
                return { message: 'Channel not found' };
            }

        } catch (error) {
            throw new Error(`Error querying SQL Server ${error.message}`);
        } finally {
            // Đảm bảo kết nối được đóng dù có lỗi xảy ra hay không.
            await this.disconnect();
        }
    }
}

module.exports = {
    QueryModel
}