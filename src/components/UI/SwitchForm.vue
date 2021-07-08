
<template>
        
<form class="form">
    
    <div class='switch-field'
    v-if='fiveSelection'>

        <input type="radio" id="radio-one" name="switch-one" :value="options[0]" 
        v-model='selected'/>
        <label for="radio-one">{{options[0].toUpperCase()}}</label>

        <input type="radio" id="radio-two" name="switch-two" :value="options[1]" 
        v-model='selected'/>
        <label for="radio-two">{{options[1].toUpperCase()}}</label>

        <input type="radio" id="radio-three" name="switch-three" :value="options[2]" 
        v-model='selected'
        />
        <label for="radio-three">{{options[2].toUpperCase()}}</label>


        <input type="radio" id="radio-four" name="switch-four" :value="options[3]" 
        v-model='selected'
        />
        <label for="radio-four">{{options[3].toUpperCase()}}</label>


        <input type="radio" id="radio-five" name="switch-five" :value="options[4]" 
        v-model='selected'
        />
        <label for="radio-five">{{options[4].toUpperCase()}}</label>

    </div>
    <div :class = "{ 'switch-field' : !smallSelection,
                     'small-switch-field':smallSelection}"
     v-if='twoSelection'>

        <input type="radio" :id="'radio-first'+id" name="switch-first" 
        @change="categoryChange"
        :value="options[0]" 
        v-model='selected'
        />
        <label :for="'radio-first'+id">{{options[0].toUpperCase()}}</label>

        <input type="radio" :id="'radio-second'+id" name="switch-second" 
        @change="categoryChange"
        :value="options[1]" 
        v-model='selected'
        />
        <label :for="'radio-second'+id">{{options[1].toUpperCase()}}</label>
    </div>
</form>

</template>

<script>
export default {

    props:['options','smallSelection','id'],
    data(){
        return{
            selected:undefined
            }
    },

    methods:{
        categoryChange(){
            this.$emit("selectedCategory", this.selected);
        }
    },
    computed:{

        fiveSelection(){
            let bool = this.options.length==5? true:false
            return bool
            },
        twoSelection(){
            let bool = this.options.length==2? true:false;
            return bool
            }
    },
    mounted(){
        this.selected=this.options[0]
    }
}
</script>

<style scoped>
.form{
    z-index:5
}
.switch-field {
    display: flex;
    overflow: hidden;
}

.switch-field input {
    position: absolute !important;
    clip: rect(0, 0, 0, 0);
    height: 1px;
    width: 1px;
    border: 0;
    overflow: hidden;
}


.switch-field label {
    background-color: #FFFFFF;
    color: #666666af;
    font-size: 0.6rem;
    line-height: 1;
    text-align: center;
    padding: 0.1rem 0.8rem;
    /* margin-right: -1px; */
    border: 1px solid rgba(0, 0, 0, 0.2);
    box-shadow: inset 0 0.5px 0.5px rgba(0, 0, 0, 0.13);
    transition: all 0.1s ease-in-out;
}


.switch-field label:hover {
    cursor: pointer;
}

.switch-field input:checked + label {
    background-color: #66c7ff;
    color:#F1F5FB;
    box-shadow: none;
}

.switch-field label:first-of-type {
    border-radius: 1px 0 0 1px;
}

.switch-field label:last-of-type {
    border-radius: 0 1px 1px 0;
}







.small-switch-field {
    display: flex;
    overflow: hidden;
}

.small-switch-field input {
    position: absolute !important;
    clip: rect(0, 0, 0, 0);
    height: 1px;
    width: 1px;
    border: 0;
    overflow: hidden;
}


.small-switch-field label {
    background-color: #FFFFFF;
    color: #1A1A1A;
    font-size: 0.8rem;
    line-height: 1;
    text-align: center;
    padding: 0.2rem 0.4rem;
    /* margin-right: -1px; */
    border: 1px solid rgba(0, 0, 0, 0.2);
    box-shadow: inset 0 0.5px 0.5px rgba(0, 0, 0, 0.13);
    transition: all 0.1s ease-in-out;
}


.small-switch-field label:hover {
    cursor: pointer;
}

.small-switch-field input:checked + label {
    background-color: #66c7ff;
    color:#F1F5FB;
    box-shadow: none;
}

.small-switch-field label:first-of-type {
    border-radius: 1px 0 0 1px;
}

.small-switch-field label:last-of-type {
    border-radius: 0 1px 1px 0;
}





</style>