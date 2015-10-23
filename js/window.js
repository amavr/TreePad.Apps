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
                            var id = files[i].id;
                            html += '<li class="list-group-item col-xs-12"><a id="' + id + '" href="#">' + files[i].title + '</a></li>';
                        }
                        $files.html(html);
                        
                        me.showWait(false);
                    });
                });
            });
        }

        toggleFiles();
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

    // callback = function(files)
    this.getFiles = function (folder_id, callback) {
        if (folder_id !== null) {
            gdocs.getFiles(folder_id, function (files) {
                callback(files);
            });
        }
    }

    var showFiles = function(){
        // $btn_open.data('files', files_visible);
        $files.fadeIn(400);
        $work.fadeOut();
        $('span', $btn_open).removeClass('glyphicon-folder-open');
        $('span', $btn_open).addClass('glyphicon-remove-circle');
    }
    
    var hideFiles = function(){
        $work.fadeIn(400);
        $files.fadeOut();
        $('span', $btn_open).addClass('glyphicon-folder-open');
        $('span', $btn_open).removeClass('glyphicon-remove-circle');
    }
    
    var toggleFiles = function(){
        var files_visible = $files.is(':visible');
        if(files_visible){
            hideFiles();
        }
        else{
            showFiles();
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
        
        $files.on('click', function(e){
            console.log(e.target.id);
            toggleFiles();
            e.preventDefault();
        });
    }

    constructor();
}


$(function () {
    console.log('page loaded');
    var page = new Page();
});

