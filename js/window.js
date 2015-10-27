function Page() {

    var me = this;

    var $files, $work, $text_box;
    var $btn_open;
    var $body;

    var gdocs = null;
    var tree = null;
    var current_file_id = null;
    var file_title = null;


    var showFiles = function () {
        // $btn_open.data('files', files_visible);
        $files.fadeIn(400);
        $work.fadeOut();
        $('span', $btn_open).removeClass('glyphicon-folder-open');
        $('span', $btn_open).addClass('glyphicon-remove-circle');
    }

    var hideFiles = function () {
        $work.fadeIn(400);
        $files.fadeOut();
        $('span', $btn_open).addClass('glyphicon-folder-open');
        $('span', $btn_open).removeClass('glyphicon-remove-circle');
    }

    var toggleFiles = function () {
        var files_visible = $files.is(':visible');
        if (files_visible) {
            hideFiles();
        }
        else {
            showFiles();
        }
    }

    var onLoadFile = function (data) {
        tree = new Tree('#tree-box', $text_box, data);
    }

    var initHandlers = function () {

        $('#btn-debug').bind('click', function () {
            var data = tree.getData();
            console.log(data);
        });

        $('#btn-save').bind('click', function () {
            me.save();
        });

        $('#dlg-btn-save').bind('click', function () {
            me.saveas();
        });


        $('#btn-up').bind('click', function () {
            tree.up();
        });

        $('#btn-down').bind('click', function () {
            tree.down();
        });

        $('#btn-add').bind('click', function () {
            tree.add({ title: 'new node', text: '' });
        });

        $('#btn-del').bind('click', function () {
            tree.delete();
        });

        $text_box.keydown(function (e) {
            e.preventDefault();

            if (e.keyCode === 13) {
                try {
                    var range = window.getSelection().getRangeAt(0);
                    var pos = range.endOffset;
                    var len = $text_box.text().length;
                    var crlf = (pos == len) ? '\r\n\r\n' : '\r\n';
                    document.execCommand('insertHTML', false, crlf);
                }
                catch (ex) {
                    console.log(ex.message);
                    document.execCommand('insertHTML', false, '\r\n');
                }
            }
        });

        $text_box.on('paste', function (e) {
            // handlePaste(this, e);
        });


    };

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
            gdocs.auth(function () {
                me.getHomeFolder(function (folder_id) {
                    home_folder_id = folder_id;
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

    // callback = function(folder_id)
    this.getHomeFolder = function (callback) {
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


    this.save = function () {
        me.showWait(true);
        gdocs.auth(function () {
            var data = tree.getData();
            var text = JSON.stringify(data);
            var blob = new Blob([text], { type: 'application/json' });
            gdocs.uploadFile(blob, file_title, current_file_id, function (answer) {
                me.showWait(false);
                console.log(answer);
            });
        });
    };

    this.saveas = function () {
        me.showWait(true);
        gdocs.auth(function () {
            var data = tree.getData();
            var text = JSON.stringify(data);
            var title = $('#file-name').val();
            var blob = new Blob([text], { type: 'application/json' });
            gdocs.uploadFile(blob, title, null, function (answer) {
                this.title = title;
                document.title = title;

                me.showWait(false);
            });
        });
    };

    var constructor = function () {

        gdocs = new GDocs();

        $body = $("body");
        $files = $('#files-box');
        $work = $('#work-box');
        $text_box = $('#text-box', $work);
        $btn_open = $('#btn-open');
        $btn_open.data('files', false);
        $btn_open.on('click', me.showFiles);

        initHandlers();

        $files.on('click', function (e) {
            e.preventDefault();
            console.log(e.target);
            file_id = e.target.id;
            me.showWait(true);
            gdocs.loadFile(file_id, function (title, data) {

                file_title = title;
                onLoadFile(data);

                toggleFiles();
                me.showWait(false);
            });
        });
    }

    constructor();
}

function handlePaste(elem, e) {
    e.preventDefault();
    var savedcontent = elem.innerHTML;
    if (e && e.clipboardData && e.clipboardData.getData) {// Webkit - get data from clipboard, put into editdiv, cleanup, then cancel event
        if (/text\/html/.test(e.clipboardData.types)) {
            elem.innerHTML = e.clipboardData.getData('text/html');
        }
        else if (/text\/plain/.test(e.clipboardData.types)) {
            elem.innerHTML = e.clipboardData.getData('text/plain');
        }
        else {
            elem.innerHTML = "";
        }
        waitForPasteData(elem, savedcontent);
        if (e.preventDefault) {
            e.stopPropagation();
            e.preventDefault();
        }
        return false;
    }
    else {// Everything else - empty editdiv and allow browser to paste content into it, then cleanup
        elem.innerHTML = "";
        waitForPasteData(elem, savedcontent);
        return true;
    }
}

function waitForPasteData(elem, savedcontent) {
    if (elem.childNodes && elem.childNodes.length > 0) {
        processPaste(elem, savedcontent);
    }
    else {
        that = {
            e: elem,
            s: savedcontent
        }
        that.callself = function () {
            waitForPasteData(that.e, that.s)
        }
        setTimeout(that.callself, 20);
    }
}

function processPaste(elem, savedcontent) {
    pasteddata = elem.innerHTML;
    //^^Alternatively loop through dom (elem.childNodes or elem.getElementsByTagName) here

    elem.innerHTML = savedcontent;

    // Do whatever with gathered data;
    console.log(pasteddata);
}


$(function () {
    console.log('page loaded');
    var page = new Page();
});
