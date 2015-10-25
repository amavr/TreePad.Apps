function Tree(tree_box_id, text_box_id, data) {

    var me = this;
    var $tree_box = $(tree_box_id);
    var $text_box = $(text_box_id);
    var $ul = null;

    var items = [];
    var selected = null;

    var append = function (article) {
        items.push(article)
    }

    var switchState = function (e) {
        console.log(e);
        var a = $(e).data('article');
        console.log(a);
    }

    var tbox2node = function () {
        if (selected) {
            // selected.text = $text_box[0].innerText;
            selected.text = $text_box.text();
        }
    }

    var node2tbox = function () {
        var text = (selected) ? selected.text : '';
        $text_box.text(text);
    }

    var onSelect = function (node) {
        // console.log(node);
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
            if ($new_li.length > 0) {
                selected = $new_li.data('article');
                $new_li.find('> span').addClass('selected');
                var data = $new_li.data('article');
                console.log(data);
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

    var constructor = function () {
        
        $text_box.text('');
        
        console.log($tree_box);
        
        $ul = $('<ul></ul>');
        $tree_box.html('');
        $tree_box.append($ul);

        $tree_box.bind('click', function (e) {
            e.stopPropagation();
            $("li > span.selected", $tree_box).removeClass("selected");
            onSelect();
        });
       
        if(!$tree_box.hasClass('tree')) $tree_box.addClass('tree');

        if (data != undefined && data.length > 0) {
            for (var i = 0; i < data.length; i++) {
                append(new Article($ul, data[i], true, onSelect));
            }
        }
        
        initHandlers();
    }

    constructor();
}