<template>

  <dat-gui closeText="Close controls" openText="Open controls" closePosition="bottom">
    
    
    <dat-folder label="variables">
        <dat-number v-model="cameraZ" :min="0" :max="5" :step="0.5" label="Camera Distance"/>
        <dat-number v-model="maxRadius" :min="1" :max="5" :step="0.1" label="Max radius"/>
        <dat-number v-model="spacing" :min="1" :max="10" :step="0.5" label="Spacing"/>
    </dat-folder>


  </dat-gui>

</template>
<script>
export default {
    data(){
        return{
            cameraZ:5,
            maxRadius:5,
            spacing:5
        }
    },
    watch:{
        cameraZ:function(val){
            this.$store.dispatch('GuiElement/cameraChange',val)
        },
        radiusChange:function(val){
            this.$store.dispatch('GuiElement/radiusChange',val)
        },
        spacingChange:function(val){
            this.$store.dispatch('GuiElement/spacingChange',val)
        },
    }
}
</script>