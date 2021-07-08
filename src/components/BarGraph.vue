<template>
    <div class='annual-proportion-container'>
        <div id='stack-bar-container'
        :style="{height:height+'px',width:width+'px'}"
        ><div style='position:absolute' class='small-text'>Ratio<br>(out of 1)</div>
        <div style='position:absolute; right:0;bottom:10%' class='small-text'>Year</div>
        </div>
    </div>
</template>

<script>

import * as d3 from 'd3'
export default {
    props:['height','margin','width','graphData','category'],
    data(){
        return{
            svg:undefined,
            subgroups:undefined,
            groups:undefined,
            xGroupScale:undefined,
            yScale:undefined,
            colorScale:undefined,
            stackData:undefined,
        }
    },
    methods:{
        createSvg(){
         this.svg = d3.select('#stack-bar-container')
                      .append('svg')
                      .attr('preserveAspectRatio', 'xMinYMin meet')
                      .attr('viewBox', `0 0 ${this.width} ${this.height}`)
                      .attr('class', 'stack-graph')
        },
        createGroup(){
            this.subgroups=undefined;
            this.groups=undefined;
            if(this.graphData){
            this.subgroups=Object.keys(this.graphData[0]).splice(1)
            this.groups = this.graphData.map(d=>d.year)
            // groups가 숫자로되도 되나?
            }else{
                null
            }
        },
        createScale(){

            this.xGroupScale=d3.scaleBand()
            .domain(this.groups)
            .range([this.margin.horizontal,(this.width-this.margin.horizontal)])
            .padding([0.2])

            this.svg.append('g')
            .attr('class','stack-xAxis')
            .attr('transform',`translate(${0},${this.height-this.margin.vertical})`)
            .call(d3.axisBottom(this.xGroupScale).tickSize(0))

            this.yScale=d3.scaleLinear()
            .domain([0,1])
            .range([this.height-this.margin.vertical,this.margin.vertical])

            this.svg.append('g')
            .attr('class','stack-yAxis')
            .attr('transform',`translate(${this.margin.horizontal},${0})`)
            .call(d3.axisLeft(this.yScale).tickSize(-this.width+this.margin.horizontal*2).ticks(10))


            d3.select('.stack-yAxis > .domain').remove()
            d3.select('.stack-xAxis > .domain').remove()
            d3.selectAll('.stack-yAxis > .tick > line').style('stroke-width',0.5).style('opacity',0.2).style("stroke-dasharray", ("2, 2"))

        },
        createColorScale(){
            this.colorScale=d3.scaleOrdinal()
            .domain(this.subgroups)
            .range(['#66C8FF', '#F58586', '#2DC73E', '#DBD45B'])
        },
        createStack(){
            this.stackData=undefined;
            this.stackData=d3.stack().keys(this.subgroups)(this.graphData)
        },
        createBars(){

            d3.selectAll('.group-bars').remove()
            // d3.selectAll('.single-bars').remove
            // d3.selectAll('.single-').remove

            this.svg.append('g')
            .selectAll('g')
            .data(this.stackData)
            .join('g')
            .classed('group-bars',true)
            .attr('fill',(d)=>{
                // console.log('d',d,'and','d.key',d.key)
                return this.colorScale(d.key)})
            .selectAll('rect')
            .data(d=>d)
            .join('rect')
            .attr('x',(_,i)=>{return this.xGroupScale(2017+i)}
            )
            .attr('height',0)
            .attr('width',this.xGroupScale.bandwidth()/4)
            .attr('transform',`translate(${this.xGroupScale.bandwidth()*(3/8)},0)`)
            .style('opacity',0.8)
            .attr('y',this.height-this.margin.vertical)
            .transition().duration(1000)
            .attr('y',d=>this.yScale(d[1]))
            .attr('height',d=>this.yScale(d[0])-this.yScale(d[1]))
        },
        highlightYear(){
            d3.select('.highlight-rect').remove()

            this.svg.append('rect')
            .classed('highlight-rect',true)
            .attr('x',this.xGroupScale(this.selectedYear))
            .attr('y',0)
            .attr('width',this.xGroupScale.bandwidth())
            .attr('height',this.height)
            .attr('fill','#ffffff')
            .style('opacity',0)
            .transition().duration(1000)
            .style('opacity',0.2)
        }
    },
    mounted(){
        const unwatch = this.$watch(
            ()=>this.graphData,
            data=>{
                if(data){
                    this.createSvg();
                    this.createGroup();
                    this.createScale()
                    this.createColorScale();
                    this.createStack();
                    this.createBars();
                    this.highlightYear()
                    unwatch();
                }
            }
        )
    },
    watch:{
        category:function(){
            this.createStack();
            this.createBars()
        },
        selectedYear:function(){
            this.highlightYear()
        }
    },
    computed:{
        selectedYear(){
            return parseInt(this.$store.getters.yearSelected);
        }
    }
}
</script>
