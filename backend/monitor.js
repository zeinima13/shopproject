const os = require('os');
const Redis = require('redis');

class SystemMonitor {
    constructor() {
        this.redisClient = Redis.createClient();
        this.redisClient.connect().catch(console.error);
        this.metrics = {
            startTime: Date.now(),
            requests: 0,
            errors: 0,
            responseTimes: []
        };
    }

    // 记录请求
    logRequest(duration) {
        this.metrics.requests++;
        this.metrics.responseTimes.push(duration);
        if (this.metrics.responseTimes.length > 1000) {
            this.metrics.responseTimes.shift();
        }
    }

    // 记录错误
    logError() {
        this.metrics.errors++;
    }

    // 获取系统资源使用情况
    async getSystemMetrics() {
        const cpuUsage = os.loadavg()[0];
        const totalMemory = os.totalmem();
        const freeMemory = os.freemem();
        const memoryUsage = ((totalMemory - freeMemory) / totalMemory * 100).toFixed(2);

        // Redis指标
        let redisInfo = {};
        try {
            const info = await this.redisClient.info();
            redisInfo = {
                connectedClients: info.connected_clients,
                usedMemory: info.used_memory_human,
                totalConnections: info.total_connections_received
            };
        } catch (error) {
            console.error('获取Redis指标失败:', error);
        }

        // 计算平均响应时间
        const avgResponseTime = this.metrics.responseTimes.length > 0
            ? (this.metrics.responseTimes.reduce((a, b) => a + b, 0) / this.metrics.responseTimes.length).toFixed(2)
            : 0;

        return {
            uptime: Math.floor((Date.now() - this.metrics.startTime) / 1000),
            cpuUsage: cpuUsage.toFixed(2),
            memoryUsage: memoryUsage,
            totalRequests: this.metrics.requests,
            totalErrors: this.metrics.errors,
            averageResponseTime: avgResponseTime,
            activeConnections: this.metrics.responseTimes.length,
            redis: redisInfo
        };
    }

    // 监控中间件
    middleware() {
        return async (req, res, next) => {
            const start = Date.now();

            // 捕获响应完成事件
            res.on('finish', () => {
                const duration = Date.now() - start;
                this.logRequest(duration);

                if (res.statusCode >= 400) {
                    this.logError();
                }
            });

            next();
        };
    }

    // 备份指标数据
    async backupMetrics() {
        try {
            const metrics = await this.getSystemMetrics();
            await this.redisClient.set(
                `metrics:${Date.now()}`,
                JSON.stringify(metrics),
                'EX',
                86400 // 24小时过期
            );
        } catch (error) {
            console.error('备份指标数据失败:', error);
        }
    }

    // 启动定期备份
    startPeriodicBackup(interval = 3600000) { // 默认每小时备份
        setInterval(() => this.backupMetrics(), interval);
    }
}

module.exports = new SystemMonitor();
