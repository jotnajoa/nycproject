<template>
<div class="radio-toolbar medium medium-text">
<div>
<input type="radio" id="year1" value=2021 v-model="picked">
<label for="year1">2021</label>
</div>

<div>
<input type="radio" id="year2" value=2020 v-model="picked">
<label for="year2">2020</label>
</div>

<div>
<input type="radio" id="year3" value=2019 v-model="picked">
<label for="year3">2019</label>
</div>
<div>
<input type="radio" id="year4" value=2018 v-model="picked">
<label for="year4">2018</label>
</div>
<div>
<input type="radio" id="year5" value=2017 v-model="picked">
<label for="year5">2017</label>
</div>

</div>
        
</template>

<script>
export default {
    data(){
        return{
            picked:undefined,
        }
    },
    watch:{
        picked:async function(val){
            this.$store.dispatch('loadingChange',true)

            await this.$store.dispatch('selectingYear',val)
            await this.$store.dispatch('Landing/loadData',val)

            await this.$store.dispatch('loadingChange',false)

        }
    },
    created(){
        this.picked = this.$store.getters.yearSelected
    }
}
</script>

<style scoped>
.radio-toolbar input[type="radio"]:checked+label {
  color:#66C8FF
}
.radio-toolbar{
    display:flex;
    flex-direction: row;
    gap:0 1rem;
}

</style>