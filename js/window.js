function Page() {

    var me = this;

    var $files, $work;
    var $btn_open;

    var gdocs;

    this.showFiles = function (e) {
        e.preventDefault();

        me.auth();

        $btn_open.data('files', !$files.is(':visible'));
        $files.fadeToggle(400);
        $work.fadeToggle(400);
        $('span', $btn_open).toggleClass('glyphicon-folder-open');
        $('span', $btn_open).toggleClass('glyphicon-remove-circle');

    }

    this.auth = function () {
        console.log('auth start');
        gdocs.auth2(function (token) {
            console.log('auth ok: '+ token);
            gdocs.getRootFolder(function(root_id){
                console.log('root folder id: '+ root_id);
                gdocs.getHomeFolder(root_id, function(folder_id){
                    console.log('home folder id: '+ folder_id);
                    if(folder_id == null){
                        gdocs.createHomeFolder(root_id, function(folder_id){
                            console.log('callback createHomeFolder');
                        });
                    }
                });
            });
        });
    }

    var constructor = function () {

        gdocs = new GDocs();

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

