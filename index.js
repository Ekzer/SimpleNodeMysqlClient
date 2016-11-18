/**
 * Created by vives_j on 17/11/2016.
 */

'use strict';

/**
 * The main object. During its construction, it requires a mysql config's json file and initialize connection
 * It is simply an overload of the official node-mysql.
 * @constructor
 */

module.exports = function (mysqlConfigFilename) {
    var SimpleNodeMysqlClient = function (mysqlConfigFilename) {
        /**
         * Mysql's config
         * @type {JSON}
         * @private
         */
        var mysqlConfig = require(mysqlConfigFilename);

        /**
         * Async instance
         * @type {Async}
         * @priviliged
         */

        this._asyncInstance = require('async');

        /**
         * Node-mysql instance
         * @type {Connection}
         * @priviliged
         */

        this._mysqlInstance = require('mysql').createConnection(mysqlConfig);
    };

    /**
     * Closes mysql connexion
     * @param options {Object|Null} - optional
     * @param callback {Function|Null} - optional
     */
    SimpleNodeMysqlClient.prototype.end = function (options, callback) {
        this._mysqlInstance.end(options, callback);
    };

    /**
     * Returns mysql's instance.
     * @returns {Connection}
     */

    SimpleNodeMysqlClient.prototype.getMysqlInstance = function () {
        return this._mysqlInstance;
    };
    /**
     * Returns mysql's hostname
     * @returns {string|string}
     */

    SimpleNodeMysqlClient.prototype.getDbHost = function () {
        return this._mysqlInstance.config.host;
    };

    /**
     * Returns mysql's user
     * @returns {string|string}
     */

    SimpleNodeMysqlClient.prototype.getDbUser = function () {
        return this._mysqlInstance.config.user;
    };

    /**
     * Returns mysql's password
     * @returns {string|string|boolean|*|string}
     */

    SimpleNodeMysqlClient.prototype.getDbPassword = function () {
        return this._mysqlInstance.config.password;
    };

    /**
     * Returns database's name
     * @returns {*|string|string}
     */

    SimpleNodeMysqlClient.prototype.getDbName = function () {
        return this._mysqlInstance.config.database;
    };

    /**
     * Check if it is a single query.
     * Ex :
     * "SELECT * FROM `user` WHERE `id` = 49;" -> {true}
     * "SELECT * FROM `user` WHERE `id` = 49; SELECT `description` FROM `articles` WHERE `author` = foo;" -> {false}
     * @param str
     * @returns {boolean}
     */

    SimpleNodeMysqlClient.prototype.isSingleQuery = function (str) {
        return (str.constructor === String && str.match(/;/g).length  === 1) ? (true) : (false);
    };

    /**
     * Internal function. Please use query() method !
     * Simple overload of the real query method.
     * @param query {String}
     * @param callback {function}
     * @returns {RowDataPacket}
     */

    SimpleNodeMysqlClient.prototype._simpleQuery = function (query, callback) {
        this._mysqlInstance.query(query, function (err, results) {
            if (err) {
                return callback(err, null);
            } else {
                return callback(null, results);
            }
        });
    };

    /**
     * Internal function. Please use query() method !
     * Execute multiple queries threw a mysql transaction.
     * On error, it cancels properly the transaction and returns the result.
     * @param queries {String}
     * @param callback {function}
     * @returns {RowDataPacket}
     */

    SimpleNodeMysqlClient.prototype._multipleQueries = function (queries, callback) {
        var self = this;
        this._mysqlInstance.beginTransaction(function (err) {
            if (err) {
                return callback(err, null);
            } else {
                self._mysqlInstance.query(queries, function (err, results) {
                    if (err) {
                        return self._mysqlInstance.rollback(function (err) {
                            return callback(err, null);
                        });
                    } else {
                        self._mysqlInstance.commit(function(err){
                            if(err) {
                                return connection.rollback(function() {
                                    throw err;
                                });
                            } else {
                                return callback(null, results);
                            }
                        });
                    }
                });
            }
        });
    };

    /**
     * Execute mysql query recursively. It can take an array of queries or simply a string. As you want !
     * It uses async to execute synchronously queries.
     * @param queries {Array|String}
     * @param process {Object|Null}
     * @param callback {Function}
     * @returns {RowDataPacket}
     */

    SimpleNodeMysqlClient.prototype.query = function (queries, process, callback) {
        var currentProcess;
        if (callback==null || callback==undefined)
        {
            callback = process;
            currentProcess = this;
            process = null;
        }
        if (process==null)
        {
            if (this.parentProcess) {
                currentProcess = this.parentProcess;
            } else {
                currentProcess = this;
            }
        } else {
            currentProcess = process;
        }

        var errorsList=[];
        var resultsList=[];
        if (queries.constructor === Array) {
            this._asyncInstance.map(queries,currentProcess.query.bind({parentProcess : currentProcess}) ,function(err,results) {
                if (err) {
                    errorsList.push(err);
                } else {
                    results.forEach(function (element) {
                        resultsList.push(element);
                    });
                }
                if(errorsList.length>0){return callback(errorsList,resultsList);}
                else{return callback(null,resultsList); }
            });
        } else {
            if (currentProcess.isSingleQuery(queries)) {
                currentProcess._simpleQuery(queries, function (err, results) {
                    if (err) {
                        return callback(err, null);
                    } else {
                        return callback(null, results);
                    }
                });
            } else {
                currentProcess._multipleQueries(queries, function (err, results) {
                    if (err) {
                        return callback(err, null);
                    } else {
                        var finalResults = [];
                        results.forEach(function (element) {
                            if (element.constructor === Array && element.length === 1) {
                                finalResults.push(element[0]);
                            } else {
                                finalResults.push(element);
                            }
                        });
                        return callback(null, finalResults);
                    }
                });
            }
        }
    };
    return new SimpleNodeMysqlClient(mysqlConfigFilename);
};
