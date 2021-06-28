<template>

      <div id="map">

      </div>
      <borough-analysis
      @moveCounty='clearPrecinct'
      :selectedPrecinct='selectedPrecinct'
      
      ></borough-analysis>

    <loading-spinner v-if='isLoading' @loadingStatus='subloading'>
    {{isLoading}}
    </loading-spinner>



</template>
<script>
var map; 
console.log(map)

import mapboxgl from 'mapbox-gl'
export default {
  props:['county'],
  data(){
    return{
      isLoading:true,
      accessToken:'pk.eyJ1Ijoiam90bmFqb2EiLCJhIjoiY2tibnV5bmx0MGF5eTJxcG40NXpvOXB6eCJ9.__awhLNPyWEzCNoGzsM3Pw',
      mapStyle:'mapbox://styles/jotnajoa/ckpn6ifdg06ta17qk4t95welg/draft',
      zoomLevel:11,
      viewOrigin:undefined,
      maploaded:false,
      precinctGeoJson:undefined,
      selectedPrecinct:undefined,
      isCounty:undefined,
      isHoverPrecinct:undefined,
      isNotHoverPrecinct:undefined,
      contourGeoJson:undefined,
      isClickPrecinct:undefined,
      isNotClickPrecinct:undefined,
      pitch:50,
      origins:{
        Brooklyn:[-73.9754,40.6272],
        Manhattan:[-73.9712,40.7831],
        Queens:[-73.8737,40.6433],
        Bronx:[-73.8648,40.8448],
      },
      hoverId:null,
      frameCount:0,
      lineAnimation:undefined,
      contourLength:undefined,
      contourCoordArr:undefined,
      precinctHighlighted:false
    }
  },
  methods:{
    clearPrecinct(){
    this.selectedPrecinct=undefined;
    },
    clearContour(){
      if(map){
        this.contourGeoJson={'type': 'FeatureCollection',
        'features': [{
          'type': 'Feature',
          'geometry': {
            'type': 'LineString',
            'coordinates': [
                []
            ]
        }
        }]
        }
        map.getSource('contourline').setData(this.contourGeoJson)}
    },
    cursorPointer(){
      map.getCanvas().style.cursor = 'pointer';

    },
    highlightPointer(e){
        const targetPrecinct =e.features[0].properties.precinct;

        this.isCounty=['==',['get','county'],this.selectedCounty];
        this.isHoverPrecinct=['==',['get','precinct'],targetPrecinct];
        this.isNotHoverPrecinct=['!=',['get','precinct'],targetPrecinct];

        map.getCanvas().style.cursor = 'pointer';
        if(e.features[0].properties.county==this.selectedCounty){
          
          map.setPaintProperty('precincts',
          'fill-color',
          ['case',

          ['all', this.isNotHoverPrecinct, this.isCounty],
          '#1A1A1A',

          ['all', this.isHoverPrecinct,this.isCounty],
          '#F78F67',
          '#FFFFFF']
          )

          map.setPaintProperty('precincts',
          'fill-opacity',
          ['case',

          ['all', this.isNotHoverPrecinct, this.isCounty],
          0.5,

          ['all', this.isHoverPrecinct, this.isCounty],
          0.8,
          0.8]
          )
          }
    },
    leavePointer(){
        map.setPaintProperty('precincts','fill-color',['case',this.isCounty,
            '#1A1A1A',
            '#FFFFFF']
        );
        map.setPaintProperty('precincts','fill-opacity',['case',this.isCounty,
            0.8,
            0.8]
        );
    },
    createLayer(){



      map.addSource('precinct',{
        type:'geojson',
        data:this.precinctGeoJson
      });

      map.addSource('contourline',{
        type:'geojson',
        data:this.contourGeoJson
      });

      map.addLayer({
        'id':'precincts',
        'type':'fill',
        'source':'precinct',
        'paint':{
          'fill-color':

          ['case',this.isCounty,
            '#1A1A1A',
            '#FFFFFF'],

          'fill-opacity':
          ['case',this.isCounty,
            0.5,
            0.8
          ],
        }
        });

      map.addLayer({
        'id':'contourlines',
        'type':'line',
        'source':'contourline',
        'layout':{
          'line-cap':'round',
          'line-join':'round',
        },
        'paint':{
          'line-color':'#F78F67',
          'line-width':2.5,
          'line-opacity':1
        }
        });


      // function cursorPointer(){
      //   map.getCanvas().style.cursor = 'pointer';
      // }

      map.on('mousemove','precincts',this.cursorPointer);
      map.on('mousemove','precincts',this.highlightPointer);
      map.on('mouseleave','precincts',this.leavePointer)

      
      map.on('click','precincts',async (e)=>{

        if(e.features[0].properties.county==this.selectedCounty){

        // this.precinctHighlighted=true;
        map.off('mousemove','precincts',this.cursorPointer);
        map.off('mousemove','precincts',this.highlightPointer);
        map.off('mouseleave','precincts',this.leavePointer);

        this.selectedPrecinct =e.features[0].properties.precinct;


        this.isNotHoverPrecinct=['!=',['get','precinct'],this.selectedPrecinct];
        this.isHoverPrecinct=['==',['get','precinct'],this.selectedPrecinct];
        this.isCounty=['==',['get','county'],this.selectedCounty];
        this.isClickPrecinct = ['==',['get','precinct'],this.selectedPrecinct]
        this.isNotClickPrecinct = ['!=',['get','precinct'],this.selectedPrecinct]

        const pretarget =e.features[0].geometry.coordinates;
        // console.log('lets check pretarget- geometry',pretarget.geometry,
        // 'lets check pretarget only',pretarget,'what about length only',pretarget.length
        // )
        if(pretarget.length==1){
          const targetData = pretarget[0]

          this.contourCoordArr = targetData

        } else if(pretarget.length>1){
          const lengthArr = pretarget.map(d=>d[0].length);
          const maxIndex = pretarget.findIndex(d=>d[0].length==Math.max(...lengthArr));
          const targetData = pretarget[maxIndex][0];
          this.contourCoordArr = targetData;
        } else{
          console.log('undefined?')
        }

          map.setPaintProperty('precincts',
          'fill-color',
          ['case',
          ['all',this.isCounty,this.isClickPrecinct],'#333238',
          ['all',this.isCounty,this.isNotClickPrecinct],'#282828',
          '#FFFFFF'
          ]
          );

          map.setPaintProperty('precincts',
          'fill-opacity',
          ['case',
          ['all',this.isCounty,this.isClickPrecinct],0.8,0.5
          ]
          )
          
          this.contourLength=this.contourCoordArr.length;
          const targetIndex = Math.floor(this.contourLength/2)

          const point=Array.from(this.contourCoordArr)

          var newCenter =[];
          newCenter[0]=point[targetIndex]['0'];
          newCenter[1]=point[targetIndex]['1'];


          map.flyTo({
            center:newCenter,
            zoom:12,
            pitch:60
          })

      
        this.createContourLine()

      }
      })

},
    filterCounty(){
      map.setPaintProperty('precincts', 'fill-color',
      ['case',['==',['get','county'],`${this.selectedCounty}`],
      '#1A1A1A',
      '#FFFFFF']);
    },
    startLoading(){
    console.log('loading start')
    this.isLoading=true;
      },
      endLoading(){
        this.isLoading=false;
    },
    createContourLine(){

if(this.frameCount==1){
  this.isLoading=true
}
      if(this.frameCount<this.contourLength && this.contourCoordArr){

        const lng=this.contourCoordArr[this.frameCount][0]
        const lat=this.contourCoordArr[this.frameCount][1];
        
        this.contourGeoJson.features[0]
        .geometry
        .coordinates[this.frameCount]=[lng,lat];

        map.getSource('contourline').setData(this.contourGeoJson)
        this.frameCount++
        }
      else if(this.frameCount>=this.contourLength &&this.contourCoordArr){
        this.isLoading=false
        this.frameCount=0;
        this.contourLength=undefined;
        this.contourCoordArr=undefined;
        this.contourGeoJson={'type': 'FeatureCollection',
        'features': [{
          'type': 'Feature',
          'geometry': {
            'type': 'LineString',
            'coordinates': [
                []
            ]
        }
        }]
        }
        cancelAnimationFrame(this.lineAnimation)
      }
      this.lineAnimation=requestAnimationFrame(this.createContourLine)
      
      
      

    }
  },
  computed:{
    yearSelected(){
      return this.$store.getters.yearSelected;
    },
    selectedCounty(){
      return this.$store.getters.boroughSelected;
    },
  },
  async mounted(){
    this.startLoading()
    this.viewOrigin=this.origins[`${this.selectedCounty}`];
    mapboxgl.accessToken=this.accessToken
    map= new mapboxgl.Map({
    container: 'map',
    style: this.mapStyle,
    zoom: this.zoomLevel,
    center: this.viewOrigin,
    pitch: this.pitch,
    antialias: true // create the gl context with MSAA antialiasing, so custom layers are antialiased
    });
    this.precinctGeoJson=await this.$store.getters['ByGeoData/precinctGeoJson']
    this.$store.dispatch('loadingChange',false)
    this.mapStyle='mapbox://styles/jotnajoa/ckpog2xlj0rjp19qjnvu8lg3v';
    this.accessToken='pk.eyJ1Ijoiam90bmFqb2EiLCJhIjoiY2tibnV5bmx0MGF5eTJxcG40NXpvOXB6eCJ9.__awhLNPyWEzCNoGzsM3Pw';
   

    this.isCounty=['==',['get','county'],this.selectedCounty];

    this.contourGeoJson={
    'type': 'FeatureCollection',
    'features': [{
        'type': 'Feature',
        'geometry': {
            'type': 'LineString',
            'coordinates': [
                []
            ]
        }
    }]
};




  setTimeout(()=>{
    this.createLayer(this.yearSelected);
    this.endLoading()
  },1500)
},
watch:{
  selectedCounty:function(val){
    this.selectedCounty=val;
    this.filterCounty()
    this.clearContour()
    map.flyTo(
      {center:this.origins[`${this.selectedCounty}`],
      zoom:11,
      speed:0.5,
      pitch:this.pitch,
      easing(t){
        return t*t
      }
      }
      )
      map.on('mousemove','precincts',this.cursorPointer);
      map.on('mousemove','precincts',this.highlightPointer);
      map.on('mouseleave','precincts',this.leavePointer)
  }
}
}
</script>
<style scoped>
#map{
  position:absolute;
  width:100vw;
  height:100vh;
  margin:0;
  left:0;
  top:0;
  z-index:0;
};

.sub{
  position:absolute;
  z-index:5;
  top:10rem;
  left:10rem;
  margin:0;
  padding:0;
}


</style>