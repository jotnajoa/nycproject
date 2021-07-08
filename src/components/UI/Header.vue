<template>
<teleport to='body'>
<div class="headercontainer white">

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
a{
    text-decoration: none;
}
.headercontainer{
    position:fixed;
    z-index: 2;
    padding:0.5rem;
    top:0;
    left:0;
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


@media screen and (max-width: 500px) {

.headercontainer{
    color:#F1F5FB;
    background:rgba(57, 57, 57,0);
    position:fixed;
    z-index: 2;
    padding:0.5rem;
    top:0;
    left:0;
}
.routers a{
    color:#F1F5FB;
}

.router-link-active{
    border-top: 3px solid #F78F67;
}

}

</style>