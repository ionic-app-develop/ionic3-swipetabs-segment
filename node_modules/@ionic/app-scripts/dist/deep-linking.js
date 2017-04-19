"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var logger_1 = require("./logger/logger");
var Constants = require("./util/constants");
var errors_1 = require("./util/errors");
var helpers_1 = require("./util/helpers");
var interfaces_1 = require("./util/interfaces");
var util_1 = require("./deep-linking/util");
/*
 * We want to cache a local, in-memory copy of the App's main NgModule file content.
 * Each time we do a build, a new DeepLinkConfig is generated and inserted into the
 * app's main NgModule. By keeping a copy of the original and using it to determine
 * if the developer had an existing config, we will get an accurate answer where
 * as the cached version of the App's main NgModule content will basically always
 * have a generated deep likn config in it.
*/
var cachedUnmodifiedAppNgModuleFileContent = null;
function deepLinking(context) {
    var logger = new logger_1.Logger("deeplinks");
    return deepLinkingWorker(context).then(function (deepLinkConfigEntries) {
        helpers_1.setParsedDeepLinkConfig(deepLinkConfigEntries);
        logger.finish();
    })
        .catch(function (err) {
        var error = new errors_1.BuildError(err.message);
        error.isFatal = true;
        throw logger.fail(error);
    });
}
exports.deepLinking = deepLinking;
function deepLinkingWorker(context) {
    return deepLinkingWorkerImpl(context, null);
}
function deepLinkingWorkerImpl(context, changedFiles) {
    return Promise.resolve().then(function () {
        var appNgModulePath = helpers_1.getStringPropertyValue(Constants.ENV_APP_NG_MODULE_PATH);
        var appNgModuleFile = context.fileCache.get(appNgModulePath);
        if (!cachedUnmodifiedAppNgModuleFileContent) {
            cachedUnmodifiedAppNgModuleFileContent = appNgModuleFile.content;
        }
        var deepLinkConfigEntries = util_1.getDeepLinkData(appNgModulePath, context.fileCache, context.runAot);
        var hasExisting = util_1.hasExistingDeepLinkConfig(appNgModulePath, cachedUnmodifiedAppNgModuleFileContent);
        if (!hasExisting && deepLinkConfigEntries && deepLinkConfigEntries.length) {
            // only update the app's main ngModule if there isn't an existing config
            var deepLinkString = util_1.convertDeepLinkConfigEntriesToString(deepLinkConfigEntries);
            util_1.updateAppNgModuleAndFactoryWithDeepLinkConfig(context, deepLinkString, changedFiles, context.runAot);
        }
        return deepLinkConfigEntries;
    });
}
exports.deepLinkingWorkerImpl = deepLinkingWorkerImpl;
function deepLinkingUpdate(changedFiles, context) {
    if (context.deepLinkState === interfaces_1.BuildState.RequiresBuild) {
        return deepLinkingWorkerFullUpdate(context);
    }
    else {
        return deepLinkingUpdateImpl(changedFiles, context);
    }
}
exports.deepLinkingUpdate = deepLinkingUpdate;
function deepLinkingUpdateImpl(changedFiles, context) {
    var tsFiles = changedFiles.filter(function (changedFile) { return changedFile.ext === '.ts'; });
    if (tsFiles.length === 0) {
        return Promise.resolve();
    }
    var logger = new logger_1.Logger('deeplinks update');
    return deepLinkingWorkerImpl(context, changedFiles).then(function (deepLinkConfigEntries) {
        helpers_1.setParsedDeepLinkConfig(deepLinkConfigEntries);
        logger.finish();
    }).catch(function (err) {
        logger_1.Logger.warn(err.message);
        var error = new errors_1.BuildError(err.message);
        throw logger.fail(error);
    });
}
exports.deepLinkingUpdateImpl = deepLinkingUpdateImpl;
function deepLinkingWorkerFullUpdate(context) {
    var logger = new logger_1.Logger("deeplinks update");
    return deepLinkingWorker(context).then(function (deepLinkConfigEntries) {
        helpers_1.setParsedDeepLinkConfig(deepLinkConfigEntries);
        logger.finish();
    })
        .catch(function (err) {
        logger_1.Logger.warn(err.message);
        var error = new errors_1.BuildError(err.message);
        throw logger.fail(error);
    });
}
exports.deepLinkingWorkerFullUpdate = deepLinkingWorkerFullUpdate;
