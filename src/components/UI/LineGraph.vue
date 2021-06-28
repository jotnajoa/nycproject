<template>
    <div>
        <svg 
        v-if='xMax'
        id='line-chart' :height='height' :width='width'>

            <!-- <path v-for='(data,index) of dataGroup' :key='index' class='line'></path> -->
            <!-- or I can create them in script -->
            <g class='axis x-axis' :transform='`translate(${0},${height-margin.vertical})`'></g>
            <g class='axis y-axis' :transform='`translate(${margin.horizontal},0)`'></g>

<!-- 결국에는 path 도 v-for로 엮어봐야함 -->
        </svg>
    </div>
</template>

<script>
import * as d3 from 'd3'
export default {
    props:['width','height','margin','dataGroup','xAxisName','yAxisName','lineColors'],
    data(){
        return{
            xAxis:undefined,
            yAxis:undefined,
            xMax:0,yMax:0,xMin:0,yMin:0,
            xScale:undefined,yScale:undefined
        }

    },
    computed:{
        graphData(){
            var cloned= [...this.dataGroup]
            return cloned.sort((a,b)=>d3.ascending(a[this.xAxisName],b[this.xAxisName]))
        }
    },
    methods:{
        addLabel(){

            d3.select('#line-chart').append('text').classed('x-label',true)
            .attr('transform',`translate(${this.width-this.margin.horizontal*1.5},${this.height-this.margin.vertical})`)
            .text('cost').style('fill','#F1F5FB').style('font-size','10px')


            d3.select('#line-chart').append('text').classed('y-label',true)
            .attr('transform',`translate(${0},${this.margin.vertical/2})`)
            .text(this.yAxisName).style('fill','#F1F5FB').style('font-size','10px')

        },
        defineDataKeys(){
            console.log('datagroup was not loaded?',this.dataGroup)
            // this.xAxisName=Object.keys(this.dataGroup[0][0])[0];
            // this.yAxisName=Object.keys(this.dataGroup[0][0])[1];
        },
        // 
        createAxis(){

            var xExtents =[] ;
            
            this.graphData.forEach((d)=>{
                var subArr = d;
                var extents = subArr.map(t=>t[this.xAxisName]);
                xExtents.push(extents)
            })

            var maxXvals =[];

            xExtents.forEach((t)=>{
                maxXvals.push(d3.max(t))
            });
            
            var yExtents = [];
            
            this.graphData.forEach((d)=>{
                var subArr = d;
                var extents = subArr.map(t=>t[this.yAxisName]);
                yExtents.push(extents)
            })

            var maxYvals=[];
            yExtents.forEach((t)=>{
                maxYvals.push(d3.max(t))
            });

            this.xMax= d3.max(maxXvals);
            this.yMax= d3.max(maxYvals);

            console.log(this.xMax,this.yMax)

            this.xScale = d3.scaleLinear().domain([this.xMin,this.xMax]).range([this.margin.horizontal,this.width-this.margin.horizontal*2])
            this.yScale = d3.scaleLinear().domain([this.yMin,this.yMax]).range([this.height-this.margin.vertical,this.margin.vertical]);
            
            const xAxis = d3.axisBottom(this.xScale);
            const yAxis = d3.axisLeft(this.yScale);

            d3.select('.x-axis').transition().duration(1000).call(xAxis.tickSize(0))
            d3.select('.y-axis').transition().duration(1000).call(yAxis.tickSize(-this.width+this.margin.horizontal*2).ticks(10))
            d3.select('.y-axis > .domain').remove()
            d3.selectAll('.y-axis > .tick > line').style('stroke-width',0.5).style('opacity',0.2).style("stroke-dasharray", ("2, 2"))
            d3.select('.x-axis').style('color','#F1F5FB')
            d3.select('.y-axis').style('color','#F1F5FB')
            d3.selectAll('.domain').style('stroke-width',0.5)
        },
        line(){
            return d3.line()
            .x(d=>this.xScale(d[this.xAxisName]))
            .y(d=>this.yScale(d[this.yAxisName]))
        },
        drawLines(linedata,index){
            // this line function will interate graphData and plot line graphs one by one
            if(index==0){

            var path = d3.select('#line-chart')
            .append('path')
            .attr('class','graph-line')
            .classed(`${index}-line`,true)
            .attr('d',this.line()(linedata))
            .attr('stroke',this.lineColors[index])
            .attr('stroke-width',1)
            .attr('fill','none')
            .style('opacity',0)

            if(path.node()){
            var pathLength = path.node().getTotalLength();
            console.log(pathLength)

            path.attr('stroke-dasharray',pathLength)
            .attr('stroke-dashoffset',pathLength)
            .transition()
            .duration(1000)
            .attr('stroke-dashoffset',0)
            .style('opacity',1)
            }
            
            }else{
            d3.select('#line-chart')
            .append('path')
            .attr('class','graph-line')
            .classed(`${index}-line`,true)
            .attr('d',this.line()(linedata))
            .attr('stroke',this.lineColors[index])
            .attr('stroke-width',1)
            .attr('fill','none')
            }
            this.addLabel()

        },
        clearLines(){
            d3.selectAll('.graph-line').remove()
        }
    },
    created(){

        const unwatch = this.$watch(
            ()=>this.dataGroup,
            data =>{
                if(data){
                    this.defineDataKeys();
                    this.createAxis();
                    
                    this.graphData.forEach((d,i)=>{
                        this.drawLines(d,i)
                    })
                    
                    unwatch()
                }
            }
        )

    },
    updated(){

        this.createAxis();
        this.clearLines();
        this.graphData.forEach((d,i)=>{
            this.drawLines(d,i)
        })

    }
}
</script>
<style>

</style>