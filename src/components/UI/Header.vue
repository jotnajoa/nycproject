<template>
<teleport to='body'>
<div class="headercontainer">

    <div class='header-nav'>
        <div class="title">
            Is street parking really free?
        </div>
        <div class="routers">
            <router-link to='/by_ticket'>By Ticket Type</router-link>
            <router-link to='/by_year'>By Year</router-link>
            <router-link :to='boroughPage'>By Borough</router-link>
            <router-link to='/'>Home</router-link>
        </div>
    </div>
</div>
</teleport>
</template>

<script>
export default {
    computed:{
        boroughPage(){
            if(this.$store.getters['ByGeoData/precinctGeoJson']==undefined){
                this.$store.dispatch('ByGeoData/generateGeoJson')
            }else{
                null
            }
            return `/by_borough/${this.$store.getters.boroughSelected}`}
    }
}
</script>

<style scoped>

.headercontainer{
    position:absolute;
    z-index: 2;
    top:1rem;
}

.routers{

    display:flex;
    flex-direction: row-reverse;
    gap:0px 10px;
    align-items: center;
}
.header-nav{
    width:99vw;
    display:flex;
    justify-content: space-between; 
}
.router-link-active{
    border-top: 3px solid rgb(52, 52, 52);
}

</style>