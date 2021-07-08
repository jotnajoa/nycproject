<template>

<img src='/imgs/backgroundMap.png' class="backgroundimg">
    <transition name="openup" v-on:after-enter="transitionEnd">
    
    <div class='horizontal-container dark-background white-text' v-if='showup' ref='container'>
        <canvas id='myCanvas' ref='myCanvas'></canvas>
        <div class='menu-text white-text bold big-text'>Select year to explore</div>
        <year-select class='year-selection'></year-select>
        <div id="labels" ref='labelContainer'></div>
        <div class="switch-label big-text bold">
            Select filter option
        </div>
        <switch-form class='switch-form'
        :options='options'
        :smallSelection=false
        @selectedCategory='changeCategory'
        @click='drawSpheres'
        ></switch-form>
        <div class="summary">
            <div class='leftpart'>
                <div class="big-text bold left-title subpart">
                    <div>Total Parking Violation</div>
                    <div >Count of {{currentYear}} </div>
                    <div class='super-big-text'>{{summarySum}}  <span class='orange-text light medium-text'>tickets</span> </div>
                </div>
            </div>
            <div class='big-text bold rightpart subpart'>
                <div>Cost paid</div>
                <div class='big-text bold'>${{costSum}}</div>
                <br style='display:block;line-height:1rem;content:" ";margin:0.5rem 0 '>
                <div>Number of Plate</div>
                <div class='big-text bold'>{{plateSum}} <span class='orange-text light medium-text'>plates</span></div>
            </div>
        </div>
    </div>
        
    </transition>
    <loading-spinner v-if='isLoading'>
{{isLoading}}
    </loading-spinner>
</template>

<script>

let scene, camera, renderer,raycaster,canvas,light,animationFrame;
let frameCount=0;
import gsap from "gsap";
import * as THREE from 'three'
import YearSelect from '../components/UI/YearSelect.vue'

