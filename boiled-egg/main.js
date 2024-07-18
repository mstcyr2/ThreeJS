import * as THREE from 'three';

let camera, scene, renderer, bubMaterial;
let mouseX = 0, mouseY = 0;

let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;
console.log(windowHalfX, windowHalfY);

init();
animate();

function init() {
    camera = new THREE.PerspectiveCamera( 55, window.innerWidth / window.innerHeight, 2, 2000 );
    camera.position.z = 1000;
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x5c6c7a);
    scene.fog = new THREE.FogExp2( 0x000000, 0.0004 );
    const bubGeometry = new THREE.BufferGeometry();
    const vertices = [];

    const sprite = new THREE.TextureLoader().load( '/circle.png' );
    // sprite.colorSpace = THREE.SRGBColorSpace;

    for ( let i = 0; i < 5000; i ++ ) {

        const x = 2000 * Math.random() - 1000;
        const y = 2000 * Math.random() - 1000;
        const z = 2000 * Math.random() - 1000;

        vertices.push( x, y, z );

    }

    bubGeometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );

    bubMaterial = new THREE.PointsMaterial( { size: 30, sizeAttenuation: true, map: sprite, alphaTest: 0.5, transparent: true, } );
    // material.color.setHSL( 1.0, 0.3, 0.7, THREE.SRGBColorSpace );
    bubMaterial.opacity = 0.7;

    const particles = new THREE.Points( bubGeometry, bubMaterial );
    scene.add( particles );

    var light = new THREE.DirectionalLight(0xffffff, 2);
    light.position.set(0, 10, 10);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, .3));

    scene.add(egg());

    //

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    document.body.style.touchAction = 'none';
    document.body.addEventListener( 'pointermove', onPointerMove );

    //

    window.addEventListener( 'resize', onWindowResize );
}

function egg() {
    const points = [];

    for ( let deg = 0; deg <= 180; deg += 1 ) {
        const rad = Math.PI * deg / 180;
        const point = new THREE.Vector2( ( 0.72 + 0.08 * Math.cos( rad ) ) * Math.sin( rad ), - Math.cos( rad ) ); // the "egg equation"
        // console.log( point );
        points.push( point );
    }

    const eggGeometry = new THREE.LatheGeometry( points, 24 );
    const eggMaterial = new THREE.MeshPhysicalMaterial({ 
        metalness: 0, 
        roughness: 0, 
        transmission: 1
    });

    const white = new THREE.Mesh( eggGeometry, eggMaterial );
    white.name = "white";
    white.position.set(0, 0, 500);
    white.scale.set(150,150,150);

    const yolkGeometry = new THREE.SphereGeometry(75);
    const yolkMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffae00,
        metalness: 0, 
        roughness: 10,
    });

    const yolk = new THREE.Mesh( yolkGeometry, yolkMaterial );
    yolk.name = "yolk";
    yolk.position.set(0,-40,500);

    const egg = new THREE.Group();
    egg.add(white, yolk);

    return egg;
}

function onWindowResize() {

    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function onPointerMove( event ) {

    if ( event.isPrimary === false ) return;

    mouseX = event.clientX - windowHalfX;
    mouseY = event.clientY - windowHalfY;

}

//

function animate() {

    requestAnimationFrame( animate );

    render();

}

function render() {

    const time = Date.now() * 0.0005;

    camera.position.x += ( mouseX - camera.position.x );
    camera.position.y += ( - mouseY - camera.position.y ); 

    camera.lookAt( scene.position );

    for ( let i = 0; i < scene.children.length; i ++ ) {

        const object = scene.children[ i ];

        if ( object instanceof THREE.Points ) {

            object.rotation.x = -time * ( i < 4 ? i + 1 : - ( i + 1 ) );
            // object.translateY(4);
            // if (object.position.y > window.innerHeight) {
            //     object.position.y = 0;
            // }
            

        }

        if ( object instanceof THREE.Group ) {
            const white = object.getObjectByName("white");
            const yolk = object.getObjectByName("yolk");
            white.material.transmission -= 0.001;

            if (white.material.transmission <= 0) {
                white.material.transmission = 1;
            }
        }

    }

    renderer.render( scene, camera );

}