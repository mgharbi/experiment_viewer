function float_format(x, prec) {
    return Math.round(x*Math.pow(10,prec))/Math.pow(10,prec);
}

$(document).ready(function() {
    dset_names         = get_dataset_names();
    dsets              = get_datasets();
    // method_names       = get_method_names();
    // running_times      = get_running_times();
    aggregated_metrics = get_aggregated_metrics();


    var ndset = Object.keys(dset_names[0]).length;
    str = "<tr>";
    str += "<th></th>";
    str += "<th></th>";
    str += "<th class='text-center' colspan=3> PSNR (dB) </th>";
    str += "<th></th>";
    str += "</tr>";
    $("#globalScores tbody").append(str);

    str = "<tr>";
    str += "<th> dataset </th>";
    str += "<th> image count </th>";
    str += "<th class='text-center' > ours </th>";
    str += "<th class='text-center' > BGU </th>";
    str += "<th class='text-center' > Transform Recipes </th>";
    str += "<th > notes </th>";
    str += "</tr>";
    $("#globalScores tbody").append(str);

    // dataset rows
    for(name in datasets) {
    // for(name in dset_names[0]) {
      console.log(name);
      str = "<tr>";
      str += '<td><a href="comparison.html?methodL=ours&methodR=gt_input&dataset='+name+'">';
      str += dset_names[0][name];
      str += "</a></td>";
      str += "<td>" + aggregated_metrics['ours'][name]['n'] +"</td>";
      // ours
      str += '<td class="text-center" ><a href="comparison.html?methodL=ours&methodR=gt_output&dataset='+name+'">'
      str += float_format(aggregated_metrics['ours'][name]['psnr'],1);
      str += "</a></td>";

      // bgu
      str += '<td class="text-center" ><a href="comparison.html?methodL=ours&methodR=bgu&dataset='+name+'">'
      str += float_format(aggregated_metrics['bgu'][name]['psnr'],1);
      str += "</a></td>";

      // recipes
      str += '<td class="text-center" ><a href="comparison.html?methodL=ours&methodR=recipes&dataset='+name+'">'
      str += float_format(aggregated_metrics['recipes'][name]['psnr'],1);
      str += "</a></td>";
      
      str += '<td>';
      str += dset_names[2][name];
      str += "</td>";

      $("#globalScores tbody").append(str);
    }
});
