<template>
<div>This is Year View</div>
<div class='graphcontainer' ref='graphcontainer'
>

<line-graph class='graphcontainer'
:width='width'
:height='height'
:margin='margin'
:dataGroup='dataGroup'
:xAxisName='xAxisName'
:yAxisName='yAxisName'
:lineColors='lineColors'
></line-graph>
</div>
</template>
<script>
export default {

    data(){
        return{
            rawData:undefined,
            // targetYearData in boroughAnalysis case
            dataGroup:[],

            width:0,
            height:0,
            numberOfstep:10,
            xAxisName:undefined,
            yAxisName:undefined,
            margin:{vertical:undefined,horizontal:undefined},
            selectedCounty:undefined,
            countyPrecinctCount:undefined,
            lineColors:['#F78F67','#66C7FF'],
            selectedPrecinct:undefined,
            maxCosts:[]
            // 여기있는 selectedCounty는 나중에 합칠 때 지운다!!!!!!
        }
    },
    async mounted(){
        this.selectedCounty=this.$store.getters.boroughSelected;
        await this.$store.dispatch('ByTicketData/loadYearData');
        this.rawData= this.$store.getters['ByTicketData/targetYearData']
        this.getMaxCost()
        // 이거 나중에  68이 아니라 진짜 받아서 넣어야한다!!!
        this.$store.dispatch('ByTicketData/setTargetPrecinct',68);
        this.selectedPrecinct=this.$store.getters['ByTicketData/targetPrecinct']
        this.createCountyGraphDataSet(this.rawData);
        this.createPrecinctGraphDataSet()
        this.getWidthHeight();
    },
    computed:{
        targetCountyData(){return this.$store.getters['ByTicketData/selectedBoroughData']},
        maxCost(){
            return Math.max(...this.maxCosts)
        }
    },
    methods:{
        getMaxCost(){
            // Precinct Max Value
            const targetPrecinctArr=this.rawData.filter(d=>d['Precinct']==this.selectedPrecinct);

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

            // County Max Value


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
            const targetPrecinctArr=this.rawData.filter(d=>d['Precinct']==this.selectedPrecinct);

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
        getWidthHeight(){
            this.width=this.$refs.graphcontainer.clientWidth;
            this.height=this.$refs.graphcontainer.clientHeight;
            console.log(this.width,this.height)
            this.margin.vertical=this.height*0.1;
            this.margin.horizontal=this.width*0.05;
            console.log(this.margin)
        },
        createCountyGraphDataSet(){

            this.countyPrecinctCount = [...new Set(this.targetCountyData.map(d=>d['Precinct']))].length;


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
.graphcontainer{
    width:500px;
    height:500px;
}
</style>