<template>
<img src='/imgs/backgroundMap.png' class="backgroundimg">

<div class='backgroundimg'></div>

<div class="coverpage">
  <div class='left-side'>
    <div class="coverTitle bold">
      Is street parking really <span class='nofill'>free?</span>
    </div>
    <div class="description medium-text medium">
      Lorem Ipsum is simply dummy text of the printing and typesetting industry. 
      Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
       when an unknown printer took a galley of type and scrambled it to make a type 
       specimen book. It has survived not only five centuries, but also the leap into 
       electronic typesetting, remaining essentially unchanged. It was popularised 
       in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, 
       and more recently with desktop publishing software like Aldus PageMaker including 
       versions of Lorem Ipsum.
    </div>
    <router-link class='launchbtn blue white-text medium big-text' to='/boroughselection'>
    Launch Park Meter
    </router-link>
  </div>
  <div class="right-side">
    <div class="dot-container">
      <img class='imgs flip' src="/imgs/dollar.png" alt="">
      <div class="ripple"></div>
    </div>

      <div class="dot-container">
      <img class='imgs flip' src="/imgs/dollar.png" alt="">
      <div class="ripple"></div>
    </div>

     <div class="dot-container">
      <img class='imgs flip' src="/imgs/dollar.png" alt="">
      <div class="ripple"></div>
    </div>

      <div class="dot-container">
      <img class='imgs flip' src="/imgs/dollar.png" alt="">
      <div class="ripple"></div>
      </div>

  </div>
</div>

</template>

<script>
// @ is an alias to /src
import * as $ from 'jquery';

export default {
mounted(){

  $( ".dot-container" ).each(function() {
  $( this )
  .css({'left':`${Math.random()*0.5*window.innerWidth}px`})
  .css({'top':`${Math.random()*0.5*window.innerHeight}px`})
})

}
}
</script>
<style scoped>
.imgs{
  width:30px;
  height:30px;
}
.dot-container{
  position:absolute;
}


.flip {
  backface-visibility: visible !important;
  animation: flip 1.2s infinite;
}
@keyframes flip {
  0% {
    transform: perspective(400px) rotateY(0);
  }
  60% {
    transform: perspective(400px) translateZ(50px) 
      translateY(-20px)
      rotateY(180deg);
      opacity:0
  }
  100% {
    transform: perspective(400px) 
      translateY(-40px);
      opacity:0
  }
}

.ripple {
/*   margin: auto; */
/*   margin-top: 5rem; */
  border:solid 1px white;
  background-color: rgb(26, 117, 206,0.5);
  width: 2px;
  height: 2px;
  border-radius: 50%;
  position:relative;
  animation: ripple 5s linear infinite;
}

.ripple::before,
.ripple::after{
  content:"";
  position:absolute;
  top:0;
  left:0;
  right:0;
  bottom:0;
  border-radius: 50%;
  animation: ripple 5s linear infinite 2s;
}
.ripple::after {
  animation: ripple 5s linear infinite 3s;
}
@keyframes ripple {
  0% {
    box-shadow: 0 0 0 .7rem rgb(26, 117, 206,0.3);
  }
  100% {
    box-shadow: 0 0 0 8rem rgba(255,255,255, 0);
  }
}

.launchbtn{
  box-shadow:-0.2rem 0.2rem #F78F67;
  box-sizing: content-box;
  display: block;
  width:15rem;
  height:2rem;
  text-decoration: none;
  position:absolute;
  right:0px;
  bottom:10%;
  text-align:center;
}
.nofill{
  color: #F1F5FB;
  text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;
}
.coverpage{
  position:absolute;
  top:0%;
  left:0%;
  padding:0% 2%;
  display:flex;
  flex-direction: row;
  height:100%;
}
.coverTitle{
  margin-top:15%;
  font-size:5rem;
  width:90%;
}
.right-side{
    width:50%;
    position:relative;
}
.left-side{
    position:relative;
    width:35%;
}
@media screen and (max-width:810px){
  .right-side{
    display:none
  }
  .left-side{width:100%;
  text-align:center;}

  .launchbtn{
  /* box-shadow:-0.2rem 0.2rem #F78F67; */
  /* box-sizing: content-box; */
  display: block;
  width:30rem;
  height:3rem;
  font-size:2rem;
  /* text-decoration: none; */
  position:absolute;
  left:50%;
  top:80%;
  transform:translate(-50%,0%);
  text-align:center;
}
.coverTitle{
  margin-top:15%;
  font-size:5rem;
  width:100%;
}
.description{
  width:50%;
  margin:auto;
  margin-top:5rem;
  font-size:1.5rem;
  text-align:start;
}
}

@media screen and (max-width:550px){
.description{
  width:80%;

  margin:auto;
  margin-top:5rem;
  font-size:1.3rem;
  text-align:start;
}
}
@media screen and (max-width:321px){
.description{
  display:none;
}
  .launchbtn{
    width:80%;
    left:50%;
    transform:translate(-50%,0%);
  }
}
</style>
