<template>
<img src='/imgs/backgroundMap.png' class="backgroundimg">
<div class='light-dark-background white-text container bold'>
    <div class='head-line'>
    <div>Select year to explore</div><year-select class='year-selection'></year-select>
    <div class='color-code'>
        <div class='legends blue'></div>
        <div style='margin-left:0.5rem'>Brooklyn</div>

        <div class='legends pink'></div>
        <div style='margin-left:0.5rem'>Queens</div>

        <div class='legends green'></div>
        <div style='margin-left:0.5rem'>Manhattan</div>

        <div class='legends yellow'></div>
        <div style='margin-left:0.5rem'>Bronx</div>

    </div>
    </div>

    <div class='main-body'>
        <div class='anual-analysis'>
            <div class='analysis-title'>
                <div style='flex-grow:1'>Annual trend</div>
                <div class='hr-line white'></div>
            </div>
            <switch-form
            :options='options'
            :smallSelection=false
            @selectedCategory='changeCategory'
            class='option-switch'
            ></switch-form>
            <div class='force-layout-container' ref='forceLayoutContainer'>
            <force-layout
            :height='height'
            :margin='margin'
            :width='width'
            :graphData='forceData'
            :category='category'
            >
            </force-layout>
            <bar-graph class='bargraph-container'
            :height='barGraphHeight'
            :margin='margin'
            :width='width'
            :graphData='barGraphData'
            :category='category'
            >

            </bar-graph>
            </div>
        </div>

        <div class='monthly-analysis'>
            <div class='analysis-title'>
            <div style='flex-grow:1'> Monthly trend</div>
            <div class='hr-line white'></div>
            </div>

            <switch-form
            :options='longOptions'
            :smallSelection=false
            @click='changeGraphOption'
            class='option-switch'
            >
            </switch-form>

            <line-graph
            :width='width'
            :height='height'
            :margin='margin'
            :dataGroup='lineGraphData'
            @hoveredCounty = 'clickLine'
            xAxisName='month'
            yAxisName='value'
            :lineColors='colorArray'
            class='monthly-line-graph'
            ></line-graph>

            <div class='monthly-summary big-text'>
                <div class='monthly-headline'>
                    "{{summaryCategory}} of {{hoveredCounty}} is average {{selectedAverage}} in {{yearSelected}}"
                </div>
            </div>

            <div class='county-summary mid-text'>
                <div class='sub-summary big-text bold'>Summary of {{hoveredCounty}}<span class='small-text'>(Average)</span></div>
                <div class='sub-summary'>
                    <div class='sub-summary-title'>Cost<br>Total</div>
                    <div class='medium-big-text orange-text' style='flex-grow:1'>
                        <div style='text-align:end'>{{costTotal}}<span class='small-text'>USD</span></div></div>
                </div>
                <div class='sub-summary'>
                    <div class='sub-summary-title'>Cost/<br>Plate</div>
                    <div class='medium-big-text orange-text' style='flex-grow:1'>
                        <div style='text-align:end'>{{costPerPlateAvg}}<span class='small-text'>USD</span></div></div>
                </div>
                <div class='sub-summary'>
                    <div class='sub-summary-title'>Ticket<br>Count</div>
                    <div class='medium-big-text orange-text' style='flex-grow:1'>
                        <div style='text-align:end'>{{ticketCountAvg}}<span class='small-text'>Ea</span></div></div>
                </div>
                <div class='sub-summary'>
                    <div class='sub-summary-title'>Ticket/<br>Plate</div>
                    <div class='medium-big-text orange-text' style='flex-grow:1'>
                        <div style='text-align:end'>{{ticketPerPlateAvg}}<span class='small-text'>Ea</span></div></div>
                </div>
                <div class='sub-summary'>
                    <div class='sub-summary-title'>Cost/<br>Ticket</div>
                    <div class='medium-big-text orange-text' style='flex-grow:1'>
                        <div style='text-align:end'>{{costPerTicketAvg}}<span class='small-text'>USD</span></div></div>
                </div>
            </div>
        </div>



    </div>


</div>

    <loading-spinner v-if='isLoading'>{{isLoading}}</loading-spinner>

