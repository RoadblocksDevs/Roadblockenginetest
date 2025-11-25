import * as THREE from './three.module.js';

export class Player {
  constructor(scene, camera, username = "Player") {
    this.scene = scene;
    this.camera = camera;
    this.username = username;

    const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });

    // Torso
    const torsoGeo = new THREE.BoxGeometry(0.8, 1.2, 0.4);
    this.torso = new THREE.Mesh(torsoGeo, material);
    this.torso.position.y = 1.5;

    // Head
    const headGeo = new THREE.BoxGeometry(0.6, 0.6, 0.6);
    this.head = new THREE.Mesh(headGeo, new THREE.MeshStandardMaterial({ color: 0xffcc99 }));
    this.head.position.y = 2.4;

    // Arms
    const armGeo = new THREE.BoxGeometry(0.3, 1, 0.3);
    this.leftArm = new THREE.Mesh(armGeo, material);
    this.leftArm.position.set(-0.55, 1.5, 0);
    this.rightArm = new THREE.Mesh(armGeo, material);
    this.rightArm.position.set(0.55, 1.5, 0);

    // Legs
    const legGeo = new THREE.BoxGeometry(0.3, 1, 0.3);
    this.leftLeg = new THREE.Mesh(legGeo, material);
    this.leftLeg.position.set(-0.2, 0.5, 0);
    this.rightLeg = new THREE.Mesh(legGeo, material);
    this.rightLeg.position.set(0.2, 0.5, 0);

    // Group
    this.playerGroup = new THREE.Group();
    this.playerGroup.add(this.torso, this.head, this.leftArm, this.rightArm, this.leftLeg, this.rightLeg);
    this.playerGroup.position.set(0, 0, 0);
    scene.add(this.playerGroup);

    // Name tag
    this.nameSprite = this.createNameTag(this.username);
    this.nameSprite.position.set(0, 3, 0);
    this.playerGroup.add(this.nameSprite);

    // Movement
    this.keys = {};
    this.speed = 0.15;
    this.jumpSpeed = 0.25;
    this.velocityY = 0;
    this.gravity = -0.02;
    this.onGround = true;
    this.walkCycle = 0;

    window.addEventListener('keydown', (e) => (this.keys[e.key.toLowerCase()] = true));
    window.addEventListener('keyup', (e) => (this.keys[e.key.toLowerCase()] = false));
  }

  createNameTag(text) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.font = 'Bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(text, canvas.width / 2, canvas.height / 1.3);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.needsUpdate = true;

    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(2, 0.5, 1);
    return sprite;
  }

  update() {
    let dx = 0, dz = 0;

    if (this.keys['w']) dz -= this.speed;
    if (this.keys['s']) dz += this.speed;
    if (this.keys['a']) dx -= this.speed;
    if (this.keys['d']) dx += this.speed;

    this.playerGroup.position.x += dx;
    this.playerGroup.position.z += dz;

    // Gravity & jump
    if (this.playerGroup.position.y <= 0) {
      this.playerGroup.position.y = 0;
      this.velocityY = 0;
      this.onGround = true;
      if (this.keys[' ']) this.velocityY = this.jumpSpeed;
    } else {
      this.velocityY += this.gravity;
      this.onGround = false;
    }
    this.playerGroup.position.y += this.velocityY;

    // Walk animation
    if (dx !== 0 || dz !== 0) {
      this.walkCycle += 0.1;
      this.leftLeg.rotation.x = Math.sin(this.walkCycle) * 0.5;
      this.rightLeg.rotation.x = Math.sin(this.walkCycle + Math.PI) * 0.5;
      this.leftArm.rotation.x = Math.sin(this.walkCycle + Math.PI) * 0.5;
      this.rightArm.rotation.x = Math.sin(this.walkCycle) * 0.5;
    } else {
      this.leftLeg.rotation.x = 0;
      this.rightLeg.rotation.x = 0;
      this.leftArm.rotation.x = 0;
      this.rightArm.rotation.x = 0;
      this.walkCycle = 0;
    }

    // Name tag faces camera
    this.nameSprite.lookAt(this.camera.position);
  }

  setUsername(newName) {
    this.username = newName;
    this.playerGroup.remove(this.nameSprite);
    this.nameSprite = this.createNameTag(newName);
    this.nameSprite.position.set(0, 3, 0);
    this.playerGroup.add(this.nameSprite);
  }
}
