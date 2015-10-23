function Article($parentUl, data, visible, onSelect) {

    var me = this;

    var items = [];

    var $li = null;
    var $span = null;
    var $sign = null;
    var $lab = null;
    var $ul = null;
    var $parent = $parentUl; 

    var on_select = onSelect;

    this.title = data.title;
    this.text = data.text;
    this.expanded = false;

    var switchState = function () {
        if (items.length > 0) {
            me.expanded = !me.expanded;
            if (me.expanded) {
                $li.removeClass('collapsed').addClass('expanded');
                $sign.removeClass('glyphicon-plus').addClass('glyphicon-minus');
            }
            else {
                $li.removeClass('expanded').addClass('collapsed');
                $sign.removeClass('glyphicon-minus').addClass('glyphicon-plus');
            }
        }
    };

    this.select = function () {
        $(".tree li > span.selected").removeClass("selected");
        $span.addClass('selected');
        if (on_select) {
            on_select(me);
        }
    };

    this.li = function () {
        return $li;
    };

    this.ul = function () {
        return $ul;
    };

    this.getData = function(){
        var $list = $ul.find('> li');
        var count = $list.length;
        var data = [];
        for(var i = 0; i < count; i++){
            var art = $($list[i]).data('article');
            data.push(art.getData());
        }
        return {title: $lab.text(), text: me.text, children: data };
    };

    this.add = function (article) {
        if (!me.expanded) {
            me.expand();
        }
    };

    this.expand = function () {
        me.expanded = true;
        $li.removeClass('collapsed').addClass('expanded');
    };

    this.collapse = function () {
        me.expanded = false;
        $li.removeClass('expanded').addClass('collapsed');
    };

    this.up = function () {

    };

    this.down = function () {

    };

    this.html = function () {
        return $li[0].outerHTML;
    };

    var constructor = function () {

        var has_children = data.children !== undefined && data.children.length > 0;

        $li = $('<li class="collapsed"></li>');
        $li.data('article', me);

        $span = $('<span></span>');
        $span.data('article', me);
        $li.append($span);

        $sign = $('<i class="glyphicon glyphicon-file"></i>');
        $sign.data('article', me);
        $span.append($sign);

        $lab = $('<div>' + me.title + '</div>');
        $lab.data('article', me);
        $span.append($lab);

        $ul = $("<ul></ul>");
        $li.append($ul);

        if (has_children) {
            $sign.removeClass('glyphicon-file');
            $sign.addClass('glyphicon-plus');
        }

        $parent.append($li);

        $sign.bind('click', switchState);

        $span.bind('click', function (e) {
            e.stopPropagation();
            me.select();
        });

        if (has_children) {

            for (var i = 0; i < data.children.length; i++) {
                items.push((new Article($ul, data.children[i], false, on_select)));
            }
        }

    }

    constructor();

}