<template>
    <div class='fatbarGraph-container'>

    </div>

    <div class='fatbar-tooltip fatbar-tooltip-hidden'>

    </div>
</template>

<script>
import * as d3 from 'd3'
export default {
    props:['width','height','margin','fatbarData','category','selectedYear'],
    data(){
        return{
            xAxis:[],
            yAxis:[],
            graphData:[[],[],[],[]],
            fatbarCategory:'cost',
            countyName:['Brooklyn','Queens','Manhattan','Bronx'],
            colors:['#66C8FF', '#F58586', '#2DC73E', '#DBD45B'],
            svg:undefined,
            subGroup:undefined,
            xScale:[],
            yScale:[]
        }
    },
    methods:{
        createSvg(){
            this.svg=d3.select('.fatbarGraph-container').append('svg')
                       .attr('preserveAspectRatio', 'xMinYMin meet')
                       .attr('viewBox', `0 0 ${this.width} ${this.height}`)
                       .attr('class','fatbarGraph-svg') 
        },
        createGroups(){
            const that = this;
            const trGap = (this.height-this.margin.vertical*2)/4+this.subSpacing
            this.subGroup=this.svg.selectAll('g')
                    .data(this.countyName)
                    .join('g') 
                    .attr('class',(_,i)=>{return `subgroups groups${i}`})
                    .attr('transform',(_,i)=>{
                        return `translate(0,${i*trGap})`
                        })
            
            this.subGroup.each(function(_,i){
                d3.select(this).append('g').attr('class',`fatbar-x-axis x-axis-${i}`).attr('transform',()=>{return `translate(0,${(that.height-that.margin.vertical*2)/4-that.subSpacing})`})
                d3.select(this).append('g').attr('class',`fatbar-y-axis y-axis-${i}`).attr('transform',()=>{return `translate(${that.margin.horizontal},${0})`})
            })

        },
        createScaleList(datalist){
            this.xScale=[];this.yScale=[];this.xAxis=[];this.yAxis=[];

            datalist.forEach((d)=>{
                const ticketLists = d.map(t=>t.ticketNumber);
                const xScale=d3.scaleBand()
                               .domain(ticketLists)
                               .range([this.margin.horizontal,this.width-this.margin.horizontal])
                               .padding(0.5)
                const xAxis = d3.axisBottom(xScale);
                
                const valueArr = d.map(t=>t.value);
                const yMax = d3.max(valueArr)
                const ranges = (this.height-this.margin.vertical*2)/4
                const yScale=d3.scaleLinear().domain([0,yMax]).range([ranges-this.subSpacing,0])
                const yAxis =d3.axisLeft(yScale);
                this.xScale.push(xScale)
                this.yScale.push(yScale)
                this.xAxis.push(xAxis);
                this.yAxis.push(yAxis);
            })
        },
        drawAxis(){
            // drawing xaxis
            this.xAxis.forEach((d,i)=>{
                d3.select(`.x-axis-${i}`).transition().duration(1000).call(d.tickSize(0).ticks(10))
            })
            this.yAxis.forEach((d,i)=>{
                d3.select(`.y-axis-${i}`).transition().duration(1000).call(d.ticks(8).tickSize(-this.width+this.margin.horizontal*2))
            })
            d3.selectAll('.fatbar-y-axis > .tick>line').style('stroke-width',0.5).style('opacity',0.2).style("stroke-dasharray", ("2, 2"))
            d3.select('.fatbar-x-axis').style('color','#F1F5FB')
            d3.select('.fatbar-y-axis').style('color','#F1F5FB')
            d3.selectAll('.fatbar-y-axis > .domain').remove()
        },
        createGraphData(category){
            var data ={...this.fatbarData};
            var resultArr=[[],[],[],[]]
            data.children.forEach((d,i)=>{
                var obj =[];
                const subarr =[...d.children];
                subarr.sort((a,b)=>{
                    if(category=='cost'){
                    return d3.descending(a['costSum'],b['costSum'])
                    }else{
                    return d3.descending(a['countSum'],b['countSum'])
                    }
                });

                for(let t =0;t<10;t++){
                    
                    if(category=='cost'){
                        
                        const ticketName = subarr[t].ticketName
                        const unitPrice = (subarr[t].costSum)/(subarr[t].countSum)
                        const object ={ticketNumber:`Type${t+1}`,county:this.countyName[i],ticketName:ticketName,value:subarr[t].costSum,unitPrice:unitPrice}
                        obj.push(object)
                    }else{
                        const ticketName = subarr[t].ticketName
                        const unitPrice = (subarr[t].costSum)/(subarr[t].countSum)
                        const object ={ticketNumber:`Type${t+1}`,county:this.countyName[i],ticketName:ticketName,value:subarr[t].countSum,unitPrice:unitPrice}
                        obj.push(object)
                    }
                }


                resultArr[i]=obj
            })

            this.graphData = resultArr;
        },
        drawBars(){
            const groups = d3.selectAll('.subgroups');
            const that = this;
            const ranges = (this.height-this.margin.vertical*2)/4-this.subSpacing

            groups.each(function(_,i){
                const prices =[that.graphData[i].map(t=>t.unitPrice)];
                const maxWidth = that.xScale[i].bandwidth();
                const maxPrice=Math.max(...prices[0])

                console.log(maxPrice,maxWidth,'max price and width',prices)

                  d3.select(this)
                  .selectAll('rect')
                  .data(that.graphData[i])
                  .join('rect')
                  .attr('x',d=>that.xScale[i](d.ticketNumber))
                  .attr('y',d=>that.yScale[i](d.value))
                  .attr('width',d=>(d.unitPrice/maxPrice)*maxWidth)
                  .attr('height',d=>ranges-that.yScale[i](d.value))
                  .attr('fill',()=>that.colors[i])
                  .attr('transform',(d)=>{
                      return `translate(${maxWidth/2-0.5*(d.unitPrice/maxPrice)*maxWidth},0)`
                      }).style('cursor','pointer').style('opacity',0.8)
                  .on('mouseover',function(d){
                      
                      d3.select('.fatbar-tooltip').classed('fatbar-tooltip-hidden',false)
                      d3.select('.fatbar-tooltip').html(()=>{
                          return `<div>${d3.select(this).datum().ticketName}</div>`
                      })
                      d3.select('.fatbar-tooltip').style('left',()=>{
                        if(d.x>innerWidth*0.9){
                            return ((d.x-100)+'px')
                        }else{
                        return (d.x+'px')
                        }
                        }).style('top',()=>{
                            return  (d.y*0.9+'px')
                        })
                      d3.select(this).attr('stroke','white')
                  })
                  .on('mouseout',function(){
                      d3.select('.fatbar-tooltip').classed('fatbar-tooltip-hidden',true)
                      d3.select(this).attr('stroke','none')
                  })

            })
            
        }
    },
    computed:{
        subSpacing(){
            return 0.1*(this.height-this.margin.vertical*2)/4
        }

    },
    mounted(){
       const unwatch = this.$watch(
           ()=>this.fatbarData,
           data=>{
               if(data){
                    this.createSvg();
                    this.createGraphData(this.fatbarCategory);
                    this.createScaleList(this.graphData)
                    this.createGroups()
                    this.drawAxis()
                    this.drawBars()
                    
                    unwatch()
               }
           }
       )
    },
    watch:{
        fatbarCategory:function(val){
            this.createGraphData(val)
            this.createScaleList(this.graphData)
            this.drawAxis()
            this.drawBars()
        },
        category:function(val){
            this.fatbarCategory=val;
            this.createGraphData(val)
        },
        selectedYear:function(){
            this.createGraphData(this.fatbarCategory)
            this.createScaleList(this.graphData)
            this.drawAxis()
            this.drawBars()
        }
    }
}
</script>

<style scoped>
.fatbar-tooltip{
    cursor: pointer;
    color:#1a1a1acb;
    position:fixed;
    padding:0.3rem;
    background-color:#F1F5FB;
    width:8rem;
    height:2.5rem;
    border-radius:2px;
    box-shadow:1px 1px 3px #1a1a1a63;
    font-size:0.6rem;
    display:flex;
    align-items: center;
}
.fatbar-tooltip-hidden{
    display:none
}

</style>