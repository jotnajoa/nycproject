<template>
  <Header v-if='!isCover'></Header>
  <router-view/>

  </template>

<script>
export default {
  computed:{
    isCover(){
      return this.$route.path=="/"
    }
  },
}
</script>

<style>

@import url('https://use.typekit.net/nqu0yne.css');
html{
font-family: quiche-sans, sans-serif;
font-weight: 400;
font-style: normal;
padding:0;
}
body{
  overflow-y:hidden;
}
body html{
  padding:0;
  margin:0;
}
#app{
padding:0;
} 

.backgroundimg{
  position:absolute;
  top:0;
  left:0;
  width:100vw;
  height:100vh;
}
div.backgroundimg{
  background-color:#F1F5FB;
  mask:radial-gradient(circle at 80% 50%, transparent , #F1F5FB 80%);
}
.blue{background:#66c7ff}
.green{background:#2DC73E;}
.yellow{background:#DBD45B;}
.orange{background:#F78F67;}
.white{background:#F1F5FB;}
.pink{background:#F58586;}
.white-text{color:#F1F5FB;}
.grey-text{color:#666666;}
.black-text{color:#1A1A1A;}
.orange-text{color:#F78F67;}
.blue-text{color:#66c7ff;}
.super-big-text{font-size:3.8rem;}
.medium-big-text{font-size:2.2rem;}
.big-text{font-size:1.4rem;}
.medium-text{font-size:1rem;}
.small-text{font-size:0.7rem;}
.bold{font-weight:600}
.medium{font-weight:300}
.light{font-weight:100}
.dark-background{
  background:#010007e0;
}
.light-dark-background{
  background:rgba(57, 57, 57,0.9);
}
.left-align{
  text-align:start
}

@media screen and (max-width: 1360px) {
  html {
    font-size: 13px;
  }
  body{
    overflow-y:scroll;
  }
}
@media screen and (max-width: 810px) {
  html {
    font-size: 10px;
  }
}

@media screen and (max-width: 500px) {

body{
 background:rgba(57, 57, 57,0.9);
}
.backgroundimg{
display:none;
}
}


</style>
