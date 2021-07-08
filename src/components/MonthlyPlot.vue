<template>
    <div>
        <svg id='trend-chart' :height='height' :width='width'>
            <g class='graph-part'></g>
            <g class='axis trend-x-axis' :transform='`translate(${0},${height-margin.vertical})`'></g>
            <g class='axis trend-y-axis' :transform='`translate(${margin.horizontal},0)`'></g>
        </svg>
    </div>
</template>

<script>
import * as d3 from 'd3'
export default {
    props:['width','height','margin','graphData'],
    data(){
        return{
            paddingSize:0.4
        }
    },
    methods:{
        dateFormat(t){
            const dateValue = t==0? 'Jan':
            t==1? 'Feb':
            t==2? 'Mar':
            t==3? 'Apr':
            t==4? 'May':
            t==5? 'Jun':
            t==6? 'Jul':
            t==7? 'Aug':
            t==8? 'Sep':
            t==9? 'Oct':
            t==10? 'Nov':
            t==11? 'Dec':'unknown'
            return dateValue
        },
        addLabel(){
            d3.select('#trend-chart').append('text').classed('x-label',true)
            .attr('transform',`translate(${this.width-this.margin.horizontal*2},${this.height-this.margin.vertical})`)
            .text('month').style('fill','#F1F5FB').style('font-size','10px')


            d3.select('#trend-chart').append('text').classed('y-label',true)
            .attr('transform',`translate(${0},${this.margin.vertical/3})`)
            .text('cases').style('fill','#F1F5FB').style('font-size','10px')
        },


        drawAxis(){
            if(this.xScale&&this.yScale){
            const xAxis = d3.axisBottom(this.xScale).tickSize(0).tickFormat(d=>this.dateFormat(d));
            d3.select('.trend-x-axis').transition().duration(1000).call(xAxis)
            const yAxis = d3.axisLeft(this.yScale).ticks(7).tickSize(0).tickFormat(function (d){
    return d3.format(".0f")(d);
})


            d3.select('.trend-y-axis').transition().duration(1000).call(yAxis)

            d3.select('.trend-y-axis').transition().duration(1000).call(yAxis.tickSize(-this.width+this.margin.horizontal*2))
            d3.selectAll('.trend-y-axis > .tick > line').style('stroke-width',0.5).style('opacity',0.2).style("stroke-dasharray", ("2, 2"))

            d3.select('.trend-x-axis').style('color','#F1F5FB')
            d3.select('.trend-y-axis').style('color','#F1F5FB')
            d3.select('.trend-y-axis > .domain').remove()

            }
        },
        drawLines(){
            d3.select('.graph-part')
              .selectAll('g')
              .data(this.graphData)
              .join('g')
              .attr('transform',d=>`translate(${this.xScale(d.month)},0)`)
              .selectAll('rect')
              .data((d)=>{

                  return this.subgroups
                             .map((t)=>{
                                 return {key:t,value:d[t]}
                                 })
              })
              .join('rect')
              .attr('class','graph-bars')
              .attr('x',d=>this.xSubScale(d.key))
              .attr('y',()=>this.height-this.margin.vertical)
              .attr('width',this.xSubScale.bandwidth())
              .attr('height',0)
              .transition().duration(1000)
              .attr('height',d=>this.height-this.margin.vertical-this.yScale(d.value))
              .attr("fill", d => this.color(d.key))
              .attr('y',d=>this.yScale(d.value))
        }
    },
    computed:{
        color(){
            return d3.scaleOrdinal()
            .domain(this.subgroups)
            .range(['#F78F67','#66c7ff'])
        },
        subgroups(){
            if(this.graphData){
            return Object.keys(this.graphData[0]).splice(1)
            }else{
                return null
            }
        },
        groups(){
            if(this.graphData){
                return this.graphData.map(d=>d.month)
            }else{return null}
        },
        xScale(){

            var bandscale= d3.scaleBand()
            .domain(this.groups)
            .range([this.margin.horizontal,this.width-this.margin.horizontal*2])
            .padding([this.paddingSize*1.3])
            return bandscale
        },
        yScale(){
            if(this.graphData){
            const yExtent1 = d3.max(this.graphData,d=>d.county)
            const yExtent2 = d3.max(this.graphData,d=>d.precinct);
            const max = Math.max(yExtent1,yExtent2)

            return d3.scaleLinear().domain([0,max])
                     .range([this.height-this.margin.vertical,this.margin.vertical])
            }
            else{return null}
        },
        xSubScale(){
            if(this.xScale){
                return d3.scaleBand()
                .domain(this.subgroups)
                .range([0,this.xScale.bandwidth()])
                .padding([this.paddingSize])
            }else{
                return null
            }
        }
    },
    watch:{
        graphData:function(){
            this.drawAxis();
            this.addLabel()
            this.drawLines()
        }
    }
}
</script>