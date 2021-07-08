<template>
    <div id='tree-container'>
        
    </div>
    <div class='tree-tooltip tooltip-hidden'>

    </div>
</template>

<script>
import * as d3 from 'd3'
export default {
    props:['width','height','margin','treeSelectedCategory','selectedYear'],
    data(){
        return{
            svg:undefined,
            hierarchyData:undefined,
            sortingTarget:undefined,
            blocks:undefined,
            colorArr:['#66C8FF', '#F58586', '#2DC73E', '#DBD45B'],
            treemapClicked:false,
            selectedArea:'Brooklyn',
            treemapState:[],
            frequentTicketType:undefined,
            frequentTicketCount:undefined,
            top10Cases:[
                {county:'Brooklyn',list:[]},
                {county:'Queens',list:[]},
                {county:'Manhattan',list:[]},
                {county:'Bronx',list:[]}
            ]
        }
    },
    methods:{
        updateTreemapState(){
            this.treemapState[0]=this.frequentTicketType;
            this.treemapState[1]=this.selectedArea
            this.treemapState[2]=this.frequentTicketCount;
            this.treemapState[3]=this.top10Cases

            this.$emit('treemapState',this.treemapState)
            console.log(this.treemapState)
        },
        clickdetection(e){
                if(e.target.classList[0]=='tile'||e.target.classList[0]=='ticket-type-text'){
                    null
                }else{
                    this.treemapClicked=false;
                    d3.selectAll('.groups').each(function(){
                        d3.select(this).attr('clicked',false)
                    })
                    d3.select('.tree-tooltip').classed('tooltip-hidden',true)
                    d3.selectAll('.groups').each(function(){
                        d3.select(this).classed('selectedTile',false)
                        d3.select(this).classed('unselectedTile',true)
                    })
                }

        },
        startLoading(){
        this.$store.dispatch('loadingChange',true)
        },
         finishLoading(){
        this.$store.dispatch('loadingChange',false)
        },
        createTop10(data){

            for(let i=0;i<4;i++){



                const type = data.children[i]
                                 .children
                                 .map(t=>{
                                        var ticketName = t.data.ticketName;
                                        if (ticketName.length > 18) {
                                          ticketName = ticketName.substring(0, 18) + "...";
                                        }
                                     return{name:ticketName,count:t.data.countSum}}
                                     
                                     )
                this.top10Cases[i].list=type.slice(0,10)
            }
            console.log(this.top10Cases)
        },
        createSvg(){
            this.svg=d3.select('#tree-container').append('svg')
            .attr('preserveAspectRatio', 'xMinYMin meet')
            .attr('viewBox', `0 0 ${this.width} ${this.height}`)
            .attr('class','tree-map')
        },
        async createHierarchy(year){

            this.startLoading();
            var predata = await d3.json(`/summaryData/${year}treemap.json`)
            this.$emit('treemapSource',predata)
            var data = {...predata}

            this.$emit('treemapSource',data)
            this.finishLoading();
            
            var result =d3.hierarchy(data,(d)=>{
                        return d['children']})
                        .sum((d)=>{
                            if(this.treeSelectedCategory=='cost'){

                                this.sortingTarget = 'costSum'
                                return d["costSum"]
                            }else{

                                this.sortingTarget = 'countSum'
                                return d["countSum"]
                            }
                        })
                        .sort((node1,node2)=>{
                            if(this.treeSelectedCategory=='cost'){

                                return node2.data['costSum']-node1.data['costSum']
                            }else{
                                return node2.data['countSum']-node1.data['countSum']
                            }
                        })

            var forResult =d3.hierarchy(data,(d)=>{
                        return d['children']})
                        .sum((d)=>{
                                this.sortingTarget = 'countSum'
                                return d["countSum"]
                        })
                        .sort((node1,node2)=>{
                                return node2.data['countSum']-node1.data['countSum']
                        })
            this.createTop10(forResult)

            let createTreeMap = d3.treemap().size([this.width,this.height]).padding(0)
            createTreeMap(result);



            this.hierarchyData=result 
            

            this.drawTiles(result)
        },
        drawTiles(data){    
            var that = this;

            var outline = this.svg.selectAll('g')
            .data(data.children)
            .join('g')
            .attr('class','groups unselectedTile')
            .attr('clicked',false)
            .on('mouseover',function(){
                
                d3.select(this).classed('selectedTile',true)
                d3.select(this).classed('unselectedTile',false)

            })
            .on('mouseout',function(){
                d3.select(this).classed('selectedTile',false)
                d3.select(this).classed('unselectedTile',true)

            })
            .on('click',function(){

                var othersClicked=false;

                outline.each(function(){
                    if(d3.select(this).attr('clicked')=='true'){
                        othersClicked=true
                    }
                })


                if(d3.select(this).attr('clicked')=='false' && !othersClicked ){

                    that.treemapClicked=true
                    that.selectedArea=d3.select(this).datum().data.county;
                    that.frequentTicketType=d3.select(this).datum().children[0].data.ticketName;
                    that.frequentTicketCount=d3.select(this).datum().children[0].data.countSum

                    d3.select('.tree-tooltip').classed('tooltip-hidden',false)
                    d3.select(this).attr('clicked',true);
                    d3.select(this).classed('selectedTile',true);
                    d3.select(this).classed('unselectedTile',false);
                    outline.on('mouseout',null)
                    outline.on('mouseover',null)
                }else if(d3.select(this).attr('clicked')=='false' && othersClicked){
                    // 일단 모두 false로
                    that.treemapClicked=true
                    that.selectedArea=d3.select(this).datum().data.county
                    that.frequentTicketType=d3.select(this).datum().children[0].data.ticketName
                    that.frequentTicketCount=d3.select(this).datum().children[0].data.countSum

                    outline.each(function(){
                        d3.select(this).attr('clicked',false)
                        d3.select(this).classed('selectedTile',false);
                        d3.select(this).classed('unselectedTile',true)
                    })

                    d3.select(this).attr('clicked',true)
 
                    d3.select(this).classed('selectedTile',true);
                    d3.select(this).classed('unselectedTile',false)
                }else if(d3.select(this).attr('clicked')=='true'){
                    that.treemapClicked=false
                    d3.select('.tree-tooltip').classed('tooltip-hidden',true)
                    d3.select(this).attr('clicked',false)
                    d3.select(this).classed('selectedTile',false);
                    d3.select(this).classed('unselectedTile',true)
 
                    outline.on('mouseover',function(){
                            d3.select(this).classed('selectedTile',true)
                            d3.select(this).classed('unselectedTile',false)
                            })
                            .on('mouseout',function(){
                            d3.select(this).classed('selectedTile',false)
                            d3.select(this).classed('unselectedTile',true)

                     })
                }

            })

            outline.each(function(d){
                var sum= d3.select(this).datum().value

                var colorScale=d3.scaleOrdinal()
                                 .domain(['Brooklyn','Queens','Manhattan','Bronx'])
                                 .range(['#66C8FF', '#F58586', '#2DC73E', '#DBD45B'])

                d3.select(this).selectAll('rect')
                .data(d.children)
                .join('rect')
                .attr('class','tile')
                .attr('x',t=>t.x0)
                .attr('y',t=>t.y0)
                .attr('width',(t)=>{
                    return t.x1-t.x0
                    })
                .attr('height',(t)=>{
                    return t.y1-t.y0
                    })
                .attr('fill',(t)=>colorScale(t.parent.data.county))
                .attr('stroke','#f1f5fbbe')
                .on('mouseover',function(d){
                    var groupclicked=d3.select(this).node().parentNode.getAttribute('clicked')

                    if(groupclicked=='true'){
                    d3.select('.tree-tooltip').html(()=>{   

                        const unit=that.treeSelectedCategory=='cost'? 'USD':'Tickets'
                        console.log(that.treeSelectedCategory)
                        const ending=d3.select(this).datum().value.toLocaleString()+unit

                        return `<div>${d3.select(this).datum().data.ticketName}
                                <br><div style='font-size:0.9rem;font-weight:bold;color:#F78F67'>${ending}</div></div>`
                    })
                    d3.select('.tree-tooltip').style('left',()=>{
                        if(d.x>innerWidth*0.9){

                            return ((d.x-100)+'px')
                        }else{
                        return (d.x+'px')
                        }
                    })
                    d3.select('.tree-tooltip').style('top',()=>{
                        return  (d.y*0.9+'px')
                    })
                    }
                   

                })

                d3.select(this).selectAll('text')
                .data(d.children)
                .join('text')
                .attr('class','ticket-type-text')
                .text((d,i)=>{
                    if(i<5){
                        var pct = Math.floor(d.value*100/sum)/100
                        return Math.floor(pct*100)+'%'
                    }else if(i>=5 && i<10){
                        return '...'
                    }else{
                        return '.'
                    }
                    })
                .attr('x',t=>(t.x0+t.x1)/2)
                .attr('y',t=>(t.y0+t.y1)/2)
                .attr('text-anchor','middle')
                .attr('fill','#f1f5fbbe')
            })

        }
    },
    mounted(){
        window.addEventListener('click',this.clickdetection)  
        setTimeout(()=>{

        this.treemapState=[this.treemapClicked,this.selectedArea]
        this.createSvg();
        this.createHierarchy(this.selectedYear)

        // selectedArea = Brooklyn, - done
        // Brooklyn highlight


        // fillup most frequent ticket type


        // fill up most frequent ticket count
        },1000)
        setTimeout(()=>{
        d3.select('.groups').classed('selectedTile',true)
        d3.select('.groups').classed('unselectedTile',false)
        d3.selectAll('.groups').on('mouseout',null)
        d3.selectAll('.groups').on('mouseover',null)
        d3.selectAll('.groups').on('mouseover',()=>{
        d3.select('.tree-tooltip').classed('tooltip-hidden',false)
        })
        d3.select('.groups').attr('clicked',true)
        this.frequentTicketType=d3.select('.groups').datum().children[0].data.ticketName
        this.frequentTicketCount=d3.select('.groups').datum().children[0].data.countSum
        this.updateTreemapState()

        },1500)

    },
    unmounted(){
        window.removeEventListener('click',this.clickdetection)
    },
    watch:{
        selectedYear:function(val){
            this.createHierarchy(val)
            setTimeout(()=>{
            d3.select('.groups').classed('selectedTile',true)
            d3.select('.groups').classed('unselectedTile',false)
            d3.selectAll('.groups').on('mouseout',null)
            d3.selectAll('.groups').on('mouseover',null)
            d3.selectAll('.groups').on('mouseover',()=>{
            d3.select('.tree-tooltip').classed('tooltip-hidden',false)
            })
            d3.select('.groups').attr('clicked',true)
            this.frequentTicketType=d3.select('.groups').datum().children[0].data.ticketName
            this.frequentTicketCount=d3.select('.groups').datum().children[0].data.countSum
            this.updateTreemapState()
            },500)

        },
        treeSelectedCategory:function(){
             this.createHierarchy(this.selectedYear)
             this.updateTreemapState()
        },
        selectedArea:function(){
            this.updateTreemapState()
        },
        treemapClicked:function(){
            
            this.updateTreemapState()
        }
    }
}
</script>

<style>
.tree-tooltip{
    color:#1a1a1acb;
    position:fixed;
    padding:0.3rem;
    background-color:#F1F5FB;
    width:8rem;
    height:4.5rem;
    border-radius:2px;
    box-shadow:1px 1px 3px #1a1a1a63;
    font-size:0.6rem;
    display:flex;
    align-items: center;
}
.tooltip-hidden{
    display:none
}
.selectedTile{
    opacity:1;
    transition: opacity 0.5s ease-out;
}
.unselectedTile{
    opacity:0.5;
    transition: opacity 0.5s ease-out;
}
.groups{
    cursor:pointer
}
</style>