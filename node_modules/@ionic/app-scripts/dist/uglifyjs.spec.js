"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path_1 = require("path");
var uglifyLib = require("uglify-js");
var helpers = require("./util/helpers");
var uglifyTask = require("./uglifyjs");
describe('uglifyjs', function () {
    describe('uglifyjsWorkerImpl', function () {
        it('should call uglify for the appropriate files', function () {
            var buildDir = path_1.join('some', 'fake', 'dir', 'myApp', 'www', 'build');
            var context = {
                buildDir: buildDir
            };
            var fileNames = ['polyfills.js', 'sw-toolbox.js', '0.main.js', '0.main.js.map', '1.main.js', '1.main.js.map', 'main.js', 'main.js.map'];
            var mockMinfiedResponse = {
                code: 'code',
                map: 'map'
            };
            var mockUglifyConfig = {
                mangle: true,
                compress: true
            };
            spyOn(fs, 'readdirSync').and.returnValue(fileNames);
            var uglifySpy = spyOn(uglifyLib, 'minify').and.returnValue(mockMinfiedResponse);
            var writeFileSpy = spyOn(helpers, helpers.writeFileAsync.name).and.returnValue(Promise.resolve());
            var promise = uglifyTask.uglifyjsWorkerImpl(context, mockUglifyConfig);
            return promise.then(function () {
                expect(uglifyLib.minify).toHaveBeenCalledTimes(3);
                expect(uglifySpy.calls.all()[0].args[0]).toEqual(path_1.join(buildDir, '0.main.js'));
                expect(uglifySpy.calls.all()[0].args[1].compress).toEqual(true);
                expect(uglifySpy.calls.all()[0].args[1].mangle).toEqual(true);
                expect(uglifySpy.calls.all()[0].args[1].inSourceMap).toEqual(path_1.join(buildDir, '0.main.js.map'));
                expect(uglifySpy.calls.all()[0].args[1].outSourceMap).toEqual(path_1.join(buildDir, '0.main.js.map'));
                expect(uglifySpy.calls.all()[1].args[0]).toEqual(path_1.join(buildDir, '1.main.js'));
                expect(uglifySpy.calls.all()[1].args[1].compress).toEqual(true);
                expect(uglifySpy.calls.all()[1].args[1].mangle).toEqual(true);
                expect(uglifySpy.calls.all()[1].args[1].inSourceMap).toEqual(path_1.join(buildDir, '1.main.js.map'));
                expect(uglifySpy.calls.all()[1].args[1].outSourceMap).toEqual(path_1.join(buildDir, '1.main.js.map'));
                expect(uglifySpy.calls.all()[2].args[0]).toEqual(path_1.join(buildDir, 'main.js'));
                expect(uglifySpy.calls.all()[2].args[1].compress).toEqual(true);
                expect(uglifySpy.calls.all()[2].args[1].mangle).toEqual(true);
                expect(uglifySpy.calls.all()[2].args[1].inSourceMap).toEqual(path_1.join(buildDir, 'main.js.map'));
                expect(uglifySpy.calls.all()[2].args[1].outSourceMap).toEqual(path_1.join(buildDir, 'main.js.map'));
                expect(writeFileSpy).toHaveBeenCalledTimes(6);
                expect(writeFileSpy.calls.all()[0].args[0]).toEqual(path_1.join(buildDir, '0.main.js'));
                expect(writeFileSpy.calls.all()[0].args[1]).toEqual(mockMinfiedResponse.code);
                expect(writeFileSpy.calls.all()[1].args[0]).toEqual(path_1.join(buildDir, '0.main.js.map'));
                expect(writeFileSpy.calls.all()[1].args[1]).toEqual(mockMinfiedResponse.map);
                expect(writeFileSpy.calls.all()[2].args[0]).toEqual(path_1.join(buildDir, '1.main.js'));
                expect(writeFileSpy.calls.all()[2].args[1]).toEqual(mockMinfiedResponse.code);
                expect(writeFileSpy.calls.all()[3].args[0]).toEqual(path_1.join(buildDir, '1.main.js.map'));
                expect(writeFileSpy.calls.all()[3].args[1]).toEqual(mockMinfiedResponse.map);
                expect(writeFileSpy.calls.all()[4].args[0]).toEqual(path_1.join(buildDir, 'main.js'));
                expect(writeFileSpy.calls.all()[4].args[1]).toEqual(mockMinfiedResponse.code);
                expect(writeFileSpy.calls.all()[5].args[0]).toEqual(path_1.join(buildDir, 'main.js.map'));
                expect(writeFileSpy.calls.all()[5].args[1]).toEqual(mockMinfiedResponse.map);
            });
        });
    });
});
