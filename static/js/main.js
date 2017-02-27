function float_format(x, prec) {
  return Math.round(x*Math.pow(10,prec))/Math.pow(10,prec);
}
function bold(x) {
  return "<strong>"+x+"</strong>";
}

function parse_url() {
  var parsed_url = URI.parse(window.location.href)
    var url_params = URI.parseQuery(parsed_url.query)
    console.log("url params:", url_params );

  return url_params;
}

$(document).ready(function() {
  data = $('#datasets').data();
  datasets = data.datasets;
  images = data.images;
  urls = data.urls;

  console.log("urls", urls);

  // Fill in drop-down lists
  Object.keys(images).forEach(function(t) { 
    $('#selImage').append('<option>'+images[t]+'</option>');
  });
  Object.keys(datasets).forEach(function(t) { 
    $('#selLeft').append('<option>'+datasets[t]+'</option>');
    $('#selRight').append('<option>'+datasets[t]+'</option>');
  });

  url_params = parse_url();

  imname = $("#selImage").val();
  dataset_left = $("#selLeft").val();
  dataset_right = $("#selRight").val();

  var path_left   = '';
  var path_right  = '';

  var im_left  = new Image();
  var im_right = new Image();

  var ready_l  = false;
  var ready_r  = false;
  var width_l  = 0;
  var width_r  = 0;
  var height_l = 0;
  var height_r = 0;

  im_left.onload = function() {
    width_l  = im_left.width;
    height_l = im_left.height;
    ready_l  = true;
    make_viewer();
  };

  im_right.onload = function() {
    width_r  = im_right.width;
    height_r = im_right.height;
    ready_r  = true;
    make_viewer();
  };

  var twoface;
  function make_viewer() {
    $('#split_viewer').html('')
      if (!ready_l || !ready_r) {
        return;
      }
    if(width_l != width_r || height_l != height_r) {
      console.log("viewer sizes do not match !");
    }
    twoface = TwoFace('split_viewer', width_l, height_l);
    twoface.add(path_left);
    twoface.add(path_right);
  };

  function update_left() {
    console.log("imname", imname);
    if(!imname){
      return;
    }
    ready_l     = false;
    path_left = urls[dataset_left][imname];
    im_left.src = path_left;
  };

  function update_right() {
    if(!imname){
      return;
    }
    ready_r = false;
    path_right = urls[dataset_right][imname];
    im_right.src = path_right;
  };

  imagehaschanged = function() {
    imname = $('#selImage').val();
    ready_r = false;
    ready_l = false;
    update_left();
    update_right();
    $("#imageTitle").text(imname);
  };

  $('#selImage').change(function() {
    imagehaschanged();
  });
  $('#selLeft').change(function() {
    dataset_left  = $('#selLeft').val();
    $('.leftTitle').text(dataset_left);
    update_left();
  });

  $('#selRight').change(function() {
    dataset_right  = $('#selRight').val();
    console.log('right change', dataset_right);
    $('.rightTitle').text(dataset_right);
    update_right();
  });

  // UI
  $(document).keydown(function(e){
    if(e.which == $.ui.keyCode.LEFT) {
      imselected = $('#selImage')[0].selectedIndex;
      imselected = (imselected <= 0) ? 0 : (imselected-1);
      $('#selImage')[0].selectedIndex = imselected;
      imagehaschanged();
    } else if (e.which == $.ui.keyCode.RIGHT) {
      imselected = $('#selImage')[0].selectedIndex;
      imselected = imselected >= images.length-1 ? images.length-1 : (imselected+1);
      console.log(imselected, images.length);
      $('#selImage')[0].selectedIndex = imselected;
      imagehaschanged();
    } else if (e.which == $.ui.keyCode.SPACE) {
      imselected = $('#selImage')[0].selectedIndex;
      $('#debug-area').append("<li>"+images[imselected]+"</li>")
    }
  });

  $("#prevImage").click(function(e) {
    imselected = $('#selImage')[0].selectedIndex;
    imselected = (imselected <= 0) ? 0 : (imselected-1);
    $('#selImage')[0].selectedIndex = imselected;
    imagehaschanged();
  });
  $("#nextImage").click(function(e) {
    imselected = $('#selImage')[0].selectedIndex;
    imselected = imselected >= images.length-1 ? images.length-1 : (imselected+1);
    $('#selImage')[0].selectedIndex = imselected;
    imagehaschanged();
  });

  // Init
  imagehaschanged();
  $("#selRight").change();
  $("#selLeft").change();

});
