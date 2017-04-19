"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var logger_1 = require("./logger/logger");
var helpers_1 = require("./util/helpers");
var source_maps_1 = require("./util/source-maps");
var remove_unused_fonts_1 = require("./optimization/remove-unused-fonts");
var path = require("path");
function postprocess(context) {
    var logger = new logger_1.Logger("postprocess");
    return postprocessWorker(context).then(function () {
        logger.finish();
    })
        .catch(function (err) {
        throw logger.fail(err);
    });
}
exports.postprocess = postprocess;
function postprocessWorker(context) {
    return Promise.all([
        addIonicGlobal(context),
        source_maps_1.purgeSourceMapsIfNeeded(context),
        remove_unused_fonts_1.removeUnusedFonts(context)
    ]);
}
function addIonicGlobal(context) {
    var outputFilePath = path.join(context.buildDir, context.outputJsFileName);
    return helpers_1.readFileAsync(outputFilePath).then(function (outputContent) {
        var ionicGlobal = buildIonicGlobal(context);
        if (outputContent.indexOf(ionicGlobal) === -1) {
            outputContent += ionicGlobal;
            return helpers_1.writeFileAsync(outputFilePath, outputContent);
        }
    });
}
function buildIonicGlobal(context) {
    if (context.windowIonic) {
        // just a quick way to cache this to avoid unnecessary readFiles
        return context.windowIonic;
    }
    var systemData = helpers_1.getSystemData(context.rootDir);
    var output = "\n    (function(w){\n      var i = w.Ionic = w.Ionic || {};\n      " + (systemData.ionicFramework ? "i.version = '" + systemData.ionicFramework + "';" : '') + "\n      " + (systemData.angularCore ? "i.angular = '" + systemData.angularCore + "';" : '') + "\n      " + (systemData.ionicNative ? "i.ionicNative = '" + systemData.ionicNative + "';" : '') + "\n    })(window);";
    // real quick minification hack
    output = output.replace(/\s/g, '');
    output = output.replace('vari=', 'var i=');
    return context.windowIonic = "\n\n" + output;
}