</template>
<script>
import * as d3 from 'd3'
import ForceLayout from '../components/ForceLayout.vue'
import BarGraph from '../components/BarGraph.vue'
export default {
    components:{ForceLayout,BarGraph},
    data(){
        return{
            options:['cost','tickets'],
            width:0,
            height:0,
            subHeight:0,
            margin:{vertical:undefined,horizontal:undefined},
            hoveredCounty:'Brooklyn',
            category:'cost',
            barGraphHeight:undefined,
            longOptions:['Total Cost','Cost/Plate','Ticket Count','Ticket/Plate','Cost/Ticket'],
            lineGraphCategory:'TOTAL COST',
            lineGraphData:undefined,
            colorArray:['#66C8FF', '#F58586', '#2DC73E', '#DBD45B'],
            averageValue:undefined,
            summaryCategory:'Monthly cost',
            summaryEntireData:undefined
        }
    },
    async mounted(){
       this.getGraphContainerSize();
       window.addEventListener('resize',this.getGraphContainerSize)
       this.loadLineGraph('TOTAL COST')
       this.loadSummaryEntire()
    },
    unmounted(){
       window.removeEventListener('resize',this.getGraphContainerSize)
    },
    computed:{  
        costTotal(){
            if(this.lineGraphData){
            var index = this.hoveredCounty=='Brooklyn'? 0:
            this.hoveredCounty=='Queens'? 1:
            this.hoveredCounty=='Manhattan'? 2:
            this.hoveredCounty=='Bronx'? 3:undefined;

            // const values =this.lineGraphData.map(d=>d.map(t=>t.value))
            const arr=[... this.lineGraphData[index].map(d=>d.value)]
            // const arr2=[... this.lineGraphData[1].map(d=>d.value)]
            // const arr3=[... this.lineGraphData[2].map(d=>d.value)]
            // const arr4=[... this.lineGraphData[3].map(d=>d.value)];
            const total = arr.reduce((a,b)=>{return a+b},0)

            return total.toLocaleString()}
            else{return null}
        },
        costPerPlateAvg(){
            if(this.summaryEntireData){
            const target = this.summaryEntireData[1].data.find(d=>d.county==this.hoveredCounty)
            return Math.round(target.value*10)/10 
            }else{return null}
        },
        ticketCountAvg(){
            if(this.summaryEntireData){
            const target = this.summaryEntireData[2].data.find(d=>d.county==this.hoveredCounty)
            return Math.round(target.value*10)/10
            }else{return null}
        },
        ticketPerPlateAvg(){
            if(this.summaryEntireData){
            const target = this.summaryEntireData[3].data.find(d=>d.county==this.hoveredCounty)
            return Math.round(target.value*100)/100
            }else{return null}
        },
        costPerTicketAvg(){
            if(this.summaryEntireData){
            const target = this.summaryEntireData[4].data.find(d=>d.county==this.hoveredCounty)
            return Math.round(target.value*100)/100
            }else{return null}
        },
        
        selectedAverage(){
            if(this.hoveredCounty && this.lineGraphData){
            const index = this.hoveredCounty == 'Brooklyn'? 0:
            this.hoveredCounty == 'Queens'? 1:
            this.hoveredCounty == 'Manhattan'? 2:
            this.hoveredCounty == 'Bronx'? 3:undefined;

            const targetData =this.lineGraphData[index];

            const targetSum = (targetData.map(d=>d.value)).reduce((a,b)=>{return a+b},0)

            return Math.round((targetSum/12)*10)/10
            }else{
                return undefined
            }

        },
        yearSelected(){
            return this.$store.getters.yearSelected
        },

        isLoading(){
            return this.$store.getters.isLoading
        },
        forceData(){
            return this.$store.getters['Landing/boroSummary']
        },
        barGraphData(){
            const source = this.$store.getters['Landing/proportionData']
            if(this.category=='cost'){
                return source[0].dataArr
            }else{
                return source[1].dataArr
            }
        }
      
    },
    methods:{
        async loadSummaryEntire(){
            const dataArr = await d3.json(`/summaryData/${this.yearSelected}Summary.json`);
            this.summaryEntireData=dataArr;

        },
        getSelectedAverage(linecategory,clickedCounty){
            // hover event 에서
            // linecategory읽고, clickedcounty받아서
            // average값을 linegraphdata를 통해 얻어낸 후
            linecategory;
            clickedCounty;
            this.averageValue
            // 를 구해내면 될듯?

        },
        getSummary(){
            const message = this.lineGraphCategory == 'Total Cost'? 'Monthly cost':
                            this.lineGraphCategory == 'Cost/Plate'? 'Monthly cost per plate':
                            this.lineGraphCategory == 'Ticket Count'? 'Monthly ticket count':
                            this.lineGraphCategory == 'Ticket/Plate'? 'Monthly ticket count per plate':
                            this.lineGraphCategory == 'Cost/Ticket'? 'Monthly cost per plate': undefined

            this.summaryCategory=message
        },
        clickLine(val){
            this.hoveredCounty=val
        },
        async loadLineGraph(category){
            
            this.$store.dispatch('loadingChange',true)

            const selectedCategory = category == 'TOTAL COST'? 'totalCost':
                                     category == 'COST/PLATE'? 'costPerPlate':
                                     category == 'TICKET COUNT'? 'ticketCount':
                                     category == 'TICKET/PLATE'? 'ticketCountperPlate':
                                     category == 'COST/TICKET'? 'costPerTicket':null
            const datasource = await d3.json(`./summaryData/${this.yearSelected}MonthlyData.json`);

            const data = datasource.find(d=>d.filter==selectedCategory);
            if(data){
            this.lineGraphData=data.data;                         
            }else{
                console.log('what is wrong?',datasource.find(d=>d.filter==selectedCategory))
            }
            this.$store.dispatch('loadingChange',false)
        },
        changeGraphOption(e){


            if(e.target.value){
                this.lineGraphCategory=e.target.value
            }else if(e.target._value){
                this.lineGraphCategory=e.target._value
            }else if(e.target.innerHTML){
                this.lineGraphCategory=e.target.innerHTML
            }else{
                console.log(e.target)
            }

            this.loadLineGraph(this.lineGraphCategory)

            this.getSummary()
        },
        changeCategory(e){
            this.category =e
        },
        getGraphContainerSize(){
        if(this.$refs.forceLayoutContainer){
        this.height = this.$refs.forceLayoutContainer.clientHeight;
        this.width = this.$refs.forceLayoutContainer.clientWidth;
        this.margin.vertical=this.height*0.1;
        this.margin.horizontal=this.width*0.08;
        this.barGraphHeight=this.height*(3/4);
        }
        },

    },
    watch:{
        yearSelected:function(){
           this.loadSummaryEntire()
           this.loadLineGraph(this.lineGraphCategory)
        }
    },
    updated(){

    }
       
       
}
</script>
<style scoped>
.color-code{
    position:absolute;
    right:2rem;
    height:1rem;
    display:flex;
    flex-direction: row;
    align-items: center;
}
.option-switch{
    position:absolute;
    right:1%;
}
.container{
    margin:0;
    position:absolute;
    left:50%;
    top:52%;
    height:88vh;
    transform:translate(-50%,-50%);
    width:96vw;
    padding:1rem 2rem;
    border-radius:5px;
}
.head-line{
    display:flex;
    flex-direction:row;
    gap: 0 3rem;
}
.main-body{
    margin-top:3rem;
    display:flex;
    flex-direction:row;
    height:95%;
    width:100%;
    min-width:1200px;
    min-height:600px;
    gap:0 2rem;
}

