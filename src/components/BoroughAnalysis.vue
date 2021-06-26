<template>

        
    <teleport to='body'>
      <div class='tab'> 
          <div class="selection-tab">
              <div class='title-line white-text'>
                  <div style ='margin-left:1rem' class='bold'>Borough Selection</div>
                  <switch-form
                  style='margin-right:1rem'
                  :options='options'
                  smallSelection=true>
                  </switch-form>
              </div>
              <div class='borough-button'>
                  <form class='form'>
                      <div class="white-text light button">
                          <input type='radio' id='radio-one' name='button-one' value='Brooklyn'
                          v-model='selectedCounty' />
                          <label for='radio-one'>Brooklyn</label>

                          <input type='radio' id='radio-two' name='button-two' value='Queens'
                          v-model='selectedCounty' />
                          <label for='radio-two'>Queens</label>

                          <input type='radio' id='radio-three' name='button-three' value='Manhattan'
                          v-model='selectedCounty' />
                          <label for='radio-three'>Manhattan</label>

                          <input type='radio' id='radio-four' name='button-four' value='Bronx'
                          v-model='selectedCounty' />
                          <label for='radio-four'>Bronx</label>
                      </div>
                  </form>
              </div>
          </div>

        <div class='analysis-tab'>
            <div class='borough-info-title blue-text small-text'>
                <div>{{county}}</div>
                <div>{{yearSelected}}</div>
            </div>
            <hr>
            <div class='precinct-summary' v-if='selectedPrecinct'>
                <div class='sub-section'>
                    <div class='white-text medium'>{{selectedPrecinct}} Precinct</div>
                    <div class='summary-stats orange-text super-big-text'>
                        <div class='medium-big-text bold'>{{precinctTicket}} <span class='white-text medium-text medium'>Tickets</span> </div>
                        <div class='medium-big-text bold'>{{precinctCostSum}} <span class='white-text medium-text medium'>USD</span> </div>
                    </div>
                </div>

                <div class='sub-section'>
                    <div class='white-text medium'>Borough Avg.</div>
                    <div class='summary-stats orange-text super-big-text'>
                        <div class='medium-big-text bold'>{{countyTicketAverage}} <span class='white-text medium-text medium'>Tickets</span> </div>
                        <div class='medium-big-text bold'>{{countyCostAverage}} <span class='white-text medium-text medium'>USD</span> </div>
                    </div>
                </div>


            </div>
            <hr>
            <div class='white-text medium-text medium graph-headline'>
                <div>Parking Cost Distribution</div>
                <div>legend sace</div>
            </div>
            <div class="cost-dist" ref='lineGraphContainer'>
                <line-graph class='graphcontainer'
                :width='width'
                :height='lineGraphheight'
                :margin='margin'
                :dataGroup='dataGroup'
                :xAxisName='xAxisName'
                :yAxisName='yAxisName'
                :lineColors='lineColors'
                ></line-graph>
            </div>
            <div class='white-text medium-text medium graph-headline'>
                <div>Precinct vs Borough</div>
            </div>
            <div class='vsComparison'>
                <div class='bar-graph-container'
                v-for='(bargroup,index) in comparisonData' 
                :key='index'>
                    <div class='bar-box' ref='barBox'>

                        <div class='bar-graph orange' 
                        @mouseover='showBarTooltip("precinct",index)'
                        @mouseleave='hidBarTooltip()'
                        :style="{height:bargroup.values.precinct+'px',
                        transform:heightTranslate()
                        }">
                        </div>
                        <div class='tooltip' v-if='tooltipToShow=="precinct" && index==hoveredIndex'>
                            <div>Precinct:</div>
                            <div>{{  Math.round(bargroup.actualValues.precinct*10)/10 }}</div>
                            </div>
                        
                        <div class='bar-graph blue' 
                        @mouseover='showBarTooltip("county",index)'
                        @mouseleave='hidBarTooltip()'
                        :style="{height:bargroup.values.county+'px',
                        transform:heightTranslate()
                        }">
                        </div>
                        <div style='transform:translate(55%,35%)' class='tooltip' v-if='tooltipToShow=="county" && index==hoveredIndex'>
                            <div>County:</div>
                            <div>{{  Math.round(bargroup.actualValues.county*100)/100 }}</div>
                            </div>
                    
                    </div>
                    <div class='bar-description white-text small-text light'>
                        {{bargroup.category}}
                    </div>
                </div>
            </div>
        </div>
          

      </div>  
    </teleport>

