describe("Utilities", function () {
    describe("Clone list", function () {
        it("should create a copy of the given list", function () {
            var input = [1, 2, 3],
                output;

            output = rasterizeHTML.util.cloneArray(input);

            expect(input).toEqual(output);
            expect(input).not.toBe(output);
        });
    });

    describe("Join URL", function () {
        it("should append the url to a directory-only base", function () {
            var url = rasterizeHTML.util.joinUrl("rel/path/", "the_relative_url");
            expect(url).toEqual("rel/path/the_relative_url");
        });

        it("should append the url to a file base", function () {
            var url = rasterizeHTML.util.joinUrl("rel/path/something", "the_relative_url");
            expect(url).toEqual("rel/path/the_relative_url");
        });

        it("should merge ../ with a directory-only base", function () {
            var url = rasterizeHTML.util.joinUrl("rel/path/", "../the_relative_url");
            expect(url).toEqual("rel/the_relative_url");
        });

        it("should just return the url if absolute", function () {
            var url = rasterizeHTML.util.joinUrl("rel/path/", "/the_relative_url");
            expect(url).toEqual("/the_relative_url");
        });

        it("should combine a url starting with '/' with the host of the base", function () {
            var url = rasterizeHTML.util.joinUrl("http://example.com/rel/path/", "/the_relative_url");
            expect(url).toEqual("http://example.com/the_relative_url");
        });

        it("should ignore base with an absolute url", function () {
            var url = rasterizeHTML.util.joinUrl("http://example.com/rel/path/", "http://github.com//the_relative_url");
            expect(url).toEqual("http://github.com//the_relative_url");
        });

        it("should ignore base without directories", function () {
            var url = rasterizeHTML.util.joinUrl("aFile", "anotherFile");
            expect(url).toEqual("anotherFile");
        });
    });

    describe("Data URI handling", function () {
        it("should report data URI", function () {
            expect(rasterizeHTML.util.isDataUri('data:image/png;base64,soMEfAkebASE64=')).toBeTruthy();
        });

        it("should handle single quotes", function () {
            expect(rasterizeHTML.util.isDataUri('path/file.png')).toBeFalsy();
        });
    });

    describe("Mapping", function () {
        it("should map each value to one function call and then call complete function", function () {
            var completedValues = [],
                completed = false;

            rasterizeHTML.util.map([1, 2, 3], function (val, callback) {
                completedValues.push(val);

                callback();
            }, function () {
                completed = true;
            });

            expect(completed).toBeTruthy();
            expect(completedValues).toEqual([1, 2, 3]);
        });

        it("should pass computed results as array to complete function", function () {
            var computedResults = null;

            rasterizeHTML.util.map([1, 2, 3], function (val, callback) {
                callback(val + 1);
            }, function (results) {
                computedResults = results;
            });

            expect(computedResults).toEqual([2, 3, 4]);
        });

        it("should pass computed results in the right order to complete function", function () {
            var computedResults = null,
                late2ndCallback = null;

            rasterizeHTML.util.map([1, 2, 3], function (val, callback) {

                if (val === 2) {
                    late2ndCallback = callback;
                } else {
                    callback(val + 1);
                }
            }, function (results) {
                computedResults = results;
            });

            late2ndCallback(2 + 1);

            expect(computedResults).toEqual([2, 3, 4]);
        });

        it("should call complete if empty list is passed", function () {
            var completed = false,
                computedResults = null;

            rasterizeHTML.util.map([], function (val, callback) {}, function (results) {
                completed = true;
                computedResults = results;
            });

            expect(completed).toBeTruthy();
            expect(computedResults).toEqual([]);
        });

        it("should not call complete until last value is handled", function () {
            var completedValues = [],
                completed = false,
                lastCallback = null;

            rasterizeHTML.util.map([1, 2, 3], function (val, callback) {
                completedValues.push(val);

                if (val < 3) {
                    callback();
                } else {
                    lastCallback = callback;
                }
            }, function () {
                completed = true;
            });

            expect(completed).toBeFalsy();

            lastCallback();

            expect(completed).toBeTruthy();
        });

        it("should cope with parallel changes to the input list", function () {
            var input = [1, 2, 3],
                computedResults = null;

            rasterizeHTML.util.map(input, function (val, callback) {

                if (val === 2) {
                    // Remove middle element
                    input.splice(1, 1);
                }
                callback(val);
            }, function (results) {
                computedResults = results;
            });

            expect(computedResults).toEqual([1, 2, 3]);
        });

    });

    describe("Ajax", function () {
        it("should load content from a URL", function () {
            var finished = false,
                loadedContent;

            rasterizeHTML.util.ajax("fixtures/some.css", function (content) {
                loadedContent = content;
                finished = true;
            });

            waitsFor(function () {
                return finished;
            });

            runs(function () {
                expect(loadedContent).toEqual("p { font-size: 14px; }");
            });
        });

        it("should call error callback on fail", function () {
            var finished = false,
                successCallback = jasmine.createSpy("successCallback"),
                errorCallback = jasmine.createSpy("errorCallback").andCallFake(function () {
                    finished = true;
                });

            rasterizeHTML.util.ajax("non_existing_url.html", successCallback, errorCallback);

            waitsFor(function () {
                return finished;
            });

            runs(function () {
                expect(successCallback).not.toHaveBeenCalled();
                expect(errorCallback).toHaveBeenCalled();
            });
        });

        it("should load binary data", function () {
            var finished = false,
                loadedContent;

            rasterizeHTML.util.binaryAjax("fixtures/green.png", function (content) {
                loadedContent = content;
                finished = true;
            });

            waitsFor(function () {
                return finished;
            });

            runs(function () {
                expect(btoa(loadedContent)).toEqual("iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAABFElEQVR4nO3OMQ0AAAjAMPybhnsKxrHUQGc2r+iBkB4I6YGQHgjpgZAeCOmBkB4I6YGQHgjpgZAeCOmBkB4I6YGQHgjpgZAeCOmBkB4I6YGQHgjpgZAeCOmBkB4I6YGQHgjpgZAeCOmBkB4I6YGQHgjpgZAeCOmBkB4I6YGQHgjpgZAeCOmBkB4I6YGQHgjpgZAeCOmBkB4I6YGQHgjpgZAeCOmBkB4I6YGQHgjpgZAeCOmBkB4I6YGQHgjpgZAeCOmBkB4I6YGQHgjpgZAeCOmBkB4I6YGQHgjpgZAeCOmBkB4I6YGQHgjpgZAeCOmBkB4I6YGQHgjpgZAeCOmBkB4I6YGQHgjpgZAeCOmBkB4I6YHAAV821mT1w27RAAAAAElFTkSuQmCC");
            });
        });
    });

    describe("CSS URL extraction", function () {
        it("should extract a CSS URL", function () {
            var url = rasterizeHTML.util.extractCssUrl('url(path/file.png)');
            expect(url).toEqual("path/file.png");
        });

        it("should handle double quotes", function () {
            var url = rasterizeHTML.util.extractCssUrl('url("path/file.png")');
            expect(url).toEqual("path/file.png");
        });

        it("should handle single quotes", function () {
            var url = rasterizeHTML.util.extractCssUrl("url('path/file.png')");
            expect(url).toEqual("path/file.png");
        });

        it("should extract a data URI", function () {
            var url = rasterizeHTML.util.extractCssUrl('url("data:image/png;base64,soMEfAkebASE64=")');
            expect(url).toEqual("data:image/png;base64,soMEfAkebASE64=");
        });

        it("should throw an exception on invalid CSS URL", function () {
            expect(function () {
                rasterizeHTML.util.extractCssUrl('invalid_stuff');
            }).toThrow(new Error("Invalid url"));
        });
    });
});