let sphereGroup=new THREE.Group();
let pointGroup =new THREE.Group();
export default {
  components: { YearSelect },
  data(){
      return{
          showup:false,
          sRadius:2,
          targetCounty:undefined,
          mouse:{x:undefined,y:undefined},
          getIntersect:false,
          maxRadius:1,
          spacing:2,
          currentSetup:'cost',
          width:undefined,
          height:undefined,
          options:['cost','tickets']
      }
  },
  watch:{
      boroughData(){
          if(sphereGroup.children.length>2 && document.querySelectorAll('.countTag')[2]){
        this.drawSpheres(); 
        this.updateText()
          }
      }
  },
  mounted(){
    this.showup=true;
    this.$store.dispatch('Landing/loadData',2021)

    const unwatch = this.$watch(
        
        () => this.$store.getters['Landing/boroSummary'],
        boroSummary =>{
            if(boroSummary){
                this.boroughData=boroSummary;
                this.init();
                this.animate();
                unwatch()
            }
        }
    )

    window.addEventListener('mousemove',this.mouseTrack)
    window.addEventListener('resize', this.updateViewSize)
    window.addEventListener('click',this.raycasterUpdate)

  },
  unmounted() {
      window.removeEventListener('mousemove',this.mouseTrack)
      window.removeEventListener('mousemove',this.updateViewSize)
      window.removeEventListener('click',this.raycasterUpdate)
      window.removeEventListener('resize',this.updateViewSize)
      cancelAnimationFrame(animationFrame);
    renderer=null;

// scene, camera, renderer,raycaster,canvas,light;


  },
  methods:{  
      async raycasterUpdate(){
        if(this.getIntersect && raycaster.intersectObjects(sphereGroup.children)){
            const countyName=raycaster.intersectObjects(sphereGroup.children)[0].object.userData.countyName
            this.$store.dispatch('boroughChange',countyName);
            this.$store.dispatch('ByGeoData/generateGeoJson')

            this.$store.dispatch('ByTicketData/changeTargetYear')
            await this.$store.dispatch('ByTicketData/loadYearData')


            this.$router.push(`/by_borough/${countyName}`)
            this.startLoading();
        }
      },
      startLoading(){
this.$store.dispatch('loadingChange',true)
      },
      endLoading(){
    this.$store.dispatch('loadingChange',false)
    },
      changeCategory(e){
          this.currentSetup=e;

          if(this.currentSetup=='tickets'){
              const hideGroup=document.querySelectorAll('.costTag');
              hideGroup.forEach((d)=>{
                  d.style.visibility='hidden'
              });
              const visibleGroup=document.querySelectorAll('.countTag');
              visibleGroup.forEach((d)=>{
                  d.style.visibility='visible'
              })
          }else if(this.currentSetup=='cost'){
            const hideGroup=document.querySelectorAll('.costTag');
              hideGroup.forEach((d)=>{
                  d.style.visibility='visible'
              });
              const visibleGroup=document.querySelectorAll('.countTag');
              visibleGroup.forEach((d)=>{
                  d.style.visibility='hidden'
              })
          }

      },
 transitionEnd(){
    this.updateViewSize()
    const color = 0xFFFFFF;
    const intensity = 1;
    const ambLight = new THREE.AmbientLight(color,3)
    light = new THREE.DirectionalLight(color, intensity);
    light.position.set(0, 30, 20);


    scene.add( light );
    scene.add( ambLight );
},
updateText(){
    // cost & count
    // countTag전부 선택 costTag전부선택
this.boroughData.forEach((d,i)=>{
    document.querySelectorAll('.costTag')[i].textContent='$'+d.cost.toLocaleString();
    document.querySelectorAll('.countTag')[i].textContent=d.count.toLocaleString();
})

},
init(){

scene =new THREE.Scene();
canvas=this.$refs.myCanvas
raycaster=new THREE.Raycaster();
raycaster
this.mouse = new THREE.Vector2();
this.updateViewSize()
this.drawSpheres()
setTimeout(()=>{
    sphereGroup.children.forEach((d)=>{
        this.drawTexts(d.userData.countyName,d)
})
    },1500)


},

animate(){
    frameCount+=0.005
    animationFrame=requestAnimationFrame(this.animate);
    raycaster.setFromCamera(this.mouse,camera);
    const intersetcs=raycaster.intersectObjects(sphereGroup.children) 
    if(intersetcs.length>0){
        
        this.explodeSphere(intersetcs[0].object)
        this.animatePoints(pointGroup.children[0])
        this.getIntersect=true
        
    }else if(intersetcs.length==0 && pointGroup.children.length==1){
        this.getIntersect=false;
        this.startLoading();
        const pointObj = pointGroup.children[0];
        pointGroup.remove(pointObj)
        this.sphereBack();
    }


    scene.background = new THREE.Color(0x333238)
    renderer.render(scene, camera);
},

drawSpheres(){
    let currentSetup = this.currentSetup;

    if(scene&&sphereGroup){
        for (var i = sphereGroup.children.length - 1; i >= 0; i--) {
            sphereGroup.remove(sphereGroup.children[i]);
        }
    }
    this.boroughData.forEach((d)=>{
    const radius= (currentSetup=='cost')? (d.cost/this.biggestCost)*this.maxRadius : (d.count/this.biggestCount)*this.maxRadius
    const segmentCount = Math.ceil(Math.pow(d.count,1/2))
    const sphereGeometry = new THREE.SphereGeometry(radius,segmentCount,segmentCount);
    const material = new THREE.MeshStandardMaterial({
        color:d.color,
        roughness:0.8,
        metalness:0.9,
        // specular:`${d.color.substring(0,5)}FF`,
        transparent:true,
        opacity:1
    })


    

    const position = (-1.5*this.spacing)+d.index*this.spacing*1.1
    const sphereMesh = new THREE.Mesh(sphereGeometry,material);
    sphereMesh.position.x=position;
    sphereMesh.position.y=-this.maxRadius/3
    sphereMesh.userData.count = d.count;
    sphereMesh.userData.cost = d.cost;
    sphereMesh.userData.color = d.color;

    const countyName = d.county=='BK'? 'Brooklyn':
                   d.county=='MN'? 'Manhattan':
                   d.county=='QN'? 'Queens':
                   d.county=='BX'? 'Bronx':'unknown'


    sphereMesh.userData.countyName = countyName
   
    sphereGroup.add(sphereMesh)
    })
    scene.add(sphereGroup)

},
drawTexts(contents,targetMesh){

const countyName = contents;

const labelContainer = this.$refs.labelContainer;


    const elem = document.createElement('div');
    elem.textContent=countyName;
    elem.classList.add('countyTag')
    labelContainer.appendChild(elem)

    const count = document.createElement('div');
    count.textContent=targetMesh.userData.count.toLocaleString();
    count.classList.add('countTag');
    labelContainer.appendChild(count)

    const cost = document.createElement('div');
    cost.textContent='$'+targetMesh.userData.cost.toLocaleString()
    cost.classList.add('costTag');
    labelContainer.appendChild(cost)

    const button = document.createElement('div');
    button.textContent=`Click to explore ${countyName}`
    button.classList.add('exploreTag');
    labelContainer.appendChild(button)
    button.addEventListener('click',()=>{
        this.moveToMap(countyName)
    })

    const tempV = new THREE.Vector3();

    targetMesh.updateWorldMatrix(true, false);
    targetMesh.getWorldPosition(tempV)


    tempV.project(camera);

    const x = (tempV.x * .5 + .5) * canvas.clientWidth;
    const y = (tempV.y * -.5 + .5) * canvas.clientHeight;

    elem.style.transform = `translate(-50%, -50%) translate(${x}px,${y}px)`;
    count.style.transform = `translate(-50%, -50%) translate(${x}px,${y-count.clientHeight/2}px)`;
    cost.style.transform = `translate(-50%, -50%) translate(${x}px,${y-cost.clientHeight/2}px)`;
    button.style.transform = `translate(-50%, -50%) translate(${x}px,${this.height*0.9}px)`;
    button.style.width='13rem'

    targetMesh.userData.x=x;
    targetMesh.userData.y=y;


},
targetHighlight(target){
    
    sphereGroup.children.forEach((d)=>{
        d.material.opacity=0.2
        target.material.opacity=0
    })
    const targetIndex=sphereGroup.children.indexOf(target)


    const costs = document.querySelectorAll('.costTag');
    costs.forEach((d)=>{
        gsap.to(d,{opacity:0,duration:0.5})
    })
    const counts = document.querySelectorAll('.countTag');
    counts.forEach((d)=>{
        gsap.to(d,{opacity:0,duration:0.5})
    })
    const county = document.querySelectorAll('.countyTag');
    county.forEach((d)=>{
        gsap.to(d,{opacity:0,duration:0.5})
    })

    const exploreTag = document.querySelectorAll('.exploreTag');
    exploreTag.forEach((d,i)=>{
        if(i!=targetIndex){
        gsap.to(d,{opacity:0.1,duration:0.5})
        }
    })

},
unHighlight(){
    const costs = document.querySelectorAll('.costTag');
    costs.forEach((d)=>{
        gsap.to(d,{opacity:1,duration:0.5})
    })
    const counts = document.querySelectorAll('.countTag');
    counts.forEach((d)=>{
        gsap.to(d,{opacity:1,duration:0.5})
    })
    const county = document.querySelectorAll('.countyTag');
    county.forEach((d)=>{
        gsap.to(d,{opacity:1,duration:0.5})
    })

    const exploreTag = document.querySelectorAll('.exploreTag');
    exploreTag.forEach((d)=>{

        gsap.to(d,{opacity:1,duration:0.5})

    })


},
updateViewSize(){
    if(window.innerWidth<1200){
        this.spacing=1.5;
        this.maxRadius=0.7
    }else if(window.innerWidth>=1200){
        this.spacing=2;
        this.maxRadius=1;
    }

    this.width=this.$refs.container.clientWidth;
    this.height=this.$refs.container.clientHeight;

    canvas.style.height=`${this.height}px`
    canvas.style.width=`${this.width}px`;

    this.drawSpheres();

var horizontalFov = 45;


    camera = new THREE.PerspectiveCamera( 45, this.width/this.height, 0.1, 100 );
camera.fov = (Math.atan(Math.tan(((horizontalFov / 2) * Math.PI) / 180) / camera.aspect) * 2 * 180) / Math.PI;


    renderer=new THREE.WebGLRenderer({
        canvas:canvas,
        alpha:true,
        transparent:true
        })
    renderer.setSize( this.width, this.height );
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    camera.position.set( 0, 0, 5 );

    setTimeout(()=>{
        if(sphereGroup.children.length!=0){
            sphereGroup.children.forEach((d)=>{this.moveText(d)})
            }
    },500)


},
moveText(targetMesh){
    const countyName = targetMesh.userData.countyName
    const tempV = new THREE.Vector3();
    targetMesh.updateWorldMatrix(true, false);
    targetMesh.getWorldPosition(tempV);
    tempV.project(camera);
    const x = (tempV.x * .5 + .5) * canvas.clientWidth;
    const y = (tempV.y * -.5 + .5) * canvas.clientHeight;
    targetMesh.userData.x=x;
    targetMesh.userData.y=y;

    const countyTags = document.querySelectorAll('.countyTag');
    const countTags = document.querySelectorAll('.countTag');
    const costTags = document.querySelectorAll('.costTag');
    const exploreTags = document.querySelectorAll('.exploreTag');
    var targetIndex=0;
    countyTags.forEach((d,i)=>{
        if(d.textContent==countyName){
            targetIndex=i;
            d.style.transform=`translate(-50%, -50%) translate(${x}px,${y}px)`;
        }
    });

    countTags[targetIndex].style.transform = `translate(-50%, -50%) translate(${x}px,${y-countTags[targetIndex].clientHeight/2}px)`;
    costTags[targetIndex].style.transform = `translate(-50%, -50%) translate(${x}px,${y-costTags[targetIndex].clientHeight/2}px)`;
    exploreTags[targetIndex].style.transform = `translate(-50%, -50%) translate(${x}px,${this.height*0.9}px)`;
},
mouseTrack(e){
this.mouse.x=(e.offsetX/this.width)*2-1;
this.mouse.y=-(e.offsetY/this.height)*2+1
// this.getIntersect=true;
},
explodeSphere(targetMesh){

gsap.to(targetMesh.material, {opacity: 0.1, duration: 1,
onComplete: this.drawSubDots, onCompleteParams: [targetMesh]
});

},
sphereBack(){

sphereGroup.children.forEach((d)=>{
gsap.to(d.material, {opacity: 1, duration: 1,
onComplete:this.endLoading
});

this.unHighlight()
})
},
drawSubDots(targetMesh){

this.targetHighlight(targetMesh)

if(pointGroup.children.length==0){

const randomNumWithin = (rngNum)=>{
    return (Math.random()-0.5)*2*rngNum
}

const x = targetMesh.position.x
const y = targetMesh.position.y
const radius= (this.currentSetup=='cost')? (targetMesh.userData.cost/this.biggestCost)*this.maxRadius : (targetMesh.userData.count/this.biggestCount)*this.maxRadius
const segmentCount = Math.ceil(Math.pow(targetMesh.userData.count,1/2))
const explodeExpansion=1.05
const explodeGeometry = new THREE.SphereGeometry(radius*explodeExpansion,segmentCount,segmentCount);
var pointMaterial;
if(segmentCount>300){
pointMaterial = new THREE.PointsMaterial( { color: targetMesh.userData.color,size:0.005,transparent:true,opacity:0.1,depthWrite: false,depthTest: false } );
}else{
    pointMaterial = new THREE.PointsMaterial( { color: targetMesh.userData.color,size:0.05,transparent:true,opacity:0.3,depthWrite: false,depthTest: false } );
}
//  
const pointsMesh = new THREE.Points( explodeGeometry, pointMaterial );

const {array}=pointsMesh.geometry.attributes.position;
const {count}=pointsMesh.geometry.attributes.position;
for(let i=0;i<count;i++){
    let i3 = i*3;
    array[i3]=randomNumWithin(radius)
    array[i3+1]=randomNumWithin(radius)
}
pointsMesh.position.x=x;
pointsMesh.position.y=y;

pointGroup.add(pointsMesh)
// targetMesh.position.z=-2*radius;
scene.add(pointGroup)

}
},
animatePoints(pointsMesh){
if(pointsMesh){
const {array}=pointsMesh.geometry.attributes.position;
const {count}=pointsMesh.geometry.attributes.position;
for(let i=0;i<count;i++){
    let i3 = i*3;
    array[i3]+=Math.sin(frameCount*Math.random()+i)*0.001
    array[i3+1]+=Math.cos(frameCount*Math.random()+i)*0.001
    // array[i3+2]=randomNumWithin(radius)
}
pointsMesh.geometry.attributes.position.needsUpdate = true;
}
},
moveToMap(county){
    this.$store.dispatch('boroughChange',county)
    this.$router.push(`/by_borough/${county}`)
}
},
    computed:{
        boroughData(){
            return this.$store.getters['Landing/boroSummary']
        },
        biggestCost(){
            let costarr = this.boroughData.map(d=>d.cost)
            let biggestValue = Math.max(...costarr);
            return biggestValue
        },
        biggestCount(){
            let countarr = this.boroughData.map(d=>d.count)
            let biggestValue = Math.max(...countarr);
            return biggestValue
        },
        isLoading(){
            return this.$store.getters.isLoading
        },
        currentYear(){
            return this.$store.getters['Landing/year']
        },
        summarySum(){
                if(this.boroughData.length>1){
                var countarr=this.boroughData.map(d=>d.count);
                var sumarr = countarr.reduce((a,b)=>a+b,0);
                return sumarr.toLocaleString()
                }else{
                    return undefined
                }
        },
        costSum(){
            if(this.boroughData.length>1){
            var costArr=this.boroughData.map(d=>d.cost);
            var sumarr = costArr.reduce((a,b)=>a+b,0);
            return sumarr.toLocaleString()
            }else{return undefined}
        },
        plateSum(){
            if(this.boroughData.length>1){
                const plateArr = this.boroughData.map(d=>d.plateCount);
                const sumArr = plateArr.reduce((a,b)=>a+b,0);
                return sumArr.toLocaleString();
            } else {return undefined}
        }
    }
  
}
</script>
<style scoped>
.horizontal-container{
    position:absolute;
    top:50%;
    transform:translate(0,-50%);
    height:70vh;
    width:100vw;
    padding:0;
    margin:0;
    left:0;
}
.openup-enter-active,
.openup-leave-active {
  transition: all 0.5s ease;
}

