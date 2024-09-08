const sql = require('mssql');
const { sqlConfig } = require('../config/db');

class DeleteModel {
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
    // Delete khỏi bảng
    async deleteByVideoId(videoId) {
        let transaction;
        try {
            await this.connect();

            // Bắt đầu transaction
            transaction = new sql.Transaction(this.pool);
            await transaction.begin();

            const request = transaction.request();

            // Xóa khỏi PlaylistItems và Videos
            await request.input('videoId', sql.VarChar(50), videoId)
            await request.query('DELETE FROM PlaylistItems WHERE VideoId = @videoId');
            await request.query('DELETE FROM Videos WHERE VideoId = @videoId');

            // Xác nhận transaction nếu thành công
            await transaction.commit();

            console.log('Successfully deleted from both tables.');

        } catch (error) {
            // Rollback the transaction in case of an error
            if (transaction) {
                await transaction.rollback();
            }

            throw new Error(`Error deleting in SQL Server: ${error.message}`);

        } finally {
            // Đảm bảo kết nối được đóng dù có lỗi xảy ra hay không.
            await this.disconnect();
        }
    }
}

module.exports = {
    DeleteModel,
}