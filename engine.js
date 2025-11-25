import * as THREE from './three.module.js';
import { Player } from './player.js';

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth/window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ antialias:true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lights
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const dirLight = new THREE.DirectionalLight(0xffffff,1);
dirLight.position.set(10,20,10);
scene.add(dirLight);

// Ground
const groundGeo = new THREE.BoxGeometry(50,1,50);
const groundMat = new THREE.MeshStandardMaterial({color:0x228b22});
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.position.y = -0.5;
scene.add(ground);

// Blocks
const blockGeometry = new THREE.BoxGeometry(1,1,1);
const blockMaterial = new THREE.MeshStandardMaterial({color:0x00aaff});
const blocks = [];

// Raycaster
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Username input
let username = "Player";
const nameInput = document.createElement('input');
nameInput.type = 'text';
nameInput.placeholder = 'Enter your username';
nameInput.style.position = 'absolute';
nameInput.style.top = '50%';
nameInput.style.left = '50%';
nameInput.style.transform = 'translate(-50%,-50%)';
nameInput.style.fontSize = '20px';
nameInput.style.padding = '5px';
document.body.appendChild(nameInput);

const startBtn = document.createElement('button');
startBtn.innerText = 'Start';
startBtn.style.position = 'absolute';
startBtn.style.top = '60%';
startBtn.style.left = '50%';
startBtn.style.transform = 'translate(-50%,-50%)';
startBtn.style.fontSize = '18px';
startBtn.style.padding = '5px 10px';
document.body.appendChild(startBtn);

let player;
startBtn.onclick = () => {
    username = nameInput.value || "Player";
    document.body.removeChild(nameInput);
    document.body.removeChild(startBtn);

    player = new Player(scene, camera, username);

    // Mouse interactions
    window.addEventListener('mousedown', (event)=>{
        mouse.x = (event.clientX/window.innerWidth)*2-1;
        mouse.y = -(event.clientY/window.innerHeight)*2+1;

        raycaster.setFromCamera(mouse,camera);
        const allMeshes = [...blocks, ground];
        const intersects = raycaster.intersectObjects(allMeshes);

        if(intersects.length>0){
            const hit = intersects[0];
            if(event.button===0){
                const normal = hit.face.normal.clone();
                const pos = hit.point.clone().add(normal.multiplyScalar(0.5));
                addBlock(Math.round(pos.x), Math.round(pos.y), Math.round(pos.z));
            }else if(event.button===2){
                if(blocks.includes(hit.object)){
                    scene.remove(hit.object);
                    const index = blocks.indexOf(hit.object);
                    if(index>-1) blocks.splice(index,1);
                }
            }
        }
    });

    window.addEventListener('contextmenu', e=>e.preventDefault());
};

// Add block
function addBlock(x,y,z){
    const block = new THREE.Mesh(blockGeometry, blockMaterial.clone());
    block.position.set(x,y,z);
    scene.add(block);
    blocks.push(block);
}

// Resize
window.addEventListener('resize', ()=>{
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animate
function animate(){
    requestAnimationFrame(animate);
    if(player){
        player.update();

        // Camera follow
        const targetPos = player.playerGroup.position.clone().add(new THREE.Vector3(0,5,10));
        camera.position.lerp(targetPos, 0.1);
        camera.lookAt(player.playerGroup.position);
    }
    renderer.render(scene,camera);
}
animate();
