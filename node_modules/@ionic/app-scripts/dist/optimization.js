"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = require("path");
var MagicString = require("magic-string");
var logger_1 = require("./logger/logger");
var config_1 = require("./util/config");
var Constants = require("./util/constants");
var errors_1 = require("./util/errors");
var helpers_1 = require("./util/helpers");
var webpack_1 = require("./webpack");
var decorators_1 = require("./optimization/decorators");
var treeshake_1 = require("./optimization/treeshake");
function optimization(context, configFile) {
    var logger = new logger_1.Logger("optimization");
    return optimizationWorker(context, configFile).then(function () {
        logger.finish();
    })
        .catch(function (err) {
        var error = new errors_1.BuildError(err.message);
        error.isFatal = true;
        throw logger.fail(error);
    });
}
exports.optimization = optimization;
function optimizationWorker(context, configFile) {
    var webpackConfig = getConfig(context, configFile);
    var dependencyMap = null;
    if (optimizationEnabled()) {
        return webpack_1.runWebpackFullBuild(webpackConfig).then(function (stats) {
            dependencyMap = helpers_1.webpackStatsToDependencyMap(context, stats);
            if (helpers_1.getBooleanPropertyValue(Constants.ENV_PRINT_ORIGINAL_DEPENDENCY_TREE)) {
                logger_1.Logger.debug('Original Dependency Map Start');
                helpers_1.printDependencyMap(dependencyMap);
                logger_1.Logger.debug('Original Dependency Map End');
            }
            purgeGeneratedFiles(context, webpackConfig.output.filename);
        }).then(function () {
            return doOptimizations(context, dependencyMap);
        });
    }
    else {
        return Promise.resolve();
    }
}
function purgeGeneratedFiles(context, fileNameSuffix) {
    var buildFiles = context.fileCache.getAll().filter(function (file) { return file.path.indexOf(context.buildDir) >= 0 && file.path.indexOf(fileNameSuffix) >= 0; });
    buildFiles.forEach(function (buildFile) { return context.fileCache.remove(buildFile.path); });
}
exports.purgeGeneratedFiles = purgeGeneratedFiles;
function doOptimizations(context, dependencyMap) {
    // remove decorators
    var modifiedMap = new Map(dependencyMap);
    if (helpers_1.getBooleanPropertyValue(Constants.ENV_PURGE_DECORATORS)) {
        removeDecorators(context);
    }
    // remove unused component imports
    if (helpers_1.getBooleanPropertyValue(Constants.ENV_EXPERIMENTAL_MANUAL_TREESHAKING)) {
        var results = treeshake_1.calculateUnusedComponents(modifiedMap);
        purgeUnusedImports(context, results.purgedModules);
    }
    if (helpers_1.getBooleanPropertyValue(Constants.ENV_PRINT_MODIFIED_DEPENDENCY_TREE)) {
        logger_1.Logger.debug('Modified Dependency Map Start');
        helpers_1.printDependencyMap(modifiedMap);
        logger_1.Logger.debug('Modified Dependency Map End');
    }
    return modifiedMap;
}
exports.doOptimizations = doOptimizations;
function optimizationEnabled() {
    var purgeDecorators = helpers_1.getBooleanPropertyValue(Constants.ENV_PURGE_DECORATORS);
    var manualTreeshaking = helpers_1.getBooleanPropertyValue(Constants.ENV_EXPERIMENTAL_MANUAL_TREESHAKING);
    return purgeDecorators || manualTreeshaking;
}
function removeDecorators(context) {
    var jsFiles = context.fileCache.getAll().filter(function (file) { return path_1.extname(file.path) === '.js'; });
    jsFiles.forEach(function (jsFile) {
        var magicString = new MagicString(jsFile.content);
        magicString = decorators_1.purgeStaticFieldDecorators(jsFile.path, jsFile.content, helpers_1.getStringPropertyValue(Constants.ENV_VAR_IONIC_ANGULAR_DIR), helpers_1.getStringPropertyValue(Constants.ENV_VAR_AT_ANGULAR_DIR), context.srcDir, magicString);
        magicString = decorators_1.purgeStaticCtorFields(jsFile.path, jsFile.content, helpers_1.getStringPropertyValue(Constants.ENV_VAR_IONIC_ANGULAR_DIR), helpers_1.getStringPropertyValue(Constants.ENV_VAR_AT_ANGULAR_DIR), context.srcDir, magicString);
        magicString = decorators_1.purgeTranspiledDecorators(jsFile.path, jsFile.content, helpers_1.getStringPropertyValue(Constants.ENV_VAR_IONIC_ANGULAR_DIR), helpers_1.getStringPropertyValue(Constants.ENV_VAR_AT_ANGULAR_DIR), context.srcDir, magicString);
        magicString = decorators_1.addPureAnnotation(jsFile.path, jsFile.content, helpers_1.getStringPropertyValue(Constants.ENV_VAR_IONIC_ANGULAR_DIR), helpers_1.getStringPropertyValue(Constants.ENV_VAR_AT_ANGULAR_DIR), context.srcDir, magicString);
        jsFile.content = magicString.toString();
        var sourceMap = magicString.generateMap({
            source: path_1.basename(jsFile.path),
            file: path_1.basename(jsFile.path),
            includeContent: true
        });
        var sourceMapPath = jsFile.path + '.map';
        context.fileCache.set(sourceMapPath, { path: sourceMapPath, content: sourceMap.toString() });
    });
}
function purgeUnusedImports(context, purgeDependencyMap) {
    // for now, restrict this to components in the ionic-angular/index.js file
    var indexFilePath = process.env[Constants.ENV_VAR_IONIC_ANGULAR_ENTRY_POINT];
    var file = context.fileCache.get(indexFilePath);
    if (!file) {
        throw new Error("Could not find ionic-angular index file " + indexFilePath);
    }
    var modulesToPurge = [];
    purgeDependencyMap.forEach(function (set, moduleToPurge) {
        modulesToPurge.push(moduleToPurge);
    });
    var updatedFileContent = treeshake_1.purgeUnusedImportsAndExportsFromIndex(indexFilePath, file.content, modulesToPurge);
    context.fileCache.set(indexFilePath, { path: indexFilePath, content: updatedFileContent });
    attemptToPurgeUnusedProvider(context, purgeDependencyMap, process.env[Constants.ENV_ACTION_SHEET_CONTROLLER_PATH], process.env[Constants.ENV_ACTION_SHEET_VIEW_CONTROLLER_PATH], process.env[Constants.ENV_ACTION_SHEET_COMPONENT_FACTORY_PATH], process.env[Constants.ENV_ACTION_SHEET_CONTROLLER_CLASSNAME]);
    attemptToPurgeUnusedProvider(context, purgeDependencyMap, process.env[Constants.ENV_ALERT_CONTROLLER_PATH], process.env[Constants.ENV_ALERT_VIEW_CONTROLLER_PATH], process.env[Constants.ENV_ALERT_COMPONENT_FACTORY_PATH], process.env[Constants.ENV_ALERT_CONTROLLER_CLASSNAME]);
    attemptToPurgeUnusedProvider(context, purgeDependencyMap, process.env[Constants.ENV_LOADING_CONTROLLER_PATH], process.env[Constants.ENV_LOADING_VIEW_CONTROLLER_PATH], process.env[Constants.ENV_LOADING_COMPONENT_FACTORY_PATH], process.env[Constants.ENV_LOADING_CONTROLLER_CLASSNAME]);
    attemptToPurgeUnusedProvider(context, purgeDependencyMap, process.env[Constants.ENV_MODAL_CONTROLLER_PATH], process.env[Constants.ENV_MODAL_VIEW_CONTROLLER_PATH], process.env[Constants.ENV_MODAL_COMPONENT_FACTORY_PATH], process.env[Constants.ENV_MODAL_CONTROLLER_CLASSNAME]);
    attemptToPurgeUnusedProvider(context, purgeDependencyMap, process.env[Constants.ENV_PICKER_CONTROLLER_PATH], process.env[Constants.ENV_PICKER_VIEW_CONTROLLER_PATH], process.env[Constants.ENV_PICKER_COMPONENT_FACTORY_PATH], process.env[Constants.ENV_PICKER_CONTROLLER_CLASSNAME]);
    attemptToPurgeUnusedProvider(context, purgeDependencyMap, process.env[Constants.ENV_POPOVER_CONTROLLER_PATH], process.env[Constants.ENV_POPOVER_VIEW_CONTROLLER_PATH], process.env[Constants.ENV_POPOVER_COMPONENT_FACTORY_PATH], process.env[Constants.ENV_POPOVER_CONTROLLER_CLASSNAME]);
    attemptToPurgeUnusedProvider(context, purgeDependencyMap, process.env[Constants.ENV_TOAST_CONTROLLER_PATH], process.env[Constants.ENV_TOAST_VIEW_CONTROLLER_PATH], process.env[Constants.ENV_TOAST_COMPONENT_FACTORY_PATH], process.env[Constants.ENV_TOAST_CONTROLLER_CLASSNAME]);
}
function attemptToPurgeUnusedProvider(context, dependencyMap, providerPath, providerComponentPath, providerComponentFactoryPath, providerClassName) {
    if (dependencyMap.has(providerPath)) {
        // awwww yissssssss
        // first, get the content of the app module ngfactory file
        var appModuleNgFactoryPath = treeshake_1.getAppModuleNgFactoryPath();
        var file = context.fileCache.get(appModuleNgFactoryPath);
        if (!file) {
            return;
        }
        var updatedContent = treeshake_1.purgeComponentNgFactoryImportAndUsage(file.path, file.content, providerComponentFactoryPath);
        updatedContent = treeshake_1.purgeProviderControllerImportAndUsage(file.path, updatedContent, providerPath);
        context.fileCache.set(appModuleNgFactoryPath, { path: appModuleNgFactoryPath, content: updatedContent });
        // purge the provider name from the forRoot method providers list
        var indexFilePath = process.env[Constants.ENV_VAR_IONIC_ANGULAR_ENTRY_POINT];
        var ionicIndexFile = context.fileCache.get(indexFilePath);
        var newIndexFileContent = treeshake_1.purgeProviderClassNameFromIonicModuleForRoot(ionicIndexFile.content, providerClassName);
        // purge the component from the index file
        context.fileCache.set(indexFilePath, { path: indexFilePath, content: newIndexFileContent });
    }
}
function getConfig(context, configFile) {
    configFile = config_1.getUserConfigFile(context, taskInfo, configFile);
    var webpackConfig = config_1.fillConfigDefaults(configFile, taskInfo.defaultConfigFile);
    webpackConfig.entry = config_1.replacePathVars(context, webpackConfig.entry);
    webpackConfig.output.path = config_1.replacePathVars(context, webpackConfig.output.path);
    return webpackConfig;
}
exports.getConfig = getConfig;
var taskInfo = {
    fullArg: '--optimization',
    shortArg: '-dt',
    envVar: 'IONIC_DEPENDENCY_TREE',
    packageConfig: 'ionic_dependency_tree',
    defaultConfigFile: 'optimization.config'
};
