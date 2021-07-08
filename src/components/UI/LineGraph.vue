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
            if(this.dataGroup){
            var cloned= [...this.dataGroup]


            return cloned.sort((a,b)=>d3.ascending(a[this.xAxisName],b[this.xAxisName]))
            }else{
                return null
            }
        },
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

            d3.select('.x-label').remove()
            d3.select('.y-label').remove()

            d3.select('#line-chart').append('text').classed('x-label',true)
            .attr('transform',`translate(${this.width-this.margin.horizontal*1.5},${this.height-this.margin.vertical})`)
            .text('cost').style('fill','#F1F5FB').style('font-size','10px')


            d3.select('#line-chart').append('text').classed('y-label',true)
            .attr('transform',`translate(${this.margin.horizontal/2},${this.margin.vertical/2})`)
            .text(this.yAxisName).style('fill','#F1F5FB').style('font-size','10px')

        },
        defineDataKeys(){

            // this.xAxisName=Object.keys(this.dataGroup[0][0])[0];
            // this.yAxisName=Object.keys(this.dataGroup[0][0])[1];
        },
        // 
        createAxis(){
            if(this.graphData){
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



            this.xScale = d3.scaleLinear().domain([this.xMin,this.xMax]).range([this.margin.horizontal,this.width-this.margin.horizontal*2])
            this.yScale = d3.scaleLinear().domain([this.yMin,this.yMax]).range([this.height-this.margin.vertical,this.margin.vertical]);
            
            const xAxis = d3.axisBottom(this.xScale);
            const yAxis = d3.axisLeft(this.yScale);
            if(this.dataGroup.length>2){
                d3.select('.x-axis').transition().duration(1000).call(xAxis.tickSize(5).tickFormat(d=>this.dateFormat(d)))
                d3.select('.x-axis > .domain').remove()
            }else{
                d3.select('.x-axis').transition().duration(1000).call(xAxis.tickSize(0))
            }

            d3.select('.y-axis').transition().duration(1000).call(yAxis.tickSize(-this.width+this.margin.horizontal*3).ticks(10))
            d3.select('.y-axis > .domain').remove()
            d3.selectAll('.y-axis > .tick > line').style('stroke-width',0.5).style('opacity',0.2).style("stroke-dasharray", ("2, 2"))
            d3.select('.x-axis').style('color','#F1F5FB')
            d3.select('.y-axis').style('color','#F1F5FB')
            d3.selectAll('.domain').style('stroke-width',0.5)
            }
        },
        line(){
            return d3.line()
            .x(d=>this.xScale(d[this.xAxisName]))
            .y(d=>this.yScale(d[this.yAxisName]))
        },
        drawLines(linedata,index){
            // this line function will interate graphData and plot line graphs one by one
            if(index==0||this.dataGroup.length>2){
            var that = this;
            var path = d3.select('#line-chart')
            .append('path')
            .attr('class','graph-line')
            .classed(`${index}-line`,true)
            .attr('d',this.line()(linedata))
            .attr('stroke',this.lineColors[index])
            .attr('stroke-width',1)
            .attr('fill','none')
            .style('opacity',0.4)
            .on('mouseover',function(){
                d3.selectAll('path').classed('selected-line',false)
                d3.selectAll('path').style('opacity',0.4)
                d3.select(this).classed('selected-line',true)
                d3.select(this).style('opacity',1)
                const selectedLine = this.getAttribute('stroke')
                const countyName = selectedLine=='#66C8FF'? 'Brooklyn':
                selectedLine=='#F58586'? 'Queens':
                selectedLine=='#2DC73E'? 'Manhattan':
                selectedLine=='#DBD45B'? 'Bronx':undefined;                
                that.$emit('hoveredCounty',countyName)
            })


            if(index==this.dataGroup.length-1){
                // which means all the interation is done
                d3.select('.graph-line').classed('selected-line',true)
            }


            if(path.node()){
            var pathLength = path.node().getTotalLength();


            path.attr('stroke-dasharray',pathLength)
            .attr('stroke-dashoffset',pathLength)
            .transition()
            .duration(1000)
            .attr('stroke-dashoffset',0)
            }
            d3.select('.graph-line').style('opacity',1)
            
            
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
        if(this.graphData){
        this.graphData.forEach((d,i)=>{
            this.drawLines(d,i)
        })
        }
    }
}
</script>
<style>
.selected-line{
    stroke-width:3;
    opacity:1;
}
path{
    cursor:pointer
}

</style>