.anual-analysis, .monthly-analysis{
    width:100%;
    min-width:45%;
    height:90%;
    /* flex-grow:1; */
    position:relative;
}
.analysis-title{
    width:100%;
    display:flex;
    align-items: center;
    justify-content: space-between;
}
.hr-line{
    flex-grow:20;
    height:0.1rem;
    opacity:0.5
}

.force-layout-container{
    width:100%;
    height:60%;
    min-height:300px;
}

.bargraph-container{
    position:relative;
    top:-3rem;
}
.monthly-line-graph{
    position:absolute;
    top:2rem;
    left:2rem;
}
.legends{
  margin-left:1rem;
  width:1rem;
  height:1rem;
}

.monthly-summary{
    position:absolute;
    top:70%;
    left:0
}
.monthly-headline{
    border-bottom:solid 2px #F78F67;
}
.county-summary{
    min-height:25%;
    height:25%;
    position:absolute;
    width:100%;
    top:78%;
    display:flex;
    flex-wrap:wrap;
    gap:0 1rem;

}
.sub-summary{
    flex: 1 0 41%;
    height:30%;
    display:flex;
    flex-direction:row;
    gap:0 1rem;
    align-items: center;
}
.sub-summary-title{
    flex-grow:0.1;
}

@media screen and (max-width: 800px) {
    .main-body{
        flex-direction:column;
        gap:15% 0%;
        min-width:600px;
    }
    .container{
        height:150vh;
        top:5%;
        left:0%;
        transform:translate(0,0)
    }
    .anual-analysis, .monthly-analysis{
    width:95%;
    min-width:500px;
    height:500px;
    /* flex-grow:1; */
    position:relative;
    /* margin:auto; */
}
.bargraph-container{
    position:relative;
    margin-top:5%;
}
.monthly-summary{
    margin-top:5%;
}
.county-summary{
    margin-top:5%;
}

}


@media screen and (max-width: 500px) {
    .main-body{
        flex-direction:column;
        gap:15% 0%;
        min-width:0px;
    }

    .anual-analysis, .monthly-analysis{
    width:90%;
    min-width:100px;
    height:400px;
    position:relative;
}
}

</style>