function Tree(tree_box, text_box) {

    var me = this;
    var $tree_box = tree_box;
    var $text_box = text_box;
    var $ul = null;

    var items = [];
    var selected = null;

    var getSelected = function(){
        return selected_node;
    }
    
    var append = function (article) {
        items.push(article)
    }

    var clear = function(){
        for(var i = 0; i < items.length; i++){
            delete items[i];
        }
        items = [];
        $text_box.text('');
        
        $ul = $('<ul></ul>');
        $tree_box.html('');
        $tree_box.append($ul);

        selected = null;
    }

    var switchState = function (e) {
        var a = $(e).data('article');
    }

    var tbox2node = function () {
        if (selected) {
            selected.text = $text_box.html();
        }
    }

    var node2tbox = function () {
        var text = (selected) ? selected.text : '';
        $text_box.html(text);
    }

    var onSelect = function (node) {
        tbox2node();
        selected = node;
        node2tbox();
    }

    var initHandlers = function () {
        
        // включение/выключение режима редактирования имени узла
        $tree_box
            .delegate('span > div', 'dblclick', function () {
                this.contentEditable = true;
            })
            .delegate('span > div', 'blur', function () {
                this.contentEditable = false;
            })
            .delegate('span > div', 'keypress', function (e) {
                if (e.which == 13) {
                    this.contentEditable = false;
                    return false;
                }
            });
    }

    var onEmptyAreaClick = function(e){
        e.stopPropagation();
        onSelect(null);
        $("li > span.selected", $tree_box).removeClass("selected");
    }

    this.add = function (data) {
        var ul = (selected == null) ? $ul : selected.ul();
        var node = new Article(ul, data, true, onSelect);
        if (selected) selected.expand();
        node.select();
    }

    this.delete = function () {
        if (selected) {
            var $li = selected.li();
            var $new_li = $li.next();
            if ($new_li.length == 0) {
                $new_li = $li.prev();
                if ($new_li.length == 0) {
                    $new_li = $li.parent().parent();

                    $new_li
                        .find('span > i')
                        .addClass('glyphicon-file')
                        .removeClass('glyphicon-minus')
                        .removeClass('glyphicon-plus');
                }
            }
            $li.remove();
            selected = null;
            if ($new_li.length > 0) {
                selected = $new_li.data('article');
                $new_li.find('> span').addClass('selected');
                node2tbox();
            }
        }
    }

    this.up = function () {
        if (selected) {
            var $li = selected.li();
            $li.prev().before($li);
        }
    }

    this.down = function () {
        if (selected) {
            var $li = selected.li();
            $li.next().after($li);
        }
    }

    this.getData = function () {
        // сначала в узел заносится текст из редактора 
        tbox2node();
        var $list = $ul.find('> li');
        var count = $list.length;
        var data = [];
        for (var i = 0; i < count; i++) {
            var art = $($list[i]).data('article');
            data.push(art.getData());
        }
        return data;
    }

    this.load = function(data){

        clear();

        if (data != undefined && data.length > 0) {
            for (var i = 0; i < data.length; i++) {
                append(new Article($ul, data[i], true, onSelect));
            }
        }
       
    }

    var constructor = function () {
        
        clear();
        
        tree_box.bind('click', onEmptyAreaClick);
        if(!$tree_box.hasClass('tree')) $tree_box.addClass('tree');
        
        initHandlers();
    }

    constructor();
}