</template>
<script>

export default {
    data(){
        return{
            targetPrecinctData:undefined,
            options:['on','off'],
            selectedCounty:'Brooklyn',
            geoJson:undefined,
            loading:true,
            dataGroup:[],
            width:0,
            lineGraphheight:0,
            xAxisName:undefined,
            yAxisName:undefined,
            margin:{vertical:undefined,horizontal:undefined},
            countyPrecinctCount:undefined,
            lineColors:['#F78F67','#66C7FF'],
            maxCosts:[],
            numberOfstep:10,
            comparisonData:[
                {category:'Average Cost',values:{precinct:0,county:0},
                actualValues:{precinct:0,county:0}
                },
                {category:'Number of Tickets',values:{precinct:0,county:0},
                actualValues:{precinct:0,county:0}
                },
                {category:'Frequency per Plate',values:{precinct:0,county:0},
                actualValues:{precinct:0,county:0}
                },
            ],
            domainSize:0,
            bargroupHovered:false,
            tooltipToShow:undefined,
            hoveredIndex:undefined
        }
    },
    props:['selectedPrecinct'],
    computed:{

    monthlyData(){
        var monthlyDataArr =[];
        this.countyPrecinctCount;

        for(let i=0;i<12;i++){

        const targetCases=this.targetPrecinctData.filter(
                (d)=>{
                    var date = new Date(d['Issue Date']);
                    var dateNum= date.getMonth();
                    return dateNum==i
                    }
                ).length

        const targetCountyCases = this.targetCountyData.filter(
                (d)=>{
                    var date = new Date(d['Issue Date']);
                    var dateNum= date.getMonth();
                    return dateNum==i
                    }).length;
        

            monthlyDataArr.push(
                {month:i,precinct:targetCases,county:targetCountyCases/this.countyPrecinctCount}
            )
        }
        return monthlyDataArr
    },

      countyTicketFrequency(){
      const plates = [...new Set(this.targetCountyData.map(d=>d['Plate']))].length;
      const perPlate =this.countyTicketCountSum/plates;
      return perPlate
      },
      precinctTicketFrequency(){
        const uniquePlateCount= [...new Set(this.targetYearData.filter(d=>d['Precinct']==this.selectedPrecinct).map(d=>d['Plate']))].length
        const perPlate = this.precinctTicket/uniquePlateCount;
        return perPlate
      },

      targetYearData(){
      return this.$store.getters['ByTicketData/targetYearData'];
      },
      yearSelected(){
      return this.$store.getters.yearSelected;
      },
      county(){
          return this.$store.getters.boroughSelected;
      },
      ticketArr(){

        return this.targetYearData.filter(d=>d['Precinct']==this.selectedPrecinct).length
      },
      countyTicketCountSum(){

        var initial = this.selectedCounty=='Manhattan'? 'MN':
                      this.selectedCounty=='Queens'? 'QN':
                      this.selectedCounty=='Bronx'? 'BX':
                      this.selectedCounty=='Brooklyn'? 'BK':'unknown'

        return  this.targetYearData.filter(d=>d['County']==initial).length
      },
      precinctTicket(){

        return this.targetYearData.filter(d=>d['Precinct']==this.selectedPrecinct).length
      },
      precinctCostSum(){
          return this.$store.getters['ByTicketData/precinctCost']
      },
      countyTicketAverage(){

        var initial = this.selectedCounty=='Manhattan'? 'MN':
                      this.selectedCounty=='Queens'? 'QN':
                      this.selectedCounty=='Bronx'? 'BX':
                      this.selectedCounty=='Brooklyn'? 'BK':'unknown'

          const numberofPrecinctInCounty =[... new Set(this.targetYearData.filter(d=>d['County']==initial).map(d=>d['Precinct']))].length

          const ticketSum = this.countyTicketCountSum;
          const avg = Math.round(ticketSum*10/numberofPrecinctInCounty)/10;
          return avg;
      },
      countyCostAverage(){
          return this.$store.getters['ByTicketData/boroughAvgCost']
      },
      targetCountyData(){return this.$store.getters['ByTicketData/selectedBoroughData']},
      maxCost(){ return Math.max(...this.maxCosts)},
    },
    async mounted(){

        this.emitLoad()
        this.geoJson=this.$store.getters['ByGeoData/precinctGeoJson'];
        this.selectedCounty=this.county;
        this.setSVGWidthHeight()

        if(this.selectedPrecinct){
        this.$store.dispatch('ByTicketData/setTargetPrecinct',this.selectedPrecinct)
        }

        this.changeLoad()
        this.emitLoad()
    },
    watch:{
        selectedCounty:function(val){
            this.$store.dispatch('boroughChange',val)
            // by_borough
            if(this.$route.path.includes('by_borough')){
                this.$router.push(`${val}`)
            }
        },
        selectedPrecinct:function(val){
            this.$store.dispatch('ByTicketData/setTargetPrecinct',val)
            this.getMaxCost()

        /*createPrecinctGraphDataSet & createCountyGraphDataset 
        fill up dataGroup. so it has to be renewed in 
        every selection*/

            this.dataGroup=[];
            this.createPrecinctGraphDataSet()
            this.createCountyGraphDataSet()
            this.barUpdate()
        }
    },
    methods:{
        showBarTooltip(target,index){
            this.tooltipToShow=target
            this.hoveredIndex=index
        },
        hidBarTooltip(){
            this.tooltipToShow=undefined
            this.hoveredIndex=undefined
        },
        heightTranslate(){
            return `translateY(${this.domainSize}px) rotate(180deg)`
        },

        barUpdate(){
            // Cost calculation
            this.domainSize = this.$refs.barBox.clientHeight;

            const fullScale1=Math.max(this.countyCostAverage,this.precinctCostSum);

            this.comparisonData[0].values.precinct=(this.precinctCostSum/fullScale1)*this.domainSize
            this.comparisonData[0].values.county=(this.countyCostAverage/fullScale1)*this.domainSize
            this.comparisonData[0].actualValues.precinct=this.precinctCostSum
            this.comparisonData[0].actualValues.county=this.countyCostAverage

            // Ticket calculation
            const fullScale2=Math.max(this.countyTicketAverage,this.precinctTicket);
            this.comparisonData[1].values.precinct=(this.precinctTicket/fullScale2)*this.domainSize
            this.comparisonData[1].values.county=(this.countyTicketAverage/fullScale2)*this.domainSize
            this.comparisonData[1].actualValues.precinct=this.precinctTicket
            this.comparisonData[1].actualValues.county=this.countyTicketAverage


            // Frequency calcuation
            const fullScale3 = Math.max(this.countyTicketFrequency,this.precinctTicketFrequency);
            this.comparisonData[2].values.precinct=(this.precinctTicketFrequency/fullScale3)*this.domainSize
            this.comparisonData[2].values.county=(this.countyTicketFrequency/fullScale3)*this.domainSize
            this.comparisonData[2].actualValues.precinct=this.precinctTicketFrequency
            this.comparisonData[2].actualValues.county=this.countyTicketFrequency

        },
        emitLoad(){
            this.$emit('loadingStatus',this.loading)
        },
        changeLoad(){
            this.loading=false
        },
        setSVGWidthHeight(){
            this.width=this.$refs.lineGraphContainer.clientWidth;
            this.lineGraphheight=this.$refs.lineGraphContainer.clientHeight;
            this.margin.vertical=this.lineGraphheight*0.1;
            this.margin.horizontal=this.width*0.05;


        },
        getMaxCost(){
        this.maxCosts =[];
        
        const targetPrecinctArr=this.targetYearData.filter(d=>d['Precinct']==this.selectedPrecinct);
        this.targetPrecinctData=targetPrecinctArr
        var costByPlatePrecinct =[];
        var platesPrecinct = [...new Set(targetPrecinctArr.map(d=>d['Plate']))];
        platesPrecinct.forEach((d)=>{
            var eachPlate = targetPrecinctArr.filter(t=>t['Plate']==d);
            var eachPlateCostSum= eachPlate.reduce((a,b)=>{
                return {
                    plateNumber:d,
                    costSum:a.costSum + b['Payment Amount']
                    }
            },{plateNumber:d,costSum:0});
            costByPlatePrecinct.push(eachPlateCostSum)
        });

        var costsumsPrecinct = costByPlatePrecinct.map(d=>d.costSum);
        var maxCostPrecinct = Math.max(...costsumsPrecinct)
        this.maxCosts.push(maxCostPrecinct);

        this.countyPrecinctCount = [...new Set(this.targetCountyData.map(d=>d['Precinct']))].length;
        var costByPlateCounty=[];
        var platesCounty = [... new Set(this.targetCountyData.map(d=>d['Plate']))];

        platesCounty.forEach((d)=>{
        
                       var eachPlate = this.targetCountyData.filter(t=>t['Plate']==d);

                       var eachPlateCostSum= eachPlate.reduce((a,b)=>{
                           return {
                               plateNumber:d,
                               costSum:a.costSum + b['Payment Amount']
                               }
                       },{plateNumber:d,costSum:0});


                       costByPlateCounty.push(eachPlateCostSum)


                   });
        
        var costsumsCounty = costByPlateCounty.map(d=>d.costSum);
        var maxCostCounty = Math.max(...costsumsCounty)
        this.maxCosts.push(maxCostCounty);

        },


        createPrecinctGraphDataSet(){
            const targetPrecinctArr=this.targetYearData.filter(d=>d['Precinct']==this.selectedPrecinct);

            var costByPlatePrecinct =[];
            var platesPrecinct = [...new Set(targetPrecinctArr.map(d=>d['Plate']))];
            
            platesPrecinct.forEach((d)=>{

                var eachPlate = targetPrecinctArr.filter(t=>t['Plate']==d);

                var eachPlateCostSum= eachPlate.reduce((a,b)=>{
                    return {
                        plateNumber:d,
                        costSum:a.costSum + b['Payment Amount']
                        }
                },{plateNumber:d,costSum:0});

                costByPlatePrecinct.push(eachPlateCostSum)

            });

            var finalArr =[];
            var stepSize = this.maxCost/this.numberOfstep;

            for(let i=0;i<this.numberOfstep;i++){
                var count =0;
                var paymentTop = stepSize*(i+1);
                var paymentBottom =stepSize*(i);
                costByPlatePrecinct.forEach((t)=>{
                    if(i==0){
                        if(t.costSum>=paymentBottom && t.costSum<=paymentTop){
                            count++
                        }else{null}
                    }else{
                        if(t.costSum>paymentBottom && t.costSum<=paymentTop){
                            count++
                        }else{null}
                    }
                })
                finalArr.push({
                    costWidth:paymentTop,
                    cases:count
                });
            }
            this.dataGroup.push(finalArr)

        },
        createCountyGraphDataSet(){

            var costByPlateCounty=[];
            var plates = this.targetCountyData.map(d=>d['Plate']);
            var uniquePlates = [... new Set(plates)];

            uniquePlates.forEach((d)=>{

                var eachPlate = this.targetCountyData.filter(t=>t['Plate']==d);

                var eachPlateCostSum= eachPlate.reduce((a,b)=>{
                    return {
                        plateNumber:d,
                        costSum:a.costSum + b['Payment Amount']
                        }
                },{plateNumber:d,costSum:0});


                costByPlateCounty.push(eachPlateCostSum)

            });


            var finalArr =[];
            var stepSize = this.maxCost/this.numberOfstep;


            for(let i=0;i<this.numberOfstep;i++){
                var count =0;
                var paymentTop = stepSize*(i+1);
                var paymentBottom =stepSize*(i);
                costByPlateCounty.forEach((t)=>{
                    if(i==0){
                        if(t.costSum>=paymentBottom && t.costSum<=paymentTop){
                            count++
                        }else{null}
                    }else{
                        if(t.costSum>paymentBottom && t.costSum<=paymentTop){
                            count++
                        }else{null}
                    }
                })
                finalArr.push({
                    costWidth:paymentTop,
                    cases:count/this.countyPrecinctCount
                });
            }
            this.dataGroup.push(finalArr)
            this.xAxisName=Object.keys(finalArr[0])[0]
            this.yAxisName=Object.keys(finalArr[0])[1]
        }
   

    }
}
</script>
<style scoped>
.graph-headline{
    display:flex;
    flex-direction: row;
    justify-content: space-between;
}
.selection-tab{
    min-height:80px;
    height:10%;
    background:#393939c0;
    border-radius:5px;
}
.borough-button{
    position:absolute;
    top:3rem;
    left:1rem;
}
.title-line{
    display:flex;
    flex-direction: row;
    justify-content:space-between;
    position:absolute;
    width:100%;
    top:1rem;
}
.tab{
    min-width:400px;
    min-height:750px;
    width:30vw;
    height:85vh;
    z-index:8;
    position:absolute;
    top:3rem;
}
.button{
    display:flex;
    gap:0 0.5rem;
}
.button input{
    clip: rect(0, 0, 0, 0);
    position:absolute !important;
    height: 1px;
    width: 1px;
    overflow:hidden;
}
.button label{
    opacity:0.8;
    line-height:1;
    text-align:center;
    padding:0.5rem 0.5rem;
    border:#7f7f7f93 solid 1px;
    border-radius:4px;
    cursor:pointer;
}
.button input:checked + label {
    border: #66c7ff solid 1.5px;
    color:#F1F5FB;
    font-weight:600;
    opacity:1;
}
hr{
    border:0.5px #F1F5FB solid;
    opacity:0.2;
    display:block;
    line-height:0.5;
    margin:0.2rem 0 ;
    padding:0;
}
.analysis-tab{
    padding:1rem 1rem;
    margin-top:0.3rem;
    min-height:560px;
    height:70%;
    background:#393939c0;
    border-radius:5px;
}
.borough-info-title{
    display:flex;
    justify-content:space-between;
}
.precinct-summary{
    display:flex;
    flex-direction: row;
}
.sub-section{
    display:flex;
    flex-direction:column;
    width:100%;
}
.cost-dist{
    display:flex;
    flex-direction:row;
    width:100%;
    height:25%;
    min-height:155px;
    margin-top:.5rem;
    /* border:solid red 1px; */
}
.vsComparison{
    margin-top:.5rem;
    padding:0;
    width:100%;
    height:20%;
    min-height:85px;
    display:flex;
    flex-direction:row;
}

.bar-graph-container{

    height:100%;
    width:100%;
    display:flex;
    flex-direction:column;
    justify-content:space-evenly;
    gap:0.5rem;
}
.bar-box{

    height:70%;
    display:flex;
    flex-direction:row;
    gap:1rem;
}

.bar-graph{
    transform-origin:top;
    transition:height 2s;
    width:15px;
    z-index:3;
}
.bar-graph:hover{
    border:solid 1px #f1f5fb83;
}
.tooltip{
    padding:0.3rem;
    position:absolute;
    transform:translate(25%,35%);
    background-color:#F1F5FB;
    display:block;
    width:5rem;
    height:3rem;
    border-radius:2px;
    box-shadow:1px 1px 3px #1a1a1a63;
    z-index:5
}

</style>
