// Browser Compatibility Polyfills for Privacy Tax Calculator
// Ensures compatibility with older browsers and environments

(function(global) {
    'use strict';

    // Core-js style polyfills for essential features
    
    // 1. Promise polyfill
    if (typeof Promise === 'undefined') {
        global.Promise = function(executor) {
            var self = this;
            this.state = 'pending';
            this.value = undefined;
            this.handlers = [];
            
            function resolve(result) {
                if (self.state === 'pending') {
                    self.state = 'fulfilled';
                    self.value = result;
                    self.handlers.forEach(handle);
                    self.handlers = null;
                }
            }
            
            function reject(error) {
                if (self.state === 'pending') {
                    self.state = 'rejected';
                    self.value = error;
                    self.handlers.forEach(handle);
                    self.handlers = null;
                }
            }
            
            function handle(handler) {
                if (self.state === 'pending') {
                    self.handlers.push(handler);
                } else {
                    if (self.state === 'fulfilled' && typeof handler.onFulfilled === 'function') {
                        handler.onFulfilled(self.value);
                    }
                    if (self.state === 'rejected' && typeof handler.onRejected === 'function') {
                        handler.onRejected(self.value);
                    }
                }
            }
            
            this.then = function(onFulfilled, onRejected) {
                return new Promise(function(resolve, reject) {
                    handle({
                        onFulfilled: function(result) {
                            try {
                                resolve(onFulfilled ? onFulfilled(result) : result);
                            } catch (ex) {
                                reject(ex);
                            }
                        },
                        onRejected: function(error) {
                            try {
                                resolve(onRejected ? onRejected(error) : error);
                            } catch (ex) {
                                reject(ex);
                            }
                        }
                    });
                });
            };
            
            this.catch = function(onRejected) {
                return this.then(null, onRejected);
            };
            
            try {
                executor(resolve, reject);
            } catch (ex) {
                reject(ex);
            }
        };
        
        Promise.resolve = function(value) {
            return new Promise(function(resolve) {
                resolve(value);
            });
        };
        
        Promise.reject = function(error) {
            return new Promise(function(resolve, reject) {
                reject(error);
            });
        };
        
        Promise.all = function(promises) {
            return new Promise(function(resolve, reject) {
                var result = [];
                var remaining = promises.length;
                
                if (remaining === 0) {
                    resolve(result);
                    return;
                }
                
                promises.forEach(function(promise, index) {
                    Promise.resolve(promise).then(function(value) {
                        result[index] = value;
                        remaining--;
                        if (remaining === 0) {
                            resolve(result);
                        }
                    }, reject);
                });
            });
        };
    }
    
    // 2. Fetch API polyfill (basic)
    if (typeof fetch === 'undefined') {
        global.fetch = function(url, options) {
            return new Promise(function(resolve, reject) {
                var xhr = new XMLHttpRequest();
                options = options || {};
                
                xhr.open(options.method || 'GET', url, true);
                
                if (options.headers) {
                    Object.keys(options.headers).forEach(function(key) {
                        xhr.setRequestHeader(key, options.headers[key]);
                    });
                }
                
                xhr.onload = function() {
                    resolve({
                        status: xhr.status,
                        statusText: xhr.statusText,
                        text: function() {
                            return Promise.resolve(xhr.responseText);
                        },
                        json: function() {
                            return Promise.resolve(JSON.parse(xhr.responseText));
                        }
                    });
                };
                
                xhr.onerror = function() {
                    reject(new Error('Network error'));
                };
                
                xhr.send(options.body || null);
            });
        };
    }
    
    // 3. Object.assign polyfill
    if (!Object.assign) {
        Object.assign = function(target) {
            if (target == null) {
                throw new TypeError('Cannot convert undefined or null to object');
            }
            var to = Object(target);
            for (var index = 1; index < arguments.length; index++) {
                var nextSource = arguments[index];
                if (nextSource != null) {
                    for (var nextKey in nextSource) {
                        if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                            to[nextKey] = nextSource[nextKey];
                        }
                    }
                }
            }
            return to;
        };
    }
    
    // 4. Array methods polyfills
    if (!Array.from) {
        Array.from = function(arrayLike, mapFn, thisArg) {
            var C = this;
            var items = Object(arrayLike);
            var len = parseInt(items.length) || 0;
            var A = typeof C === 'function' ? Object(new C(len)) : new Array(len);
            var k = 0;
            while (k < len) {
                var kValue = items[k];
                if (mapFn) {
                    A[k] = typeof thisArg === 'undefined' ? mapFn(kValue, k) : mapFn.call(thisArg, kValue, k);
                } else {
                    A[k] = kValue;
                }
                k++;
            }
            A.length = len;
            return A;
        };
    }
    
    if (!Array.prototype.includes) {
        Array.prototype.includes = function(searchElement, fromIndex) {
            var O = Object(this);
            var len = parseInt(O.length) || 0;
            if (len === 0) return false;
            var n = parseInt(fromIndex) || 0;
            var k = n >= 0 ? n : Math.max(len + n, 0);
            while (k < len) {
                if (O[k] === searchElement) return true;
                k++;
            }
            return false;
        };
    }
    
    // 5. String methods polyfills
    if (!String.prototype.includes) {
        String.prototype.includes = function(search, start) {
            if (typeof start !== 'number') start = 0;
            return this.indexOf(search, start) !== -1;
        };
    }
    
    if (!String.prototype.startsWith) {
        String.prototype.startsWith = function(searchString, position) {
            position = position || 0;
            return this.substr(position, searchString.length) === searchString;
        };
    }
    
    if (!String.prototype.endsWith) {
        String.prototype.endsWith = function(searchString, length) {
            if (typeof length === 'undefined' || length > this.length) {
                length = this.length;
            }
            return this.substring(length - searchString.length, length) === searchString;
        };
    }
    
    // 6. Performance API polyfill
    if (!global.performance) {
        global.performance = {};
    }
    if (!global.performance.now) {
        var startTime = Date.now();
        global.performance.now = function() {
            return Date.now() - startTime;
        };
    }
    
    // 7. Console polyfill for older browsers
    if (!global.console) {
        global.console = {
            log: function() {},
            error: function() {},
            warn: function() {},
            info: function() {},
            debug: function() {},
            trace: function() {}
        };
    }
    
    // 8. RequestAnimationFrame polyfill
    if (!global.requestAnimationFrame) {
        global.requestAnimationFrame = function(callback) {
            return setTimeout(callback, 16);
        };
        global.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
    }
    
    // 9. CustomEvent polyfill
    if (!global.CustomEvent || typeof global.CustomEvent !== 'function') {
        global.CustomEvent = function(event, params) {
            params = params || { bubbles: false, cancelable: false, detail: null };
            var evt = document.createEvent('CustomEvent');
            evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
            return evt;
        };
    }
    
    // 10. BigInt detection (for ethers.js compatibility)
    if (typeof BigInt === 'undefined') {
        console.warn('BigInt is not supported in this browser. Some features may not work.');
        // Simple BigInt polyfill for basic operations
        global.BigInt = function(value) {
            if (typeof value === 'number' && Number.isInteger(value)) {
                return { 
                    value: value,
                    toString: function() { return this.value.toString(); }
                };
            }
            throw new Error('BigInt polyfill: Invalid input');
        };
    }
    
    console.log('✅ Browser compatibility polyfills loaded');
    
})(typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : this);