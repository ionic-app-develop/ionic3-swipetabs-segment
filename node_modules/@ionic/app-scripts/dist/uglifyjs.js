"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var path_1 = require("path");
var uglify = require("uglify-js");
var logger_1 = require("./logger/logger");
var config_1 = require("./util/config");
var helpers_1 = require("./util/helpers");
var worker_client_1 = require("./worker-client");
function uglifyjs(context, configFile) {
    configFile = config_1.getUserConfigFile(context, exports.taskInfo, configFile);
    var logger = new logger_1.Logger('uglifyjs');
    return worker_client_1.runWorker('uglifyjs', 'uglifyjsWorker', context, configFile)
        .then(function () {
        logger.finish();
    })
        .catch(function (err) {
        throw logger.fail(err);
    });
}
exports.uglifyjs = uglifyjs;
function uglifyjsWorker(context, configFile) {
    var uglifyJsConfig = config_1.fillConfigDefaults(configFile, exports.taskInfo.defaultConfigFile);
    if (!context) {
        context = config_1.generateContext(context);
    }
    return uglifyjsWorkerImpl(context, uglifyJsConfig);
}
exports.uglifyjsWorker = uglifyjsWorker;
function uglifyjsWorkerImpl(context, uglifyJsConfig) {
    return Promise.resolve().then(function () {
        // provide a full path for the config options
        var files = fs_1.readdirSync(context.buildDir);
        var promises = [];
        for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
            var file = files_1[_i];
            if (path_1.extname(file) === '.js' && file.indexOf('polyfills') === -1 && file.indexOf('sw-toolbox') === -1 && file.indexOf('.map') === -1) {
                uglifyJsConfig.sourceFile = path_1.join(context.buildDir, file);
                uglifyJsConfig.inSourceMap = path_1.join(context.buildDir, file + '.map');
                uglifyJsConfig.destFileName = path_1.join(context.buildDir, file);
                uglifyJsConfig.outSourceMap = path_1.join(context.buildDir, file + '.map');
                var minifyOutput = runUglifyInternal(uglifyJsConfig);
                promises.push(helpers_1.writeFileAsync(uglifyJsConfig.destFileName, minifyOutput.code.toString()));
                promises.push(helpers_1.writeFileAsync(uglifyJsConfig.outSourceMap, minifyOutput.map.toString()));
            }
        }
        return Promise.all(promises);
    });
}
exports.uglifyjsWorkerImpl = uglifyjsWorkerImpl;
function runUglifyInternal(uglifyJsConfig) {
    return uglify.minify(uglifyJsConfig.sourceFile, {
        compress: uglifyJsConfig.compress,
        mangle: uglifyJsConfig.mangle,
        inSourceMap: uglifyJsConfig.inSourceMap,
        outSourceMap: uglifyJsConfig.outSourceMap
    });
}
exports.taskInfo = {
    fullArg: '--uglifyjs',
    shortArg: '-u',
    envVar: 'IONIC_UGLIFYJS',
    packageConfig: 'ionic_uglifyjs',
    defaultConfigFile: 'uglifyjs.config'
};
