function float_format(x, prec) {
  return Math.round(x*Math.pow(10,prec))/Math.pow(10,prec);
}
function bold(x) {
  return "<strong>"+x+"</strong>";
}

function parse_url() {
  var parsed_url = URI.parse(window.location.href)
    var url_params = URI.parseQuery(parsed_url.query)

  return url_params;
}

$(document).ready(function() {
  data = $('#datasets').data().images;
  datasets = Object.keys(data);

  // Fill in drop-down lists
  datasets.sort().forEach(function(t) { 
    $('#selDataset').append('<option>'+t+'</option>');
  });

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
    if(!dataset_name){
      return;
    }
    ready_l     = false;
    path_left = data[dataset_name][image_left];
    im_left.src = path_left;
  };

  function update_right() {
    if(!dataset_name){
      return;
    }
    ready_r = false;
    path_right = data[dataset_name][image_right];
    im_right.src = path_right;
  };

  imagehaschanged = function() {
    dataset_name = $('#selDataset').val();
    ready_r = false;
    ready_l = false;

    $('#selLeft').empty();
    $('#selRight').empty();
    Object.keys(data[dataset_name]).sort().forEach(function(t) { 
      $('#selLeft').append('<option>'+t+'</option>');
      $('#selRight').append('<option>'+t+'</option>');
    });

    image_left = $("#selLeft").val();
    image_right = $("#selRight").val();

    update_left();
    update_right();
    $("#imageTitle").text(dataset_name);
  };

  $('#selDataset').change(function() {
    console.log("Sel dataset")
    imagehaschanged();
  });
  $('#selLeft').change(function() {
    image_left  = $('#selLeft').val();
    $('.leftTitle').text(image_left);
    update_left();
  });

  $('#selRight').change(function() {
    image_right  = $('#selRight').val();
    $('.rightTitle').text(image_right);
    update_right();
  });

  // UI
  $(document).keydown(function(e){
    if(e.which == $.ui.keyCode.LEFT) {
      dset_selected = $('#selDataset')[0].selectedIndex;
      dset_selected = (dset_selected <= 0) ? 0 : (dset_selected-1);
      $('#selDataset')[0].selectedIndex = dset_selected;
      imagehaschanged();
    } else if (e.which == $.ui.keyCode.RIGHT) {
      dset_selected = $('#selDataset')[0].selectedIndex;
      dset_selected = dset_selected >= datasets.length-1 ? datasets.length-1 : (dset_selected+1);
      $('#selDataset')[0].selectedIndex = dset_selected;
      imagehaschanged();
    } else if (e.which == $.ui.keyCode.SPACE) {
      dset_selected = $('#selDataset')[0].selectedIndex;
      $('#debug-area').append("<li>"+datasets[dset_selected]+"</li>")
    }
  });

  $("#prevImage").click(function(e) {
    dset_selected = $('#selDataset')[0].selectedIndex;
    dset_selected = (dset_selected <= 0) ? 0 : (dset_selected-1);
    $('#selDataset')[0].selectedIndex = dset_selected;
    imagehaschanged();
  });
  $("#nextImage").click(function(e) {
    dset_selected = $('#selDataset')[0].selectedIndex;
    dset_selected = dset_selected >= datasets.length-1 ? datasets.length-1 : (dset_selected+1);
    $('#selDataset')[0].selectedIndex = dset_selected;
    imagehaschanged();
  });

  // Init
  imagehaschanged();
  $("#selRight").change();
  $("#selLeft").change();

});
