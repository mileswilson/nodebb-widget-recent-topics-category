(function(module) {
    "use strict";
    var categories = module.parent.require('./categories'),
    user = module.parent.require('./user'),
    async = require('async'),
    fs = require('fs'),
    path = require('path'),
    plugins = module.parent.require('./plugins'),
    topics = module.parent.require('./topics'),
    templates = module.parent.require('../public/src/templates'),
    utils = module.parent.require('../public/src/utils'),
    app;

    var Widget = {
        templates: {}
    };

    Widget.renderRecentTopicsWidget = function(widget, callback) {
        var html = Widget.templates['category-topics.tpl'];
        categories.getCategoryTopics(widget.data.cid, 0, 10, widget.uid, function(err,data) {
            console.log(data);
            var topics = data.topics;
            for (var i = 0; i < topics.length; ++i) {
                topics[i].isoTimestamp = utils.toISOString(topics[i].timestamp);
            }
           html = templates.parse(html, {topics: topics});
           callback(err,html);
       });
    };

    Widget.init = function(express, middleware, controllers, callback) {
        app = express;

        var templatesToLoad = [
            "category-topics.tpl",
            "admin/category-topics.tpl"
        ];

        function loadTemplate(template, next) {
            fs.readFile(path.resolve(__dirname, './templates/' + template), function (err, data) {
                if (err) {
                    console.log(err.message);
                    return next(err);
                }
                Widget.templates[template] = data.toString();
                next(null);
            });
        }

        async.each(templatesToLoad, loadTemplate);

        callback();
    };

    Widget.defineWidgets = function(widgets, callback) {
        widgets = widgets.concat([   
            {
                widget: "recenttopicscategory",
                name: "Recent Topics In Category",
                description: "Lists the latest topics on your forum, in a specific category",
                content: Widget.templates['admin/category-topics.tpl']
            }
        ]);

        callback(null, widgets);
    };


module.exports = Widget;
}(module));