.openup-enter-from,
.openup-leave-to {
    opacity:0;
    height:0vh;
    }

#myCanvas{
    border:solid 1px white;
    width:100%;
    height:100%;
}
.year-selection{
    position:absolute;
    top:3rem;
    left:2rem;
}
.menu-text{
    position:absolute;
    left:2rem;
    top:1rem;
}
.switch-label{
    position:absolute;
    top:6rem;
    left:2rem;
}
.switch-form{
    position:absolute;
    top:8rem;
    left:2rem;
}
::v-deep #labels{
  position: absolute; 
  left: 0;            
  top: 0;
}

::v-deep #labels > div {
  position: absolute;  
  left: 0;          
  cursor: pointer;     
}
::v-deep .countTag , ::v-deep .costTag{
font-size:1.5rem;
pointer-events: none;

}
::v-deep .countTag{
 visibility:hidden;
}
::v-deep .countyTag{
    margin-top:0.5rem;
    font-size:1rem;
    opacity:0.7;
    pointer-events: none;
}

::v-deep .exploreTag{
border-bottom:solid 1px #F78F67;
text-align:center;
}
.summary{
    position:absolute;
    display:flex;
    flex-direction:row;
    align-content:flex-end;
    top:1rem;
    right:0rem;
    width:55%;
    height:30%;

}
.leftpart,.rightpart{
    flex-grow:1;
    display:flex;
    flex-direction:column;

}
.leftpart{
    width:25vw;
}
.rightpart{
    width:15vw;
}
.left-title.subpart{
position:relative;
left:25%;
}

</style>