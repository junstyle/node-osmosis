/*jslint node: true */
'use strict'

var externalURLRegex = /^((http:|https:)?\/\/|[^\/\.])/

/**
 * Make an HTTP GET request.
 *
 * @function get
 * @param {(string|contextCallback)} url - An absolute or relative URL or a
 * contextCallback that calls a URL.
 * @param {object|contextCallback} [params] - HTTP GET query parameters
 * @param {function} [onLoaded] - actions after page loaded
 * @memberof Command
 * @instance
 * @see {@link Command.post}
 */

/**
 * Make an HTTP POST request.
 * @function post
 * @param {(string|contextCallback)} url - An absolute or relative URL or a
 * contextCallback that calls a URL.
 * @param {object|contextCallback} [data] - HTTP POST data
 * @memberof Command
 * @instance
 * @see {@link Command.get}
 */

function Get(context, data, next, done) {
    this.request(this.name,
        context,
        this.getURL(this.url, context, data),
        this.getParam(this.params, context, data),
        function (err, res, context) {
            if (err === null) {
                if (res.pageObj != undefined) {
                    context.pageObj = res.pageObj
                    delete res.pageObj
                }
                next(context, data)
            }

            done()
        },
        0,
        this.onLoaded != undefined ? (async page => await this.onLoaded(page, data.getObject())) : undefined
    )
}

function getParamArg(url) {
    return url
}

function getParamFunction(func, context, data) {
    var res = func(context, data.getObject())

    return res
}

function getURLArg(url) {
    return url
}

function getURLFunction(func, context, data) {
    var res = func(context, data.getObject())

    if (res.nodeType !== undefined) {
        res = getURLContext(res)
    }

    return res
}

function getURLContext(context) {
    if (context.getAttribute('href')) {
        return context.getAttribute('href')
    }

    if (context.text !== undefined) {
        return context.text()
    } else if (context.value !== undefined) {
        return context.value()
    }
}

module.exports.get = module.exports.post = function (url, query, onLoaded) {
    var args = this.args,
        urlIsFunction = typeof url === 'function',
        queryIsFunction = typeof query === 'function'

    if (typeof args[3] === 'object' || typeof args[4] === 'object') {
        console.error("GET/POST: `opts` argument deprecated. Use `.config` instead.")
    }

    // if (typeof args[3] === 'function' || typeof args[4] === 'function') {
    //     console.error("GET/POST: `callback` argument deprecated." +
    //                   "Use `.then` instead.");
    // }

    if (urlIsFunction === true) {
        this.getURL = getURLFunction
    } else {
        this.getURL = getURLArg
    }

    if (queryIsFunction === true) {
        this.getParam = getParamFunction
    } else {
        this.getParam = getParamArg
    }

    this.url = url
    this.params = query
    this.onLoaded = onLoaded

    return Get
}
