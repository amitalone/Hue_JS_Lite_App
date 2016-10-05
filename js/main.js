var bridgeIP = "192.168.2.33";//"192.168.2.19:8080";//"192.168.2.33";
var apiUser  = "288b71a336dad60f3ad73e9b2689c587";//"newdeveloper";//
// bridgeIP = "127.0.0.1:8000";
// apiUser  = "newdeveloper";
 var global_color =null;

$( document ).ready(function() {
     getAllLights();
     getAllGroups();

   $(".hsl-demo").ColorPickerSliders({
           flat: true,
           previewformat: 'hsl',
           swatches:false,
           color:"#00ff00",
           order: {
               hsl: 0
           },
           labels: {
             hslhue:'Hue',
             hslsaturation: 'Saturation',
             hsllightness:'Lightness',
             updateinterval:500
           },
           onchange: function(container, color) {
             global_color = color;
             stateChange("color");
            // console.log(color);
          }

       });
});


function rgbTOXY(red, green, blue) {
  red = (red > 0.04045) ? Math.pow((red + 0.055) / (1.0 + 0.055), 2.4) : (red / 12.92);
  green = (green > 0.04045) ? Math.pow((green + 0.055) / (1.0 + 0.055), 2.4) : (green / 12.92);
  blue = (blue > 0.04045) ? Math.pow((blue + 0.055) / (1.0 + 0.055), 2.4) : (blue / 12.92);

  X = red * 0.664511 + green * 0.154324 + blue * 0.162028;
  Y = red * 0.283881 + green * 0.668433 + blue * 0.047685;
  Z = red * 0.000088 + green * 0.072310 + blue * 0.986039;
  x = X / (X + Y + Z);
  y = Y / (X + Y + Z);
  return x + "," + y;
}
function getSvrURL(command) {
  return "http://"+bridgeIP+"/api/"+apiUser+command;
}

function getAllLights() {
  $.ajax( {
    url: getSvrURL("/lights")
    } )
    .done(function(result) {
      html = "";
      $.each(result, function (index, value) {
        state = "grey darken-1";
        if(value.state.on == true) {
          state = "green";
        }
        html += "<div class='col'> <a id='light_but_"+index+"' data-state='"+value.state.on+"' data-id='"+index+"' class='alight waves-effect waves-light btn "+state+"'><i class='material-icons left'>lightbulb_outline</i>"+value.name+"</a></div>";
        $("#lights").append("<input class='ls' type='checkbox' id='light_"+index+"' value='"+index+"'/> <label for='light_"+index+"'>"+value.name+"</label>");
      });
       $("#lights-container").html(html);
      lightsEvent();
      $(".ls").change(function() {
          if($('.ls:checkbox:checked').length > 0) {
            $('.lgs:checkbox:checked').attr("checked", false);
          }
      });


    })
    .fail(function() {
    })
}

function lightsEvent() {
  $(".alight").click(function() {
    currentState = $(this).attr("data-state");
    toggleLight($(this).attr("data-id"), currentState, $(this));
  });
}

function getAllGroups() {
  $.ajax( {
    url: getSvrURL("/groups")
    } )
    .done(function(result) {
      $.each(result, function (index, value) {
        $("#groups").append("<input class='lgs' type='checkbox' id='group_"+index+"' value='"+index+"'/> <label for='group_"+index+"'>"+value.name+"</label>");
      });
      $(".lgs").change(function() {
        if($('.lgs:checkbox:checked').length > 0) {
          $('.ls:checkbox:checked').attr("checked", false);
        }
      });

    })
    .fail(function() {
    })
}

function toggleLight(id, state, ele) {
  state = $.parseJSON(state);
  state = !state;
  $.ajax( {
		url: getSvrURL("/lights/"+id+"/state"),
		type: 'PUT',
		data: "{\"on\": "+state +"}"
	} )
	  .done(function(result) {
      if(state == true) {
        $(ele).removeClass("grey darken-1");
        $(ele).addClass("green");
      }else {
        $(ele).addClass("grey darken-1");
        $(ele).removeClass("green");
      }
      $(ele).attr("data-state", state);
	  })
	  .fail(function() {
	  })
}

function stateChange(type) {
  selectionType = "";
  if($('.ls:checkbox:checked').length > 0) {
     selectionType = "light";
  }
  if($('.lgs:checkbox:checked').length > 0) {
    selectionType = "group";
  }
  json = "";

   bri = $("#r_brightness").val();
   if(type == "effect") {
     val = !$.parseJSON($("#effect_switch").prop('checked'));
     if(val) {
       effect = "colorloop";
     }else {
       effect = "none";
     }
     json = "{\"effect\": \""+effect+"\",\"on\": true, \"bri\": "+bri+"}";
   }

   if(type=="color") {
     $("#effect_switch").prop('checked', false);
     xy =  rgbTOXY(global_color.rgba.r, global_color.rgba.g, global_color.rgba.b);
     json = "{\"xy\": ["+xy+"],\"on\": true, \"effect\": \"none\", \"bri\": "+bri+"}";
   }

   if(type=="bright") {
        json = "{\"bri\": "+bri+",\"on\": true}";
   }

   if(selectionType == "light") {
      $('.ls:checkbox:checked').each(function () {
          lid = $(this).val();
          updateState(json, "/lights/"+lid+"/state");
        }
      );
    }

    if(selectionType == "group") {
       $('.lgs:checkbox:checked').each(function () {
           lid = $(this).val();
           updateState(json, "/groups/"+lid+"/action");
         }
       );
     }

   console.log(type+ " " + selectionType + " " + json);

}


function updateState(json, url) {
  $.ajax( {
    url: getSvrURL(url),
    type: 'PUT',
    data: json
  } )
    .done(function(result) {
      getAllLightsStates();
      })
    .fail(function() {
    })

}

$(".lever").click(function () {
  stateChange('effect');
});

function getAllLightsStates() {
  $.ajax( {
    url: getSvrURL("/lights")
    } )
    .done(function(result) {
      $.each(result, function (index, value) {
        console.log(index + " " + value.state.on);
        if(value.state.on == true) {
          id = "light_but_"+index;
          $("#"+id).removeClass("grey darken-1");
          $("#"+id).addClass("green");
          $("#"+id).attr("data-state", true);
        }
      });
    })
    .fail(function() {
    })
}

$("#all_off").click(function(){
  $.ajax( {
    url: getSvrURL("/lights")
    } )
    .done(function(result) {
      $.each(result, function (index, value) {

        turnoff(index);
      });
    })
    .fail(function() {
    })
});

function turnoff(id) {
  json = "{\"on\" : false}";
  $.ajax( {
    url: getSvrURL("/lights/"+id+"/state"),
    type: 'PUT',
    data: json
    } )
    .done(function(result) {
      id = "light_but_"+id;
      $("#"+id).removeClass("green");
      $("#"+id).addClass("grey darken-1");
      $("#"+id).attr("data-state", false);


    })
    .fail(function() {
    })

}
