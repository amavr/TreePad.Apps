function Page(){
  
  var me = this;
  
  var $files, $work;
  var $btn_open;
  
  this.showFiles = function(e){
      e.preventDefault();

      console.log('click open');

      $btn_open.data('files', !$files.is(':visible'));
      
      $files.fadeToggle(400);
      $work.fadeToggle(400);

      $('span', $btn_open).toggleClass('glyphicon-folder-open');
      $('span', $btn_open).toggleClass('glyphicon-remove-circle');
      
  }
  
  var constructor = function(){
    $files = $('#files-box');
    $work = $('#work-box');
    
    $btn_open = $('#btn-open');
    
    $btn_open.data('files', false);

    $btn_open.on('click', me.showFiles);
  }
  
  constructor();
}


$(function(){
  console.log('page loaded');

  var page = new Page();
});

