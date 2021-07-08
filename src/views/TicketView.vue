<template>
<img src='/imgs/backgroundMap.png' class="backgroundimg">
<div class='light-dark-background white-text container bold'>

    <div class='head-line'>
        <div>Select year to explore</div><year-select class='year-selection'></year-select>
    </div>

    <div class='main-body'> 
        <div class='ticket-count-analysis'>

            <div class='analysis-title'>
                <div style='flex-grow:1'>Type of tickets</div>
            </div>

            <div class='color-code'>

                <div class='legends blue'></div>
                <div style='margin-left:0.5rem'>Brooklyn</div>

                <div class='legends pink'></div>
                <div style='margin-left:0.5rem'>Queens</div>

                <div class='legends green'></div>
                <div style='margin-left:0.5rem'>Manhattan</div>

                <div class='legends yellow'></div>
                <div style='margin-left:0.5rem'>Bronx</div>

                <switch-form
                :options='options'
                :smallSelection=false
                :id=1
                @selectedCategory='changeTypeCategory'
                class='option-switch'
                ></switch-form>
    
            </div>

            <img src="/imgs/ticketgraph-legend.png" alt="" id='ticket-legend'>
                <div class='fatbar-container' ref='fatbarContainer'>
                    <fatbar-graph
                    :width='width'
                    :height='fatbarHeight'
                    :fatbarData='fatbarData'
                    :margin='margin'
                    :category='currentTypeCategory'
                    :selectedYear="selectedYear"
                    ></fatbar-graph>
                </div>

        </div>

    <div class='ticket-ratio-analysis'>
            
        <div class='analysis-title'>
                <div style='flex-grow:1'>Proportion of ticket by type</div>
        </div>

        <div class='color-code'>
            <div class='legends blue'></div>
            <div style='margin-left:0.5rem'>Brooklyn</div>

            <div class='legends pink'></div>
            <div style='margin-left:0.5rem'>Queens</div>

            <div class='legends green'></div>
            <div style='margin-left:0.5rem'>Manhattan</div>

            <div class='legends yellow'></div>
            <div style='margin-left:0.5rem'>Bronx</div>

            <switch-form
            :options='options'
            :smallSelection=false
            :id=2
            @selectedCategory='changeRatioCategory'
            class='option-switch'
            ></switch-form>
        </div>


        <div class="treegraph-section" ref='treegraphSection'>

                <tree-graph
                :width='width'
                :height='height'
                :margin='margin'
                :selectedYear="selectedYear"
                :treeSelectedCategory="currentRatioCategory"
                @treemapState='updateSummaryMessage'
                @treemapSource='createSource'
                ></tree-graph>

                <div id='summary-line'>
                    <span style='margin-right:0.2rem' class='orange'>"{{frequentTicketType}}"</span> 
                    is the most common type in {{selectedCounty}} 
                    <span style='color:#F78F67;font-weight:bold'>{{frequentTicketCount.toLocaleString()}} cases</span>
                </div>
        </div>

        <div class='ticket-summary-section'>
            <div class='summary-title'>
                <div style='flex-grow:1'>Top 10 Cases</div>
                <div class='hr-line white'></div>
            </div>
            <div class='top10-list'>

                <div v-for='(ticket,index) of top10tickets' :key=index>
                    <div>
                        <div class='county-title'>{{ticket.county}}</div>
                        <div v-for='(types,i) of ticket.list' :key=i class='lists light small-text'>
                            <div>{{types.name}}</div><div>{{types.count}}</div>
                        </div>
                    </div>
                </div>

            </div>
        </div>

    </div>


    </div>
</div>
<loading-spinner v-if='isLoading'>{{isLoading}}</loading-spinner>
</template>
<script>

import TreeGraph from '../components/TreeGraph.vue'
import FatbarGraph from '../components/FatbarGraph.vue'
export default {
components:{TreeGraph:TreeGraph,FatbarGraph:FatbarGraph},
data(){
    return{
        options:['cost','cases'],
        currentRatioCategory:'cost',
        currentTypeCategory:'cost',
        width:0,
        height:0,
        treeGraphData:[],
        margin:{horizontal:0,vertical:0},
        treeSelectedCategory:'cost',
        selectedCounty:'Brooklyn',
        treemapClicked:false,
        frequentTicketType:'',
        frequentTicketCount:[],
        top10tickets:[],
        fatbarHeight:0,
        fatbarData:[],
    }
},

methods:{
    createSource(val){
        this.fatbarData=val
    },
    updateSummaryMessage(val){
        this.frequentTicketType=val[0]
        this.selectedCounty=val[1]
        this.frequentTicketCount=val[2]
        this.top10tickets=val[3]
    },
    changeRatioCategory(val){

        this.currentRatioCategory=val
    },
    changeTypeCategory(val){

        this.currentTypeCategory=val;
    },
    startLoading(){
        this.$store.dispatch('loadingChange',true)
        },
    finishLoading(){
        this.$store.dispatch('loadingChange',false)
        }
},
computed:{
    selectedYear(){
        return this.$store.getters.yearSelected;
    },
    isLoading() {
        return this.$store.getters.isLoading
        }
},
mounted(){
    this.width = this.$refs.treegraphSection.clientWidth;
    this.height = this.$refs.treegraphSection.clientHeight;
    this.margin.horizontal = this.width*0.1
    this.margin.vertical = this.height*0.05
    this.fatbarHeight=this.$refs.fatbarContainer.clientHeight
},
watch:{
}
}
</script>

<style scoped>
.option-switch{
    margin-left:2rem;
    /* position:absolute;
    top:3%;
    right:1%; */
}
.main-body{
    margin-top:1rem;
    display:flex;
    flex-direction:row;
    height:95%;
    width:100%;
    min-width:1200px;
    min-height:600px;
    gap:0 2rem;
}

.container{
    margin:0;
    position:absolute;
    left:50%;
    top:52%;
    min-height:650px;
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
.color-code{
    position:absolute;
    font-size:0.7rem;
    left:-1rem;
    height:1rem;
    display:flex;
    flex-direction: row;
    align-items: center;
}
.legends{
  margin-left:1rem;
  width:0.7rem;
  height:0.7rem;
}

.ticket-count-analysis, .ticket-ratio-analysis{
    width:100%;
    min-width:45%;
    height:100%;
    position:relative;
}

.analysis-title{
    width:100%;
    /* display:flex;
    align-items: center;
    justify-content: space-between; */
}
.ticket-summary-section{
    display:block;
    position:relative;
    margin-top:3rem;
    width:100%;
    height:30%;
}

.summary-title{
    width:100%;
    /* top:0%; */
    display:flex;
    align-items: center;
    justify-content: space-between;
}
.hr-line{
    flex-grow:20;
    height:0.1rem;
    opacity:0.5
}
.treegraph-section{
    position:relative;
    margin-top:2rem;
    width:100%;
    height:55%;
}
#summary-line{
    display:block;
    margin-top:0.5rem;
}
.top10-list{
    margin-top:0.5rem;
    height:100%;
    width:100%;
    display:flex;
    flex-grow:row;
    gap:0 0.5rem;
    justify-content: space-between;
}
.lists{
    flex-grow:1;
    display:flex;
    flex-direction: row;
    justify-content: space-between;
    margin-top:0.2rem;
    border-bottom:solid 1px rgba(255, 255, 255, 0.356)
}
.county-title{
    margin-bottom:0.5rem;
}
.fatbar-container{
    position:relative;
    height:75%;
    margin-top:1rem;
}
#ticket-legend{
    position:relative;
    left:50%;
    transform:translate(-50%,0);
    margin-top:2rem;
    width:80%;
}
</style>