<template>
    <div class='annual-trend-container'>

        <div id='force-container'
        :style="{height:height+'px',width:width+'px'}"
        >
        </div>
        <div class='annual-trend-description' v-if='percentage'>
            <div v-for='(percent,i) of percentage' :key=i>
                {{percent.county}}: <span>{{ Math.round((percent.value)*1000)/10 }}%</span>
            </div>
        </div>

    </div>
</template>

<script>
import * as d3 from 'd3'
export default {
    props:['graphData','height','margin','width','category'],
    data(){
        return{
            svg:undefined,
            forceStrength:0.2,
            simulation:undefined,
            graph:undefined,
            nodeElements:undefined,
            radiusScale:undefined,
            textElements:undefined,
            valueElements:undefined,
            percentage:undefined
        }
    },
    watch:{
        graphData:function(val){
            this.graph=[...val]
            
        },
        radiusScale:function(){
            this.percentageMaking()
        }
    },
    methods:{

 percentageMaking(){
            // return null
            if(this.graph){
            var costSums = this.graph.reduce((a,b)=>{return a+b.cost},0)
            var ticketSums = this.graph.reduce((a,b)=>{return a+b.count},0)

            var costRatio = [
                {county:'Brooklyn',value:this.graph[0].cost/costSums},
                {county:'Queens',value:this.graph[1].cost/costSums},
                {county:'Manhattan',value:this.graph[2].cost/costSums},
                {county:'Bronx',value:this.graph[3].cost/costSums},
            ];

            var ticketsRatio = [
                {county:'Brooklyn',value:this.graph[0].count/ticketSums},
                {county:'Queens',value:this.graph[1].count/ticketSums},
                {county:'Manhattan',value:this.graph[2].count/ticketSums},
                {county:'Bronx',value:this.graph[3].count/ticketSums},
            ];

            if(this.category=='cost'){
                this.percentage=costRatio
            }else{
                this.percentage=ticketsRatio
            }
            }
        },


        drawCircle(){

            d3.select('.force-graph').append('g').classed('circles',true)
            d3.select('.force-graph').append('g').classed('city-names',true)
            d3.select('.force-graph').append('g').classed('values',true)

            
            this.nodeElements=d3.select('.circles')
                                .selectAll('circle')
                                .data(this.graph)
                                .join('circle')
                                .attr('class','county-circles')
                                .attr('r',(d)=>{
                                    if(this.category=='cost'){
                                    return this.radiusScale(d.cost)
                                    }else{
                                    return this.radiusScale(d.count)
                                    }
                                    })
                                .attr('fill',d=>this.fillColor(d.county))
                                .style('opacity',0.8)

            var defs = this.nodeElements.append("defs");

            var filter = defs.append("filter")
                .attr("id","glow");
            filter.append("feGaussianBlur")
                .attr("stdDeviation","5")
                .attr("result","coloredBlur");
            var feMerge = filter.append("feMerge");
            feMerge.append("feMergeNode")
                .attr("in","coloredBlur");
            feMerge.append("feMergeNode")
                .attr("in","SourceGraphic");

            this.nodeElements.style('filter','url(#glow)')

            this.textElements =d3.select('.city-names').selectAll('text')
            .data(this.graph).join('text')
            .text((d)=>{
                const countyName = d.county=='BK'? 'Brooklyn':
                                   d.county=='QN'? 'Queens':
                                   d.county=='MN'? 'Manhattan':
                                   d.county=='BX'? 'Bronx': undefined
                
                return countyName
            })
            .attr('font-size',10)
            .attr('text-anchor','middle')
            .attr('dy',-15)
            .attr('fill','#F1F5FB')

            this.valueElements=d3.select('.values').selectAll('text')
            .data(this.graph).join('text')
            .text((d)=>{
                const value = this.category=='cost'? (d.cost.toLocaleString()+' '+'USD'):d.count.toLocaleString()+' '+'Tickets'
                return value
            })
            .attr('font-size',15)
            .attr('text-anchor','middle')
            .attr('fill','#F1F5FB')

        },
        createSvg(){
         this.svg = d3.select('#force-container')
                      .append('svg')
                      .attr('preserveAspectRatio', 'xMinYMin meet')
                      .attr('viewBox', `0 0 ${this.width} ${this.height}`)
                      .attr('class', 'force-graph')
        },
        getRadiusScale(){
            this.radiusScale= d3.scalePow()
            .exponent(0.5)
            .domain([0,this.maxValue])
            .range([0,this.width/10])
        },
        getSimulation(){
                    this.simulation = d3.forceSimulation()
                    .force('charge',d3.forceManyBody().strength(1))
                    .force('center',d3.forceCenter(this.center.x*2/3,this.center.y))
                    .force('collision',d3.forceCollide().radius((d)=>{
                        if(this.category=='cost'){
                            return this.radiusScale(d.cost)
                        }else{
                            return this.radiusScale(d.count)
                        }
                    }))
        }

    },
    computed:{
       
        maxValue(){
            if(this.category=='cost'){
                return d3.max(this.graphData,d=>d.cost)
            }else if(this.category=='tickets'){
                return d3.max(this.graphData,d=>d.count)
            }else{return undefined}
        },
        fillColor(){
            return d3.scaleOrdinal()
            .domain(['BK','QN','MN','BX'])
            .range(['#66C8FF', '#F58586', '#2DC73E', '#DBD45B'])
        },
        center(){
            return {x:this.width/2,y:this.height/2}
            }
    },
    mounted(){

        const unwatch = this.$watch(
            ()=>this.height,
            height=>{
                if(height){
                    this.createSvg();
                    this.center={x:this.width/2,y:this.height/2}
                    this.graph = [...this.graphData];
                    this.getRadiusScale()
                    this.getSimulation()

                    this.drawCircle();

                    this.simulation.nodes(this.graph)
                         .on('tick',()=>{
                             this.nodeElements.attr('cx',node=>node.x)
                             this.nodeElements.attr('cy',node=>node.y)

                             this.textElements.attr('x',node=>node.x)
                             this.textElements.attr('y',node=>node.y)

                             this.valueElements.attr('x',node=>node.x)
                             this.valueElements.attr('y',node=>node.y)
                         }
                         )
                    this.percentageMaking()
                    unwatch();
                }
            }
        )
    },
    updated(){
        // this.center={x:this.width/2,y:this.height/2}
        this.graph = [...this.graphData];
        this.getRadiusScale()
        this.getSimulation()
        this.nodeElements.data(this.graph)
        this.textElements.data(this.graph)
        this.valueElements.data(this.graph)

        this.nodeElements.transition().duration(1000).attr('r',(d)=>{
                                    if(this.category=='cost'){
                                    return this.radiusScale(d.cost)
                                    }else{
                                    return this.radiusScale(d.count)
                                    }
                                    })
        this.simulation.nodes(this.graph)
         .on('tick',()=>{
             this.nodeElements.attr('cx',node=>node.x)
             this.nodeElements.attr('cy',node=>node.y)
             this.textElements.attr('x',node=>node.x)
             this.textElements.attr('y',node=>node.y)

             this.valueElements.attr('x',node=>node.x)
             this.valueElements.attr('y',node=>node.y)


         }
         )

    }
}
</script>

<style scoped>
.annual-trend-description{
    display:flex;
    flex-direction:column;
    gap:0.5rem 0;
    position:absolute;
    right:1rem;
    height:50%;
    width:30%;
    top:15%;
}
.annual-trend-container{
    position:relative;
    height:100%;
}
#force-container{
    position:absolute;
}
.force-graph{
}
</style>