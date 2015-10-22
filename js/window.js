function Page() {

    var me = this;

    var $files, $work;
    var $btn_open;
    var $body;

    var gdocs;

    this.showWait = function (bool) {
        if (bool) {
            $body.addClass("loading");
        }
        else {
            $body.removeClass("loading");
        }
    };

    this.showFiles = function (e) {
        e.preventDefault();

        var files_visible = $files.is(':visible');
        if (!files_visible) {
            me.showWait(true);
            me.auth(function (token) {
                me.getHomeFolder(token, function (folder_id) {
                    me.getFiles(folder_id, function (files) {
                        console.log(files);
                        var html = '';
                        for (var i in files) {
                            html += '<li id="file-' + files[i].id + '" class="list-group-item col-xs-12"><a href="#">' + files[i].title + '</a></li>';
                        }
                        $files.html(html);
                        me.showWait(false);
                    });
                });
            });
        }

        $btn_open.data('files', files_visible);
        $files.fadeToggle(400);
        $work.fadeToggle(400);
        $('span', $btn_open).toggleClass('glyphicon-folder-open');
        $('span', $btn_open).toggleClass('glyphicon-remove-circle');

    };

    // callback = function(token)
    this.auth = function (callback) {
        console.log('auth start');
        gdocs.auth2(function (token) {
            console.log('auth ok: ' + token);
            if (callback) callback(token);
        });
    }
    
    // callback = function(folder_id)
    this.getHomeFolder = function (token, callback) {
        gdocs.getRootFolder(function (root_id) {
            console.log('root folder id: ' + root_id);
            gdocs.getHomeFolder(root_id, function (folder_id) {
                console.log('home folder id: ' + folder_id);
                if (folder_id == null) {
                    gdocs.createHomeFolder(root_id, function (folder_id) {
                        console.log('callback createHomeFolder');
                        callback(folder_id);
                    });
                }
                else {
                    callback(folder_id);
                }
            });
        });
    }


    // gdocs.getRootFolder(function (root_id) {
    //     console.log('root folder id: ' + root_id);
    //     gdocs.getHomeFolder(root_id, function (folder_id) {
    //         console.log('home folder id: ' + folder_id);
    //     });
    //     console.log('auth ok: ' + token);
    // });


    // callback = function(files)
    this.getFiles = function (folder_id, callback) {
        if (folder_id !== null) {
            gdocs.getFiles(folder_id, function (files) {
                console.log(files);
                callback(files);
            });
        }
    }


    var constructor = function () {

        gdocs = new GDocs();

        $body = $("body");
        $files = $('#files-box');
        $work = $('#work-box');
        $btn_open = $('#btn-open');
        $btn_open.data('files', false);
        $btn_open.on('click', me.showFiles);
    }

    constructor();
}


$(function () {
    console.log('page loaded');
    var page = new Page();
});

