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
  meta = $('#datasets').data().meta;
  datasets = Object.keys(data);

  init = true;

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
    path_left = data[dataset_name][image_left]["url"];
    im_left.src = path_left;

    info_l = data[dataset_name][image_left]["info"];
    $("#infoLeft").empty();

    if(info_l) {
      Object.keys(info_l).sort().forEach(function(t) { 
        $("#infoLeft").append("<tr><th>"+t+"</th><td>"+info_l[t]+"</td></tr>");
      });
    } 
  };

  function update_right() {
    if(!dataset_name){
      return;
    }
    ready_r = false;
    path_right = data[dataset_name][image_right]["url"];
    im_right.src = path_right;

    info_r = data[dataset_name][image_right]["info"];
    $("#infoRight").empty();

    if(info_r) {
      Object.keys(info_r).sort().forEach(function(t) { 
        $("#infoRight").append("<tr><th>"+t+"</th><td>"+info_r[t]+"</td></tr>");
      });
    } 
  };

  imagehaschanged = function() {
    dataset_name = $('#selDataset').val();
    ready_r = false;
    ready_l = false;

    console.log(meta);
    if(init || meta["refresh_list"]) {
      $('#selLeft').empty();
      $('#selRight').empty();
      Object.keys(data[dataset_name]).sort().forEach(function(t) { 
        $('#selLeft').append('<option>'+t+'</option>');
        $('#selRight').append('<option>'+t+'</option>');
      });
    }

    if(init) {
      init = false;
    }

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
