"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = require("path");
var deepLinking = require("./deep-linking");
var deeplinkUtils = require("./deep-linking/util");
var Constants = require("./util/constants");
var file_cache_1 = require("./util/file-cache");
var helpers = require("./util/helpers");
describe('Deep Linking task', function () {
    describe('deepLinkingWorkerImpl', function () {
        it('should not update app ngmodule when it has an existing deeplink config', function () {
            var appNgModulePath = path_1.join('some', 'fake', 'path', 'myApp', 'src', 'app', 'app.module.ts');
            var context = {
                fileCache: new file_cache_1.FileCache()
            };
            var knownFileContent = 'someFileContent';
            var knownDeepLinkString = 'someDeepLinkString';
            context.fileCache.set(appNgModulePath, { path: appNgModulePath, content: knownFileContent });
            spyOn(helpers, helpers.getStringPropertyValue.name).and.returnValue(appNgModulePath);
            spyOn(deeplinkUtils, deeplinkUtils.getDeepLinkData.name).and.returnValue([1]);
            spyOn(deeplinkUtils, deeplinkUtils.hasExistingDeepLinkConfig.name).and.returnValue(true);
            spyOn(deeplinkUtils, deeplinkUtils.convertDeepLinkConfigEntriesToString.name).and.returnValue(knownDeepLinkString);
            spyOn(deeplinkUtils, deeplinkUtils.updateAppNgModuleAndFactoryWithDeepLinkConfig.name);
            var promise = deepLinking.deepLinkingWorkerImpl(context, null);
            return promise.then(function () {
                expect(deeplinkUtils.convertDeepLinkConfigEntriesToString).not.toHaveBeenCalled();
                expect(deeplinkUtils.updateAppNgModuleAndFactoryWithDeepLinkConfig).not.toHaveBeenCalled();
            });
        });
        it('should not update app ngmodule when no deeplinks were found', function () {
            var appNgModulePath = path_1.join('some', 'fake', 'path', 'myApp', 'src', 'app', 'app.module.ts');
            var context = {
                fileCache: new file_cache_1.FileCache()
            };
            var knownFileContent = 'someFileContent';
            var knownDeepLinkString = 'someDeepLinkString';
            context.fileCache.set(appNgModulePath, { path: appNgModulePath, content: knownFileContent });
            spyOn(helpers, helpers.getStringPropertyValue.name).and.returnValue(appNgModulePath);
            spyOn(deeplinkUtils, deeplinkUtils.getDeepLinkData.name).and.returnValue([]);
            spyOn(deeplinkUtils, deeplinkUtils.hasExistingDeepLinkConfig.name).and.returnValue(false);
            spyOn(deeplinkUtils, deeplinkUtils.convertDeepLinkConfigEntriesToString.name).and.returnValue(knownDeepLinkString);
            spyOn(deeplinkUtils, deeplinkUtils.updateAppNgModuleAndFactoryWithDeepLinkConfig.name);
            var promise = deepLinking.deepLinkingWorkerImpl(context, null);
            return promise.then(function () {
                expect(deeplinkUtils.convertDeepLinkConfigEntriesToString).not.toHaveBeenCalled();
                expect(deeplinkUtils.updateAppNgModuleAndFactoryWithDeepLinkConfig).not.toHaveBeenCalled();
            });
        });
        it('should update deeplink config', function () {
            var appNgModulePath = path_1.join('some', 'fake', 'path', 'myApp', 'src', 'app', 'app.module.ts');
            var context = {
                fileCache: new file_cache_1.FileCache(),
                runAot: true
            };
            var knownFileContent = 'someFileContent';
            var knownDeepLinkString = 'someDeepLinkString';
            var knownMockDeepLinkArray = [1];
            var changedFiles = [];
            context.fileCache.set(appNgModulePath, { path: appNgModulePath, content: knownFileContent });
            spyOn(helpers, helpers.getStringPropertyValue.name).and.returnValue(appNgModulePath);
            spyOn(deeplinkUtils, deeplinkUtils.getDeepLinkData.name).and.returnValue(knownMockDeepLinkArray);
            spyOn(deeplinkUtils, deeplinkUtils.hasExistingDeepLinkConfig.name).and.returnValue(false);
            spyOn(deeplinkUtils, deeplinkUtils.convertDeepLinkConfigEntriesToString.name).and.returnValue(knownDeepLinkString);
            spyOn(deeplinkUtils, deeplinkUtils.updateAppNgModuleAndFactoryWithDeepLinkConfig.name);
            var promise = deepLinking.deepLinkingWorkerImpl(context, changedFiles);
            return promise.then(function () {
                expect(helpers.getStringPropertyValue).toBeCalledWith(Constants.ENV_APP_NG_MODULE_PATH);
                expect(deeplinkUtils.getDeepLinkData).toHaveBeenCalledWith(appNgModulePath, context.fileCache, context.runAot);
                expect(deeplinkUtils.hasExistingDeepLinkConfig).toHaveBeenCalledWith(appNgModulePath, knownFileContent);
                expect(deeplinkUtils.convertDeepLinkConfigEntriesToString).toHaveBeenCalledWith(knownMockDeepLinkArray);
                expect(deeplinkUtils.updateAppNgModuleAndFactoryWithDeepLinkConfig).toHaveBeenCalledWith(context, knownDeepLinkString, changedFiles, context.runAot);
            });
        });
    });
});
