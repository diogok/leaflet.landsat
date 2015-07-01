
L.landsat = function() {
  return  L.esri.imageMapLayer(
      'http://landsatlook.usgs.gov/arcgis/rest/services/LandsatLook/ImageServer'
      ,{
        timeField: 'acquisitionDate',
        attribution: 'NASA Landsat'
      }
    );
};

L.modis = function() {
  var time = new Date().toISOString().slice(0,10);

  var template = "//map1{s}.vis.earthdata.nasa.gov/wmts-webmerc/" 
                + "{layer}/default/"+time+"/{tileMatrixSet}/{z}/{y}/{x}.jpg";

   
  var layer = L.tileLayer(template, {
    layer: "MODIS_Terra_CorrectedReflectance_TrueColor",
    tileMatrixSet: "GoogleMapsCompatible_Level9",
    maxZoom: 18,
    maxNativeZoom: 9,
    time: time,
    tileSize: 256,
    subdomains: "abc",
    noWrap: true,
    continuousWorld: true,
    bounds: [ [-85.0511287776, -179.999999975], [85.0511287776, 179.999999975] ],
    attribution: "NASA MODIS"
  });
                                                                                                                         
  layer.setTimeRange = function(from,to) {
    var time = from.toISOString().slice(0,10);
    var template = "//map1{s}.vis.earthdata.nasa.gov/wmts-webmerc/" 
                  + "{layer}/default/"+time+"/{tileMatrixSet}/{z}/{y}/{x}.jpg";
    layer.setUrl(template);
  };

  return layer;
};

L.control.Landsat = L.Control.extend({

    options: {
        position: 'topright',
        layer: null,
        title: 'Landsat',
        handler: {}
    },

    changed: function() {
      var times = this.getTimes();

      console.log(this.options);
      if(this.options.layer != null) {
        this.options.layer.setTimeRange(times[0],times[1]);
      } else if(this.options.layers != null) {
        for(var i=0;i<this.options.layers.length;i++) {
          console.log(this.options.layers[i]);
          this.options.layers[i].setTimeRange(times[0],times[1]);
        }
      }
    },

    getTimes: function() {
      var day_sel  = this.day_selector;
      var day      = day_sel.options[day_sel.selectedIndex].innerHTML;

      var month_sel  = this.month_selector;
      var month      = month_sel.options[month_sel.selectedIndex].innerHTML;

      var year_sel  = this.year_selector;
      var year      = year_sel.options[year_sel.selectedIndex].innerHTML;

      var to       = year+"-"+month+"-30";
      var from     = year+"-"+month+"-01";

      return [new Date( from ),new Date( to )];
    },

    onAdd: function(map) {

      this._on=false;
      this._map=map;
      this._layer=null;

      var control  = L.DomUtil.create('div','leaflet-control leaflet-control-landsat leaflet-bar')

      var label    = L.DomUtil.create('label','',control);
      label.innerHTML   = this.options.title+'&nbsp;';
      label.setAttribute("for","enable-landsat");

      var day_selector = L.DomUtil.create('select','',control);
      for(var i=1;i<=31;i++) {
        var day_option = L.DomUtil.create('option','',day_selector);
        if(i == new Date().getDate()) {
          day_option.setAttribute('selected','selected');
        }
        day_option.innerHTML=( "0"+i ).slice(-2);
      }
      L.DomEvent.addListener(day_selector,'change',this.changed,this);
      day_selector.onmousedown = day_selector.ondblclick = L.DomEvent.stopPropagation;
      this.day_selector = day_selector;

      var month_selector = L.DomUtil.create('select','',control);
      for(var i=1;i<=12;i++) {
        var month_option = L.DomUtil.create('option','',month_selector);
        if(i == new Date().getMonth() + 1) {
          month_option.setAttribute('selected','selected');
        }
        month_option.innerHTML=( "0"+i ).slice(-2);
      }
      L.DomEvent.addListener(month_selector,'change',this.changed,this);
      month_selector.onmousedown = month_selector.ondblclick = L.DomEvent.stopPropagation;
      this.month_selector = month_selector;

      var year_selector = L.DomUtil.create('select','',control);
      for(var i=new Date().getFullYear();i>=1972;i--) {
        var year_option = L.DomUtil.create('option','',year_selector);
        year_option.innerHTML=i;
      }
      L.DomEvent.addListener(year_selector,'change',this.changed,this);
      year_selector.onmousedown = year_selector.ondblclick = L.DomEvent.stopPropagation;
      this.year_selector = year_selector;

      L.DomEvent.addListener(control, 'mouseover',function(){
        map.dragging.disable();
        map.doubleClickZoom.disable();
      },this);

      L.DomEvent.addListener(control, 'mouseout',function(){
        map.dragging.enable();
        map.doubleClickZoom.enable();
      },this);
            
      return control;
    }
});

L.control.landsat = function (options) {
    return new L.control.Landsat(options);
};

